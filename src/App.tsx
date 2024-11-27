import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { VoteButton } from './components/VoteButton';
import { StateChart } from './components/StateChart';
import { DemographicCharts } from './components/DemographicCharts';
import { DemographicModal } from './components/DemographicModal';
import { AdminPanel } from './components/AdminPanel';
import { AdminLogin } from './components/AdminLogin';
import { VoteMap } from './components/VoteMap';
import { getLocationFromIP } from './lib/supabase';

interface VoteCounts {
  [key: number]: number;
}

interface VotingOption {
  id: number;
  label: string;
  color: string;
}

interface Demographics {
  ageRange: string;
  gender: string;
}

function App() {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminMessage, setAdminMessage] = useState('');
  const [options, setOptions] = useState<VotingOption[]>([]);
  const [voteCounts, setVoteCounts] = useState<VoteCounts>({});
  const [stateVotes, setStateVotes] = useState([]);
  const [ageVotes, setAgeVotes] = useState([]);
  const [genderVotes, setGenderVotes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDemographics, setShowDemographics] = useState(true);
  const [userDemographics, setUserDemographics] = useState<Demographics | null>(null);

  useEffect(() => {
    const storedDemographics = localStorage.getItem('userDemographics');
    if (storedDemographics) {
      setUserDemographics(JSON.parse(storedDemographics));
      setShowDemographics(false);
    }
  }, []);

  const handleDemographicSubmit = (demographics: Demographics) => {
    setUserDemographics(demographics);
    localStorage.setItem('userDemographics', JSON.stringify(demographics));
    setShowDemographics(false);
  };

  const handleAdminLogin = () => {
    setShowAdminLogin(true);
  };

  const handleAdminLoginSuccess = () => {
    setShowAdminLogin(false);
    setIsAdmin(true);
  };

  const handleAdminLoginCancel = () => {
    setShowAdminLogin(false);
  };

  const fetchVoteCounts = async () => {
    try {
      const { data, error } = await supabase
        .from('votes')
        .select('option_id');
      
      if (error) throw error;
      
      const counts: VoteCounts = {};
      data?.forEach(vote => {
        counts[vote.option_id] = (counts[vote.option_id] || 0) + 1;
      });
      setVoteCounts(counts);
    } catch (error) {
      console.error('Error fetching vote counts:', error);
    }
  };

  const fetchStateVotes = async () => {
    try {
      const { data, error } = await supabase
        .from('state_votes')
        .select('*');
      
      if (error) throw error;
      
      const transformedData = data.reduce((acc: any[], curr: any) => {
        const existingState = acc.find(item => item.state === curr.state);
        if (existingState) {
          existingState[curr.label] = curr.vote_count;
        } else {
          acc.push({
            state: curr.state,
            [curr.label]: curr.vote_count
          });
        }
        return acc;
      }, []);
      
      setStateVotes(transformedData);
    } catch (error) {
      console.error('Error fetching state votes:', error);
    }
  };

  const fetchDemographicVotes = async () => {
    try {
      const [{ data: ageData, error: ageError }, { data: genderData, error: genderError }] = await Promise.all([
        supabase.from('age_votes').select('*'),
        supabase.from('gender_votes').select('*')
      ]);

      if (ageError) throw ageError;
      if (genderError) throw genderError;

      const transformedAgeData = ageData.reduce((acc: any[], curr: any) => {
        const existingAge = acc.find(item => item.age_range === curr.age_range);
        if (existingAge) {
          existingAge[curr.label] = curr.vote_count;
        } else {
          acc.push({
            age_range: curr.age_range,
            [curr.label]: curr.vote_count
          });
        }
        return acc;
      }, []);

      const transformedGenderData = genderData.reduce((acc: any[], curr: any) => {
        const existingGender = acc.find(item => item.gender === curr.gender);
        if (existingGender) {
          existingGender[curr.label] = curr.vote_count;
        } else {
          acc.push({
            gender: curr.gender,
            [curr.label]: curr.vote_count
          });
        }
        return acc;
      }, []);

      setAgeVotes(transformedAgeData);
      setGenderVotes(transformedGenderData);
    } catch (error) {
      console.error('Error fetching demographic votes:', error);
    }
  };

  const handleVote = async (optionId: number) => {
    if (!userDemographics) {
      alert('Please provide demographic information before voting.');
      setShowDemographics(true);
      return;
    }

    setIsLoading(true);
    try {
      const location = await getLocationFromIP();
      const { error } = await supabase
        .from('votes')
        .insert([{
          option_id: optionId,
          state: location.state,
          latitude: location.latitude,
          longitude: location.longitude,
          age_range: userDemographics.ageRange,
          gender: userDemographics.gender
        }]);

      if (error) throw error;

      setVoteCounts(prev => ({
        ...prev,
        [optionId]: (prev[optionId] || 0) + 1
      }));

      await Promise.all([
        fetchStateVotes(),
        fetchDemographicVotes()
      ]);
    } catch (error) {
      console.error('Error recording vote:', error);
      alert('Failed to record vote. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const { data, error } = await supabase
          .from('voting_options')
          .select('*')
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        setOptions(data || []);
      } catch (error) {
        console.error('Error fetching options:', error);
      }
    };

    const fetchAdminMessage = async () => {
      try {
        const { data, error } = await supabase
          .from('admin_messages')
          .select('message')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        if (data) setAdminMessage(data.message);
      } catch (error) {
        console.error('Error fetching admin message:', error);
      }
    };

    fetchOptions();
    fetchAdminMessage();
    fetchVoteCounts();
    fetchStateVotes();
    fetchDemographicVotes();

    const votesChannel = supabase.channel('votes-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'votes' },
        async () => {
          await Promise.all([
            fetchVoteCounts(),
            fetchStateVotes(),
            fetchDemographicVotes()
          ]);
        }
      )
      .subscribe();

    const optionsChannel = supabase.channel('options-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'voting_options' },
        fetchOptions
      )
      .subscribe();

    const messageChannel = supabase.channel('message-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'admin_messages' },
        fetchAdminMessage
      )
      .subscribe();

    return () => {
      votesChannel.unsubscribe();
      optionsChannel.unsubscribe();
      messageChannel.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {showDemographics && <DemographicModal onSubmit={handleDemographicSubmit} />}
      {showAdminLogin && (
        <AdminLogin
          onSuccess={handleAdminLoginSuccess}
          onCancel={handleAdminLoginCancel}
        />
      )}

      <div className="flex flex-col min-h-screen">
        {adminMessage && (
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white py-4 sm:py-8 animate-gradient bg-[length:200%_200%]">
            <div className="max-w-7xl mx-auto px-4">
              <h1 className="text-2xl sm:text-4xl font-bold text-center">
                {adminMessage}
              </h1>
            </div>
          </div>
        )}

        <div className="flex-grow max-w-7xl mx-auto px-4 py-4 sm:py-8 space-y-8 sm:space-y-12">
          <div className="flex justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12">
              {options.map(option => (
                <VoteButton
                  key={option.id}
                  color={option.color}
                  count={voteCounts[option.id] || 0}
                  onClick={() => handleVote(option.id)}
                  isLoading={isLoading}
                  label={option.label}
                />
              ))}
            </div>
          </div>

          {options.length > 0 && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-6">Votes by State</h2>
                  <StateChart data={stateVotes} options={options} />
                </div>
                <div className="lg:col-span-2">
                  <DemographicCharts
                    ageData={ageVotes}
                    genderData={genderVotes}
                    options={options}
                  />
                </div>
              </div>

              <VoteMap />
            </>
          )}
        </div>

        {!isAdmin && (
          <div className="border-t border-slate-200 mt-8">
            <div className="max-w-7xl mx-auto px-4 py-6 text-center">
              <button
                onClick={handleAdminLogin}
                className="text-sm text-slate-500 hover:text-slate-700 transition-colors px-4 py-2 rounded-lg border border-slate-300 hover:border-slate-400"
              >
                Admin Login
              </button>
            </div>
          </div>
        )}
      </div>

      {isAdmin && (
        <AdminPanel
          onMessageUpdate={setAdminMessage}
          onClose={() => setIsAdmin(false)}
          options={options}
        />
      )}
    </div>
  );
}

export default App;