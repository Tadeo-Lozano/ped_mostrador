import { supabase } from '@/lib/supabase/client';
import type {
  MovementFilters,
  MovementWithDetails,
  PaginatedMovements,
} from '../types';

function getRange(filters: MovementFilters) {
  const from = filters.page * filters.pageSize;
  const to = from + filters.pageSize - 1;

  return { from, to };
}

export async function listMovements(
  filters: MovementFilters,
): Promise<PaginatedMovements> {
  const { from, to } = getRange(filters);
  let query = supabase
    .from('request_movements')
    .select(
      `
        *,
        requests (
          id,
          part_code,
          part_description,
          quantity,
          priority,
          status,
          requester_id,
          picker_id
        ),
        profiles (
          id,
          full_name,
          role
        )
      `,
      { count: 'exact' },
    );

  if (filters.status && filters.status !== 'all') {
    query = query.eq('new_status', filters.status);
  }

  if (filters.dateFrom) {
    query = query.gte('created_at', new Date(filters.dateFrom).toISOString());
  }

  if (filters.dateTo) {
    const dateTo = new Date(filters.dateTo);
    dateTo.setHours(23, 59, 59, 999);
    query = query.lte('created_at', dateTo.toISOString());
  }

  const userSearch = filters.userSearch?.trim();
  const partCode = filters.partCode?.trim();

  if (userSearch) {
    query = query.ilike('profiles.full_name', `%${userSearch}%`);
  }

  if (partCode) {
    query = query.ilike('requests.part_code', `%${partCode}%`);
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    throw error;
  }

  return {
    data: (data ?? []) as MovementWithDetails[],
    count: count ?? 0,
  };
}
