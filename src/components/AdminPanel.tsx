import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { signOut, getSession } from '../lib/auth';
import { X, Plus, Trash2, LogOut, RefreshCw } from 'lucide-react';

interface AdminPanelProps {
  onMessageUpdate: (message: string) => void;
  onClose: () => void;
  options: Array<{ id: number; label: string; color: string }>;
}

export function AdminPanel({ onMessageUpdate, onClose, options }: AdminPanelProps) {
  const [message, setMessage] = useState('');
  const [newOptionLabel, setNewOptionLabel] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localOptions, setLocalOptions] = useState(options);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      const currentSession = await getSession();
      setSession(currentSession);
      if (!currentSession) {
        onClose();
      }
    };
    
    checkSession();
  }, [onClose]);

  const handleMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !session) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('admin_messages')
        .insert([{ message: message.trim() }]);

      if (error) throw error;
      onMessageUpdate(message.trim());
      setMessage('');
    } catch (error) {
      console.error('Error updating message:', error);
      alert('Failed to update message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddOption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOptionLabel.trim() || localOptions.length >= 15 || !session) return;

    setIsSubmitting(true);
    try {
      const { error, data } = await supabase
        .from('voting_options')
        .insert([{ 
          label: newOptionLabel.trim(),
          color: '#' + Math.floor(Math.random()*16777215).toString(16),
          active: true
        }])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setLocalOptions([...localOptions, data]);
      }
      setNewOptionLabel('');
    } catch (error) {
      console.error('Error adding option:', error);
      alert('Failed to add option. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteOption = async (id: number) => {
    if (!confirm('Are you sure? This will delete all votes for this option.') || !session) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('voting_options')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setLocalOptions(localOptions.filter(option => option.id !== id));
    } catch (error) {
      console.error('Error deleting option:', error);
      alert('Failed to delete option. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetVotes = async () => {
    if (!confirm('Are you sure you want to reset all votes? This action cannot be undone.') || !session) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('votes')
        .delete()
        .neq('id', 0);

      if (error) throw error;
      window.location.reload();
    } catch (error) {
      console.error('Error resetting votes:', error);
      alert('Failed to reset votes. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  if (!session) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Admin Panel</h2>
          <div className="flex gap-2">
            <button
              onClick={handleSignOut}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
              title="Sign Out"
            >
              <LogOut className="w-6 h-6" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="space-y-6 sm:space-y-8">
          <form onSubmit={handleMessageSubmit} className="space-y-3 sm:space-y-4">
            <label className="block text-sm font-medium text-slate-700">Header Message</label>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter message to display..."
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={isSubmitting || !message.trim()}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
              >
                Update Message
              </button>
            </div>
          </form>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-700">
                Voting Options ({localOptions.length}/15)
              </label>
              <span className="text-xs text-slate-500">Click the trash icon to delete an option</span>
            </div>

            <div className="space-y-3">
              {localOptions.map(option => (
                <div
                  key={option.id}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                >
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: option.color }}
                  />
                  <span className="flex-1">{option.label}</span>
                  <button
                    onClick={() => handleDeleteOption(option.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            {localOptions.length < 15 && (
              <form onSubmit={handleAddOption} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <input
                  type="text"
                  value={newOptionLabel}
                  onChange={(e) => setNewOptionLabel(e.target.value)}
                  placeholder="Enter new option label..."
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !newOptionLabel.trim()}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Option
                </button>
              </form>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200">
            <button
              onClick={handleResetVotes}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Reset All Votes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}