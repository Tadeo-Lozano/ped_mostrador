import { useCallback, useEffect, useState } from 'react';

import { listMovements } from '../services/movements.service';
import type { MovementFilters, PaginatedMovements } from '../types';

type UseMovementsResult = {
  movements: PaginatedMovements['data'];
  count: number;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useMovements(filters: MovementFilters): UseMovementsResult {
  const [movements, setMovements] = useState<PaginatedMovements['data']>([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const status = filters.status;
  const userSearch = filters.userSearch;
  const partCode = filters.partCode;
  const dateFrom = filters.dateFrom;
  const dateTo = filters.dateTo;
  const page = filters.page;
  const pageSize = filters.pageSize;

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await listMovements({
        status,
        userSearch,
        partCode,
        dateFrom,
        dateTo,
        page,
        pageSize,
      });

      setMovements(result.data);
      setCount(result.count);
    } catch (movementError) {
      setError(
        movementError instanceof Error
          ? movementError.message
          : 'No se pudo cargar el historial.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [dateFrom, dateTo, page, pageSize, partCode, status, userSearch]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refresh();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [refresh]);

  return {
    movements,
    count,
    isLoading,
    error,
    refresh,
  };
}
