'use client';

import { useState } from 'react';
import { RestaurantProfile } from '@/lib/types/auth';
import { saveRestaurantDraft } from '@/lib/firebase/restaurantUtils';
import { useAuth } from '@/lib/hooks/useAuth';

interface ScheduleFormProps {
  initialData: Partial<RestaurantProfile>;
  onComplete: (data: Partial<RestaurantProfile>) => void;
  onBack: () => void;
  loading: boolean;
}

const DAYS = [
  { id: 'monday', label: 'Lunes' },
  { id: 'tuesday', label: 'Martes' },
  { id: 'wednesday', label: 'Miércoles' },
  { id: 'thursday', label: 'Jueves' },
  { id: 'friday', label: 'Viernes' },
  { id: 'saturday', label: 'Sábado' },
  { id: 'sunday', label: 'Domingo' },
];

const DEFAULT_SCHEDULE = {
  open: '09:00',
  close: '22:00',
  closed: false,
};

type DaySchedule = {
  open: string;
  close: string;
  closed: boolean;
};

type ScheduleState = {
  schedule: {
    [key: string]: DaySchedule;
  };
};

export default function ScheduleForm({ initialData, onComplete, onBack, loading }: ScheduleFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<ScheduleState>({
    schedule: DAYS.reduce((acc, day) => ({
      ...acc,
      [day.id]: {
        open: initialData.schedule?.[day.id]?.open || DEFAULT_SCHEDULE.open,
        close: initialData.schedule?.[day.id]?.close || DEFAULT_SCHEDULE.close,
        closed: initialData.schedule?.[day.id]?.closed || DEFAULT_SCHEDULE.closed,
      },
    }), {}),
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setError('');

    try {
      // Validar horarios
      const invalidSchedules = Object.entries(formData.schedule).filter(([_, schedule]) => {
        if (schedule.closed) return false;
        return !schedule.open || !schedule.close;
      });

      if (invalidSchedules.length > 0) {
        setError('Por favor complete los horarios de apertura y cierre para los días que el restaurante está abierto');
        return;
      }

      // Guardar borrador
      await saveRestaurantDraft(user.uid, { schedule: formData.schedule });

      // Continuar al siguiente paso
      onComplete({ schedule: formData.schedule });
    } catch (err) {
      setError('Error al guardar la información');
      console.error('Error saving schedule info:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleScheduleChange = (day: string, field: keyof DaySchedule, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: {
          ...prev.schedule[day],
          [field]: value,
        },
      },
    }));
  };

  const isLoading = loading || saving;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Horario del Restaurante</h2>
        
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {DAYS.map((day) => (
            <div key={day.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="w-full sm:w-32">
                  <span className="text-base font-medium text-gray-900">{day.label}</span>
                </div>
                
                <div className="flex-1 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:space-x-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.schedule[day.id].closed}
                      onChange={(e) => handleScheduleChange(day.id, 'closed', e.target.checked)}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">Cerrado</span>
                  </label>

                  {!formData.schedule[day.id].closed && (
                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
                      <div className="flex items-center space-x-3">
                        <label htmlFor={`${day.id}-open`} className="text-sm font-medium text-gray-700 min-w-[70px]">
                          Apertura
                        </label>
                        <input
                          type="time"
                          id={`${day.id}-open`}
                          value={formData.schedule[day.id].open}
                          onChange={(e) => handleScheduleChange(day.id, 'open', e.target.value)}
                          className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                          required={!formData.schedule[day.id].closed}
                        />
                      </div>

                      <div className="flex items-center space-x-3">
                        <label htmlFor={`${day.id}-close`} className="text-sm font-medium text-gray-700 min-w-[70px]">
                          Cierre
                        </label>
                        <input
                          type="time"
                          id={`${day.id}-close`}
                          value={formData.schedule[day.id].close}
                          onChange={(e) => handleScheduleChange(day.id, 'close', e.target.value)}
                          className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                          required={!formData.schedule[day.id].closed}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6">
          <button
            type="button"
            onClick={onBack}
            className="w-full sm:w-auto px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Atrás
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full sm:w-auto px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Guardando...' : 'Continuar'}
          </button>
        </div>
      </form>
    </div>
  );
} 