import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface VoteData {
  [key: string]: string | number;
}

interface DemographicChartsProps {
  ageData: VoteData[];
  genderData: VoteData[];
  options: Array<{ label: string; color: string }>;
}

export function DemographicCharts({ ageData, genderData, options }: DemographicChartsProps) {
  const chartStyle = {
    fontSize: '12px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-6">Votes by Age Range</h2>
        <div className="h-[600px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={ageData} 
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              style={chartStyle}
            >
              <XAxis 
                dataKey="age_range"
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
                tick={{ fill: '#475569' }}
              />
              <YAxis />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '0.5rem',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Legend />
              {options.map(option => (
                <Bar
                  key={option.label}
                  dataKey={option.label}
                  stackId="votes"
                  fill={option.color}
                  name={option.label}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-6">Votes by Gender</h2>
        <div className="h-[600px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={genderData} 
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              style={chartStyle}
            >
              <XAxis 
                dataKey="gender"
                interval={0}
                tick={{ fill: '#475569' }}
              />
              <YAxis />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '0.5rem',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Legend />
              {options.map(option => (
                <Bar
                  key={option.label}
                  dataKey={option.label}
                  stackId="votes"
                  fill={option.color}
                  name={option.label}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}