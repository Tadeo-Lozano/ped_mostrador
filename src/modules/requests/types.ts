import type { Database } from '@/lib/supabase/database.types';

export type RequestRow = Database['public']['Tables']['requests']['Row'];
export type RequestWithRequester = RequestRow & {
  requester: {
    id: string;
    full_name: string;
    role: Database['public']['Enums']['app_role'];
  } | null;
};
export type RequestInsert = Database['public']['Tables']['requests']['Insert'];
export type RequestUpdate = Database['public']['Tables']['requests']['Update'];
export type RequestStatus = Database['public']['Enums']['request_status'];
export type RequestPriority = Database['public']['Enums']['request_priority'];
export type RequestStatusGroup = 'active' | 'closed';

export type RequestFilters = {
  status?: RequestStatus | 'all';
  priority?: RequestPriority | 'all';
  search?: string;
  statusGroup?: RequestStatusGroup;
  page: number;
  pageSize: number;
};

export type PaginatedRequests = {
  data: RequestWithRequester[];
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
