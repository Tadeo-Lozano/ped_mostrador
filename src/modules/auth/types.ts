import type { Session, User } from '@supabase/supabase-js';

import type { Database } from '@/lib/supabase/database.types';

export type AppRole = Database['public']['Enums']['app_role'];

export type Profile = Database['public']['Tables']['profiles']['Row'];

export type AuthState = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
};

export type AuthContextValue = AuthState & {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};
