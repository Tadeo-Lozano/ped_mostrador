import type { Database } from '@/lib/supabase/database.types';

export type RequestRow = Database['public']['Tables']['requests']['Row'];
export type RequestItemRow = Database['public']['Tables']['request_items']['Row'];
export type RequestReceiptRow =
  Database['public']['Tables']['request_receipts']['Row'];
export type RequestWithRequester = RequestRow & {
  requester: {
    id: string;
    full_name: string;
    role: Database['public']['Enums']['app_role'];
  } | null;
  request_items: RequestItemRow[];
  request_receipts?: RequestReceiptRow[];
};
export type RequestInsert = Database['public']['Tables']['requests']['Insert'];
export type RequestUpdate = Database['public']['Tables']['requests']['Update'];
export type RequestStatus = Database['public']['Enums']['request_status'];
export type RequestPriority = Database['public']['Enums']['request_priority'];
export type RequestStatusGroup = 'active' | 'receipt' | 'closed';
export type WarehouseLocation = 'arriba' | 'abajo';

export type RequestFilters = {
  status?: RequestStatus | 'all';
  priority?: RequestPriority | 'all';
  search?: string;
  statusGroup?: RequestStatusGroup;
  warehouseLocation?: WarehouseLocation | 'all';
  page: number;
  pageSize: number;
};

export type PaginatedRequests = {
  data: RequestWithRequester[];
  count: number;
};

export type CreateRequestInput = {
  items: Array<{
    partCode: string;
    partDescription: string;
    quantity: number;
    warehouseLocation: WarehouseLocation;
  }>;
  priority: RequestPriority;
  notes: string;
};

export type UpdateRequestStatusInput = {
  requestId: string;
  status: RequestStatus;
  pickerId?: string | null;
  pickerEmployeeNumber?: string;
  notes?: string;
};

export type ConfirmRequestReceiptInput = {
  requestId: string;
  pin: string;
  comment?: string;
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

export const WAREHOUSE_LOCATIONS: WarehouseLocation[] = ['arriba', 'abajo'];

export const WAREHOUSE_LABELS: Record<WarehouseLocation, string> = {
  arriba: 'Almacen arriba',
  abajo: 'Almacen abajo',
};
