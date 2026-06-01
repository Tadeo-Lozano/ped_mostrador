import { supabase } from '@/lib/supabase/client';
import type {
  CreateRequestInput,
  PaginatedRequests,
  RequestFilters,
  RequestRow,
  RequestStatus,
  UpdateRequestStatusInput,
} from '../types';

function getRange(filters: RequestFilters) {
  const from = filters.page * filters.pageSize;
  const to = from + filters.pageSize - 1;

  return { from, to };
}

export async function createRequest(
  requesterId: string,
  input: CreateRequestInput,
): Promise<RequestRow> {
  const { data, error } = await supabase
    .from('requests')
    .insert({
      requester_id: requesterId,
      part_code: input.partCode.trim().toUpperCase(),
      part_description: input.partDescription.trim() || null,
      quantity: input.quantity,
      priority: input.priority,
      notes: input.notes.trim() || null,
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function listMyRequests(
  requesterId: string,
  filters: RequestFilters,
): Promise<PaginatedRequests> {
  const { from, to } = getRange(filters);
  let query = supabase
    .from('requests')
    .select('*', { count: 'exact' })
    .eq('requester_id', requesterId);

  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  if (filters.priority && filters.priority !== 'all') {
    query = query.eq('priority', filters.priority);
  }

  const search = filters.search?.trim();

  if (search) {
    query = query.or(
      `part_code.ilike.%${search}%,part_description.ilike.%${search}%`,
    );
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    throw error;
  }

  return {
    data: data ?? [],
    count: count ?? 0,
  };
}

export async function listOperationalRequests(
  filters: RequestFilters,
): Promise<PaginatedRequests> {
  const { from, to } = getRange(filters);
  let query = supabase
    .from('requests')
    .select('*', { count: 'exact' })
    .in('status', ['pendiente', 'en_proceso', 'surtida', 'no_encontrada']);

  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  if (filters.priority && filters.priority !== 'all') {
    query = query.eq('priority', filters.priority);
  }

  const search = filters.search?.trim();

  if (search) {
    query = query.or(
      `part_code.ilike.%${search}%,part_description.ilike.%${search}%`,
    );
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    throw error;
  }

  return {
    data: data ?? [],
    count: count ?? 0,
  };
}

export async function updateRequestStatus({
  requestId,
  status,
  pickerId,
  notes,
}: UpdateRequestStatusInput): Promise<RequestRow> {
  const updatePayload: {
    status: RequestStatus;
    picker_id?: string | null;
    delivered_at?: string | null;
    received_at?: string | null;
    notes?: string | null;
  } = {
    status,
  };

  if (pickerId !== undefined) {
    updatePayload.picker_id = pickerId;
  }

  if (notes !== undefined) {
    updatePayload.notes = notes.trim() || null;
  }

  if (status === 'surtida') {
    updatePayload.delivered_at = new Date().toISOString();
  }

  if (status === 'recibida') {
    updatePayload.received_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('requests')
    .update(updatePayload)
    .eq('id', requestId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}
