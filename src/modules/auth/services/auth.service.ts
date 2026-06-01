import { supabase } from '@/lib/supabase/client';
import type { AppRole, Profile } from '../types';

export async function signInWithPassword(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

export async function getProfileByUser(
  userId: string,
  fallbackEmail?: string,
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (data) {
    return data;
  }

  const fullName = fallbackEmail?.split('@')[0] || 'Usuario demo';
  const role: AppRole = 'solicitante';

  const { data: createdProfile, error: createError } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      full_name: fullName,
      role,
    })
    .select('*')
    .single();

  if (createError) {
    throw createError;
  }

  return createdProfile;
}
