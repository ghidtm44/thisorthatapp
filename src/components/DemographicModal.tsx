import React, { useState } from 'react';
import { X } from 'lucide-react';

interface DemographicModalProps {
  onSubmit: (demographics: { ageRange: string; gender: string }) => void;
}

export function DemographicModal({ onSubmit }: DemographicModalProps) {
  const [ageRange, setAgeRange] = useState('18-24');
  const [gender, setGender] = useState('Other');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ageRange, gender });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Welcome!</h2>
        <p className="text-slate-600 mb-6">
          Please provide some anonymous demographic information to help us better understand voting patterns.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="age-range" className="block text-sm font-medium text-slate-700 mb-2">
              Age Range
            </label>
            <select
              id="age-range"
              value={ageRange}
              onChange={(e) => setAgeRange(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="18-24">18-24</option>
              <option value="25-34">25-34</option>
              <option value="35-44">35-44</option>
              <option value="45-54">45-54</option>
              <option value="55-64">55-64</option>
              <option value="65+">65 and older</option>
            </select>
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-slate-700 mb-2">
              Gender
            </label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other/Non-disclosed</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Continue to Site
          </button>
        </form>
      </div>
    </div>
  );
}