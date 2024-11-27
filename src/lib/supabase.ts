import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Environment variables schema
const envSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
});

// Validate environment variables
const env = envSchema.parse({
  SUPABASE_URL: 'https://bqysmdfcpozlaoiaonzv.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxeXNtZGZjcG96bGFvaWFvbnp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI2NDEwNzAsImV4cCI6MjA0ODIxNzA3MH0.SiDu0CtZdUJ46FqcwIwGeXQvVXLO5NtWiEG_pLwCzyo',
});

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

export async function handleSupabaseError(error: unknown) {
  console.error('Supabase error:', error);
  if (error instanceof Error) {
    return error.message;
  }
  return 'Database operation failed. Please try again later.';
}

const fallbackLocations = [
  { state: 'New York', latitude: 40.7128, longitude: -74.0060 },
  { state: 'California', latitude: 36.7783, longitude: -119.4179 },
  { state: 'Texas', latitude: 31.9686, longitude: -99.9018 },
  { state: 'Florida', latitude: 27.6648, longitude: -81.5158 },
  { state: 'Illinois', latitude: 40.6331, longitude: -89.3985 }
];

export async function getLocationFromIP() {
  try {
    const services = [
      'https://ipapi.co/json/',
      'https://ip.city/json/',
      'https://ipwho.is/'
    ];

    for (const service of services) {
      try {
        const response = await fetch(service);
        if (!response.ok) continue;
        
        const data = await response.json();
        
        const location = {
          state: data.region || data.region_name || data.state || 'Unknown',
          latitude: parseFloat(data.latitude) || 0,
          longitude: parseFloat(data.longitude) || 0
        };

        if (location.state !== 'Unknown' && 
            !isNaN(location.latitude) && 
            !isNaN(location.longitude) &&
            Math.abs(location.latitude) <= 90 &&
            Math.abs(location.longitude) <= 180) {
          return location;
        }
      } catch (error) {
        console.warn(`Failed to fetch location from ${service}:`, error);
        continue;
      }
    }

    const fallbackLocation = fallbackLocations[Math.floor(Math.random() * fallbackLocations.length)];
    console.warn('Using fallback location:', fallbackLocation);
    return fallbackLocation;

  } catch (error) {
    console.error('Error fetching location:', error);
    return fallbackLocations[Math.floor(Math.random() * fallbackLocations.length)];
  }
}