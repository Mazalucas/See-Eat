'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { createRestaurantProfile, getRestaurantDraft } from '@/lib/firebase/restaurantUtils';
import { RestaurantProfile } from '@/lib/types/auth';
import BasicInfoForm from '@/app/components/restaurant/setup/BasicInfoForm';
import LocationForm from '@/app/components/restaurant/setup/LocationForm';
import ScheduleForm from '@/app/components/restaurant/setup/ScheduleForm';
import MenuSetupForm from '@/app/components/restaurant/setup/MenuSetupForm';
import { FaStore, FaMapMarkerAlt, FaClock, FaUtensils } from 'react-icons/fa';

const steps = [
  { id: 'basic', title: 'Información Básica', icon: FaStore },
  { id: 'location', title: 'Ubicación', icon: FaMapMarkerAlt },
  { id: 'schedule', title: 'Horarios', icon: FaClock },
  { id: 'menu', title: 'Menú', icon: FaUtensils },
];

export default function RestaurantSetup() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState('basic');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restaurantData, setRestaurantData] = useState<Partial<RestaurantProfile>>({});

  useEffect(() => {
    const loadDraft = async () => {
      if (!user) return;

      try {
        const draft = await getRestaurantDraft(user.uid);
        if (draft) {
          setRestaurantData(draft);
          // If there's a draft, set the current step to the last incomplete step
          const lastCompleteStep = steps.findIndex(step => !draft[step.id]);
          if (lastCompleteStep !== -1) {
            setCurrentStep(steps[lastCompleteStep].id);
          }
        }
      } catch (error) {
        console.error('Error loading restaurant draft:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDraft();
  }, [user]);

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleStepComplete = async (stepId: string, data: Partial<RestaurantProfile>) => {
    setSaving(true);
    try {
      const updatedData = { ...restaurantData, ...data };
      setRestaurantData(updatedData);

      // If this is the last step, create the restaurant profile
      if (stepId === 'menu') {
        const restaurantProfile: RestaurantProfile = {
          ...updatedData,
          uid: user.uid,
          email: user.email!,
          role: 'restaurant',
          status: 'pending',
          displayName: updatedData.restaurantName || '',
          createdAt: new Date(),
          updatedAt: new Date(),
          menuItems: updatedData.menuItems || [],
          reviews: [],
          ratings: {
            average: 0,
            count: 0
          }
        } as RestaurantProfile;

        await createRestaurantProfile(user.uid, restaurantProfile);
        router.push(`/restaurant/dashboard`);
      } else {
        // Move to the next step
        const currentIndex = steps.findIndex(step => step.id === stepId);
        if (currentIndex < steps.length - 1) {
          setCurrentStep(steps[currentIndex + 1].id);
        }
      }
    } catch (error) {
      console.error('Error saving restaurant data:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = (stepId: string) => {
    const currentIndex = steps.findIndex(step => step.id === stepId);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'basic':
        return (
          <BasicInfoForm
            initialData={restaurantData}
            onComplete={(data) => handleStepComplete('basic', data)}
            loading={saving}
          />
        );
      case 'location':
        return (
          <LocationForm
            initialData={restaurantData}
            onComplete={(data) => handleStepComplete('location', data)}
            onBack={() => handleBack('location')}
            loading={saving}
          />
        );
      case 'schedule':
        return (
          <ScheduleForm
            initialData={restaurantData}
            onComplete={(data) => handleStepComplete('schedule', data)}
            onBack={() => handleBack('schedule')}
            loading={saving}
          />
        );
      case 'menu':
        return (
          <MenuSetupForm
            initialData={restaurantData}
            onComplete={(data) => handleStepComplete('menu', data)}
            onBack={() => handleBack('menu')}
            loading={saving}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Configurar Restaurante</h1>
          <p className="mt-2 text-sm text-gray-600">
            Complete la información de su restaurante. Puede guardar y continuar más tarde.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <nav className="flex justify-center" aria-label="Progress">
            <ol className="space-y-6 md:flex md:space-y-0 md:space-x-8">
              {steps.map((step, index) => {
                const isCurrent = step.id === currentStep;
                const isComplete = steps.findIndex(s => s.id === currentStep) > index;

                return (
                  <li key={step.id} className="md:flex-1">
                    <div className="group flex flex-col border-l-4 border-t-4 border-b-4 md:border-l-0 md:border-t-4 py-2 pl-4 md:pl-0 md:pt-4 md:pb-0">
                      <span className={`text-xs font-semibold tracking-wide uppercase ${
                        isComplete ? 'text-blue-600' : isCurrent ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        Paso {index + 1}
                      </span>
                      <span className="text-sm font-medium flex items-center gap-2">
                        <step.icon className={`w-5 h-5 ${
                          isComplete ? 'text-blue-600' : isCurrent ? 'text-blue-600' : 'text-gray-500'
                        }`} />
                        {step.title}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>

        {/* Step Content */}
        <div className="bg-white shadow rounded-lg p-6">
          {renderStep()}
        </div>
      </div>
    </div>
  );
} 