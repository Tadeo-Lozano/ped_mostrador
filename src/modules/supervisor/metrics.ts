import {
  REQUEST_PRIORITIES,
  REQUEST_STATUSES,
  type RequestPriority,
  type RequestRow,
  type RequestStatus,
} from '@/modules/requests/types';
import type { SupervisorMetrics } from './types';

function minutesBetween(start: string, end: string) {
  return Math.max(0, Math.round((Date.parse(end) - Date.parse(start)) / 60000));
}

function average(values: number[]) {
  if (values.length === 0) {
    return null;
  }

  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function countStatus(requests: RequestRow[], status: RequestStatus) {
  return requests.filter((request) => request.status === status).length;
}

export function buildSupervisorMetrics(
  requests: RequestRow[],
): SupervisorMetrics {
  const byStatus = REQUEST_STATUSES.map((status) => ({
    status,
    count: countStatus(requests, status),
  }));
  const byPriority = REQUEST_PRIORITIES.map((priority) => ({
    priority,
    count: requests.filter((request) => request.priority === priority).length,
  }));
  const deliveryDurations = requests
    .filter((request) => request.delivered_at !== null)
    .map((request) =>
      minutesBetween(request.created_at, request.delivered_at ?? request.created_at),
    );
  const receptionDurations = requests
    .filter((request) => request.received_at !== null)
    .map((request) =>
      minutesBetween(request.created_at, request.received_at ?? request.created_at),
    );

  return {
    totalRequests: requests.length,
    openRequests: requests.filter((request) =>
      ['pendiente', 'en_proceso'].includes(request.status),
    ).length,
    deliveredRequests: countStatus(requests, 'surtida'),
    receivedRequests: countStatus(requests, 'recibida'),
    notFoundRequests: countStatus(requests, 'no_encontrada'),
    cancelledRequests: countStatus(requests, 'cancelada'),
    criticalRequests: requests.filter((request) => request.priority === 'critica')
      .length,
    averageDeliveryMinutes: average(deliveryDurations),
    averageReceptionMinutes: average(receptionDurations),
    byStatus,
    byPriority,
    recentRequests: requests.slice(0, 8),
  };
}

export function getStatusLabel(status: RequestStatus) {
  return status.replace('_', ' ');
}

export function getPriorityLabel(priority: RequestPriority) {
  return priority;
}
