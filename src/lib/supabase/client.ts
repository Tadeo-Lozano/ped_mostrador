import { createClient } from '@supabase/supabase-js';

import { env } from '@/config/env';
import type { Database } from './database.types';

const fallbackSupabaseUrl = 'http://localhost:54321';
const fallbackSupabaseAnonKey = 'missing-supabase-anon-key';

export const supabase = createClient<Database>(
  env.supabaseUrl || fallbackSupabaseUrl,
  env.supabaseAnonKey || fallbackSupabaseAnonKey,
);
