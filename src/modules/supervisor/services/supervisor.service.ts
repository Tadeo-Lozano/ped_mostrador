import { supabase } from '@/lib/supabase/client';
import type { SupervisorDashboardFilters, SupervisorMetrics } from '../types';
import {
  buildSupervisorMetrics,
  getPriorityLabel,
  getStatusLabel,
} from '../metrics';

export async function getSupervisorMetrics(
  filters: SupervisorDashboardFilters,
): Promise<SupervisorMetrics> {
  let query = supabase.from('requests').select('*');

  if (filters.dateFrom) {
    query = query.gte('created_at', new Date(filters.dateFrom).toISOString());
  }

  if (filters.dateTo) {
    const dateTo = new Date(filters.dateTo);
    dateTo.setHours(23, 59, 59, 999);
    query = query.lte('created_at', dateTo.toISOString());
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return buildSupervisorMetrics(data ?? []);
}

export { getPriorityLabel, getStatusLabel };
