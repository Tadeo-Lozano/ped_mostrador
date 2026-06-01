import type { Database } from '@/lib/supabase/database.types';
import type { RequestStatus } from '@/modules/requests/types';

export type MovementRow = Database['public']['Tables']['request_movements']['Row'];

export type MovementWithDetails = MovementRow & {
  requests: {
    id: string;
    part_code: string;
    part_description: string | null;
    quantity: number;
    priority: Database['public']['Enums']['request_priority'];
    status: RequestStatus;
    requester_id: string;
    picker_id: string | null;
  } | null;
  profiles: {
    id: string;
    full_name: string;
    role: Database['public']['Enums']['app_role'];
  } | null;
};

export type MovementFilters = {
  status?: RequestStatus | 'all';
  userSearch?: string;
  partCode?: string;
  dateFrom?: string;
  dateTo?: string;
  page: number;
  pageSize: number;
};

export type PaginatedMovements = {
  data: MovementWithDetails[];
  count: number;
};
