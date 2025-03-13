'use client';

import { useState } from 'react';
import { RestaurantProfile } from '@/lib/types/auth';
import { updateRestaurantProfile } from '@/lib/firebase/restaurantUtils';
import { FaSave } from 'react-icons/fa';

interface ScheduleFormProps {
  restaurant: RestaurantProfile;
  onUpdate: (updatedData: Partial<RestaurantProfile>) => void;
}

interface DaySchedule {
  open: string;
  close: string;
  closed: boolean;
}

interface WeekSchedule {
  [key: string]: DaySchedule;
}

const DAYS_OF_WEEK = [
  { id: 'monday', label: 'Lunes' },
  { id: 'tuesday', label: 'Martes' },
  { id: 'wednesday', label: 'Miércoles' },
  { id: 'thursday', label: 'Jueves' },
  { id: 'friday', label: 'Viernes' },
  { id: 'saturday', label: 'Sábado' },
  { id: 'sunday', label: 'Domingo' },
] as const;

export default function ScheduleForm({ restaurant, onUpdate }: ScheduleFormProps) {
  const [schedule, setSchedule] = useState<WeekSchedule>(
    DAYS_OF_WEEK.reduce((acc, day) => ({
      ...acc,
      [day.id]: restaurant.schedule?.[day.id] || {
        open: '09:00',
        close: '22:00',
        closed: true,
      },
    }), {} as WeekSchedule)
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      await updateRestaurantProfile(restaurant.uid, { schedule });
      onUpdate({ schedule });
      setSuccess(true);
    } catch (err) {
      console.error('Error updating schedule:', err);
      setError('Error al guardar los horarios');
    } finally {
      setSaving(false);
    }
  };

  const handleScheduleChange = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 text-green-700 rounded-md">
          Horarios guardados correctamente
        </div>
      )}

      <div className="grid gap-6">
        {DAYS_OF_WEEK.map(day => (
          <div key={day.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-32">
              <span className="text-gray-900 font-medium">{day.label}</span>
            </div>
            
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={!schedule[day.id].closed}
                onChange={(e) => handleScheduleChange(day.id, 'closed', !e.target.checked)}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-gray-900">Abierto</span>
            </label>

            <div className="flex items-center space-x-2">
              <input
                type="time"
                value={schedule[day.id].open}
                onChange={(e) => handleScheduleChange(day.id, 'open', e.target.value)}
                disabled={schedule[day.id].closed}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 disabled:bg-gray-100 disabled:text-gray-500"
              />
              <span className="text-gray-900">a</span>
              <input
                type="time"
                value={schedule[day.id].close}
                onChange={(e) => handleScheduleChange(day.id, 'close', e.target.value)}
                disabled={schedule[day.id].closed}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 disabled:bg-gray-100 disabled:text-gray-500"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            saving ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <FaSave className="mr-2" />
          {saving ? 'Guardando...' : 'Guardar Horarios'}
        </button>
      </div>
    </form>
  );
} 