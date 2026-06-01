import type { Database } from '@/lib/supabase/database.types';

export type RequestRow = Database['public']['Tables']['requests']['Row'];
export type RequestInsert = Database['public']['Tables']['requests']['Insert'];
export type RequestUpdate = Database['public']['Tables']['requests']['Update'];
export type RequestStatus = Database['public']['Enums']['request_status'];
export type RequestPriority = Database['public']['Enums']['request_priority'];

export type RequestFilters = {
  status?: RequestStatus | 'all';
  priority?: RequestPriority | 'all';
  search?: string;
  page: number;
  pageSize: number;
};

export type PaginatedRequests = {
  data: RequestRow[];
  count: number;
};

export type CreateRequestInput = {
  partCode: string;
  partDescription: string;
  quantity: number;
  priority: RequestPriority;
  notes: string;
};

export type UpdateRequestStatusInput = {
  requestId: string;
  status: RequestStatus;
  pickerId?: string | null;
  notes?: string;
};

export const REQUEST_STATUSES: RequestStatus[] = [
  'pendiente',
  'en_proceso',
  'surtida',
  'recibida',
  'no_encontrada',
  'cancelada',
];

export const REQUEST_PRIORITIES: RequestPriority[] = [
  'normal',
  'urgente',
  'critica',
];
