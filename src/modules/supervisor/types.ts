import type { RequestPriority, RequestRow, RequestStatus } from '@/modules/requests/types';

export type SupervisorDashboardFilters = {
  dateFrom?: string;
  dateTo?: string;
};

export type StatusMetric = {
  status: RequestStatus;
  count: number;
};

export type PriorityMetric = {
  priority: RequestPriority;
  count: number;
};

export type SupervisorMetrics = {
  totalRequests: number;
  openRequests: number;
  deliveredRequests: number;
  receivedRequests: number;
  notFoundRequests: number;
  cancelledRequests: number;
  criticalRequests: number;
  averageDeliveryMinutes: number | null;
  averageReceptionMinutes: number | null;
  byStatus: StatusMetric[];
  byPriority: PriorityMetric[];
  recentRequests: RequestRow[];
};
