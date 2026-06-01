import type { PropsWithChildren } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Session } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/config/env';
import { formatError } from '@/lib/errors/formatError';
import {
  getProfileByUser,
  signInWithPassword,
  signOut as signOutService,
} from '../services/auth.service';
import type { AuthState, Profile } from '../types';
import { AuthContext } from './auth-context';

const initialState: AuthState = {
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  error: null,
};

export function AuthProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AuthState>(initialState);
  const loadedSessionKeyRef = useRef<string | null>(null);

  const loadProfile = useCallback(async (session: Session | null) => {
    if (!session) {
      loadedSessionKeyRef.current = null;
      setState({
        session: null,
        user: null,
        profile: null,
        isLoading: false,
        error: null,
      });
      return;
    }

    const sessionKey = `${session.user.id}:${session.access_token}`;

    if (loadedSessionKeyRef.current === sessionKey) {
      return;
    }

    loadedSessionKeyRef.current = sessionKey;

    try {
      const profile = await getProfileByUser(
        session.user.id,
        session.user.email,
      );

      setState({
        session,
        user: session.user,
        profile,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState({
        session,
        user: session.user,
        profile: null,
        isLoading: false,
        error: formatError(error, 'No se pudo cargar el perfil del usuario.'),
      });
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setState({
        ...initialState,
        isLoading: false,
        error: 'Faltan VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.',
      });
      return undefined;
    }

    let isMounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!isMounted) {
        return;
      }

      if (error) {
        setState({
          ...initialState,
          isLoading: false,
          error: error.message,
        });
        return;
      }

      void loadProfile(data.session);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        void loadProfile(session);
      },
    );

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    setState((current) => ({ ...current, isLoading: true, error: null }));

    try {
      await signInWithPassword(email, password);
    } catch (error) {
      setState((current) => ({
        ...current,
        isLoading: false,
        error: formatError(error, 'No se pudo iniciar sesión.'),
      }));
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    await signOutService();
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!state.session) {
      return;
    }

    const profile: Profile | null = await getProfileByUser(
      state.session.user.id,
      state.session.user.email,
    );
    setState((current) => ({ ...current, profile }));
  }, [state.session]);

  const value = useMemo(
    () => ({
      ...state,
      signIn,
      signOut,
      refreshProfile,
    }),
    [refreshProfile, signIn, signOut, state],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
