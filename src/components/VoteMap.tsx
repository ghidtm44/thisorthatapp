import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../lib/supabase';

interface VoteLocation {
  id: number;
  option_id: number;
  latitude: number;
  longitude: number;
  state: string;
  created_at: string;
  voting_options: {
    color: string;
    label: string;
  };
}

export function VoteMap() {
  const [voteLocations, setVoteLocations] = useState<VoteLocation[]>([]);

  useEffect(() => {
    const fetchVoteLocations = async () => {
      try {
        const { data, error } = await supabase
          .from('votes')
          .select(`
            id,
            option_id,
            latitude,
            longitude,
            state,
            created_at,
            voting_options!inner (
              color,
              label
            )
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setVoteLocations(data || []);
      } catch (error) {
        console.error('Error fetching vote locations:', error);
      }
    };

    fetchVoteLocations();

    const channel = supabase.channel('vote-locations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes'
        },
        () => {
          fetchVoteLocations();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return (
    <div className="w-full h-[400px] sm:h-[600px] bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-3 sm:p-4">
      <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2 sm:mb-4">Global Vote Distribution</h2>
      <MapContainer
        center={[20, 0]}
        zoom={2}
        className="w-full h-[320px] sm:h-[500px] rounded-xl"
        scrollWheelZoom={true}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {voteLocations.map((vote) => (
          <CircleMarker
            key={`${vote.id}-${vote.created_at}`}
            center={[vote.latitude, vote.longitude]}
            radius={4}
            pathOptions={{
              color: vote.voting_options.color,
              fillColor: vote.voting_options.color,
              fillOpacity: 0.7
            }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{vote.voting_options.label}</p>
                <p className="text-gray-600">{vote.state}</p>
                <p className="text-gray-500 text-xs">
                  {new Date(vote.created_at).toLocaleString()}
                </p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}