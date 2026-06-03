import { supabase } from '@/lib/supabase/client';
import type {
  CreateRequestInput,
  ConfirmRequestReceiptInput,
  PaginatedRequests,
  RequestFilters,
  RequestRow,
  RequestStatus,
  RequestWithRequester,
  UpdateRequestStatusInput,
} from '../types';

function getRange(filters: RequestFilters) {
  const from = filters.page * filters.pageSize;
  const to = from + filters.pageSize - 1;

  return { from, to };
}

const ACTIVE_OPERATIONAL_STATUSES: RequestStatus[] = ['pendiente', 'en_proceso'];
const RECEIPT_OPERATIONAL_STATUSES: RequestStatus[] = ['surtida'];
const CLOSED_OPERATIONAL_STATUSES: RequestStatus[] = [
  'recibida',
  'no_encontrada',
  'cancelada',
];

const REQUEST_WITH_REQUESTER_SELECT = `
  *,
  requester:profiles!requests_requester_id_fkey (
    id,
    full_name,
    role
  ),
  request_items (
    id,
    request_id,
    part_code,
    part_description,
    quantity,
    delivered_quantity,
    received_quantity,
    created_at
  ),
  request_receipts (
    id,
    request_id,
    received_by,
    delivered_by,
    method,
    confirmed_quantity,
    comment,
    created_at
  )
`;

export async function createRequest(
  _requesterId: string,
  input: CreateRequestInput,
): Promise<RequestRow> {
  const { data, error } = await supabase.rpc('create_request_with_items', {
    p_priority: input.priority,
    p_notes: input.notes.trim() || null,
    p_items: input.items,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function confirmRequestReceipt({
  requestId,
  pin,
  comment,
}: ConfirmRequestReceiptInput): Promise<RequestRow> {
  const { data, error } = await supabase.rpc('confirm_request_receipt', {
    p_request_id: requestId,
    p_pin: pin,
    p_comment: comment?.trim() || null,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function setMyReceiptPin(pin: string): Promise<void> {
  const { error } = await supabase.rpc('set_my_receipt_pin', {
    pin,
  });

  if (error) {
    throw error;
  }
}

export async function listMyRequests(
  requesterId: string,
  filters: RequestFilters,
): Promise<PaginatedRequests> {
  const { from, to } = getRange(filters);
  let query = supabase
    .from('requests')
    .select(REQUEST_WITH_REQUESTER_SELECT, { count: 'exact' })
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
    data: (data ?? []) as RequestWithRequester[],
    count: count ?? 0,
  };
}

export async function listOperationalRequests(
  filters: RequestFilters,
): Promise<PaginatedRequests> {
  const { from, to } = getRange(filters);
  const baseStatuses =
    filters.statusGroup === 'closed'
      ? CLOSED_OPERATIONAL_STATUSES
      : filters.statusGroup === 'receipt'
        ? RECEIPT_OPERATIONAL_STATUSES
      : ACTIVE_OPERATIONAL_STATUSES;
  let query = supabase
    .from('requests')
    .select(REQUEST_WITH_REQUESTER_SELECT, { count: 'exact' })
    .in('status', baseStatuses);

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
    data: (data ?? []) as RequestWithRequester[],
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
