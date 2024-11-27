import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface VoteData {
  state: string;
  [key: string]: string | number;
}

interface StateChartProps {
  data: VoteData[];
  options: Array<{ label: string; color: string }>;
}

export function StateChart({ data, options }: StateChartProps) {
  const chartStyle = {
    fontSize: '12px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  return (
    <div className="h-[600px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} 
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          style={chartStyle}
        >
          <XAxis 
            dataKey="state" 
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
  );
}