import { useCallback, useEffect, useState } from 'react';

import type { PaginatedRequests, RequestFilters } from '../types';
import { listMyRequests, listOperationalRequests } from '../services/requests.service';

type RequestsScope =
  | {
      type: 'mine';
      requesterId: string;
    }
  | {
      type: 'operational';
    };

type UseRequestsResult = {
  requests: PaginatedRequests['data'];
  count: number;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useRequests(
  scope: RequestsScope,
  filters: RequestFilters,
): UseRequestsResult {
  const [requests, setRequests] = useState<PaginatedRequests['data']>([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scopeType = scope.type;
  const requesterId = scope.type === 'mine' ? scope.requesterId : undefined;
  const status = filters.status;
  const statusGroup = filters.statusGroup;
  const warehouseLocation = filters.warehouseLocation;
  const priority = filters.priority;
  const search = filters.search;
  const page = filters.page;
  const pageSize = filters.pageSize;

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const currentFilters: RequestFilters = {
        status,
        statusGroup,
        warehouseLocation,
        priority,
        search,
        page,
        pageSize,
      };
      const result =
        scopeType === 'mine' && requesterId
          ? await listMyRequests(requesterId, currentFilters)
          : await listOperationalRequests(currentFilters);

      setRequests(result.data);
      setCount(result.count);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No se pudieron cargar las solicitudes.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    page,
    pageSize,
    priority,
    requesterId,
    scopeType,
    search,
    status,
    statusGroup,
    warehouseLocation,
  ]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refresh();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [refresh]);

  return {
    requests,
    count,
    isLoading,
    error,
    refresh,
  };
}
