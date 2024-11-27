import { supabase } from './supabase';

export async function signInWithPassword(email: string, password: string): Promise<boolean> {
  try {
    const { data: { user }, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return !!user;
  } catch (error) {
    console.error('Authentication error:', error);
    return false;
  }
}

export async function signOut() {
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Sign out error:', error);
  }
}

export async function getSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error) {
    console.error('Session error:', error);
    return null;
  }
}