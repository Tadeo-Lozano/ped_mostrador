import { useCallback, useEffect, useState } from 'react';

import { getSupervisorMetrics } from '../services/supervisor.service';
import type { SupervisorDashboardFilters, SupervisorMetrics } from '../types';

type UseSupervisorMetricsResult = {
  metrics: SupervisorMetrics | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useSupervisorMetrics(
  filters: SupervisorDashboardFilters,
): UseSupervisorMetricsResult {
  const [metrics, setMetrics] = useState<SupervisorMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dateFrom = filters.dateFrom;
  const dateTo = filters.dateTo;

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getSupervisorMetrics({ dateFrom, dateTo });
      setMetrics(result);
    } catch (metricsError) {
      setError(
        metricsError instanceof Error
          ? metricsError.message
          : 'No se pudieron cargar las metricas.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refresh();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [refresh]);

  return {
    metrics,
    isLoading,
    error,
    refresh,
  };
}
