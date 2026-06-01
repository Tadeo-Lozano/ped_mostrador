import AssignmentLateOutlinedIcon from '@mui/icons-material/AssignmentLateOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import PriorityHighOutlinedIcon from '@mui/icons-material/PriorityHighOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

import { DashboardFilters } from '../components/DashboardFilters';
import { MetricBars } from '../components/MetricBars';
import { MetricCard } from '../components/MetricCard';
import { RecentRequestsTable } from '../components/RecentRequestsTable';
import { getPriorityLabel, getStatusLabel } from '../services/supervisor.service';
import { useSupervisorMetrics } from '../hooks/useSupervisorMetrics';
import type { SupervisorDashboardFilters } from '../types';

const initialFilters: SupervisorDashboardFilters = {
  dateFrom: '',
  dateTo: '',
};

function formatMinutes(value: number | null) {
  if (value === null) {
    return '-';
  }

  if (value < 60) {
    return `${value} min`;
  }

  const hours = Math.floor(value / 60);
  const minutes = value % 60;

  return `${hours} h ${minutes} min`;
}

export function SupervisorDashboardPage() {
  const [filters, setFilters] =
    useState<SupervisorDashboardFilters>(initialFilters);
  const { metrics, isLoading, error, refresh } = useSupervisorMetrics(filters);

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" component="h1" fontWeight={800}>
          Panel supervisor
        </Typography>
        <Typography color="text.secondary">
          Monitorea volumen, estados, prioridades y tiempos operativos.
        </Typography>
      </Box>

      <DashboardFilters
        filters={filters}
        onChange={setFilters}
        onRefresh={() => void refresh()}
      />

      {error && <Alert severity="error">{error}</Alert>}

      {isLoading && (
        <Stack alignItems="center" spacing={2} sx={{ py: 6 }}>
          <CircularProgress size={32} />
          <Typography color="text.secondary">Cargando metricas</Typography>
        </Stack>
      )}

      {!isLoading && metrics && (
        <>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                lg: 'repeat(4, minmax(0, 1fr))',
              },
              gap: 2,
            }}
          >
            <Box>
              <MetricCard
                title="Solicitudes"
                value={metrics.totalRequests}
                helper={`${metrics.openRequests} abiertas`}
                icon={<Inventory2OutlinedIcon color="primary" />}
              />
            </Box>
            <Box>
              <MetricCard
                title="Recibidas"
                value={metrics.receivedRequests}
                helper={`${metrics.deliveredRequests} surtidas pendientes de recibir`}
                icon={<AssignmentTurnedInOutlinedIcon color="success" />}
              />
            </Box>
            <Box>
              <MetricCard
                title="Criticas"
                value={metrics.criticalRequests}
                helper="Prioridad critica"
                icon={<PriorityHighOutlinedIcon color="error" />}
              />
            </Box>
            <Box>
              <MetricCard
                title="Sin surtir"
                value={metrics.notFoundRequests + metrics.cancelledRequests}
                helper={`${metrics.notFoundRequests} no encontradas, ${metrics.cancelledRequests} canceladas`}
                icon={<AssignmentLateOutlinedIcon color="warning" />}
              />
            </Box>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
              gap: 2,
            }}
          >
            <Box>
              <MetricCard
                title="Tiempo a surtir"
                value={formatMinutes(metrics.averageDeliveryMinutes)}
                helper="Promedio desde creacion hasta surtido"
                icon={<ScheduleOutlinedIcon color="primary" />}
              />
            </Box>
            <Box>
              <MetricCard
                title="Tiempo a recibir"
                value={formatMinutes(metrics.averageReceptionMinutes)}
                helper="Promedio desde creacion hasta recepcion"
                icon={<ScheduleOutlinedIcon color="secondary" />}
              />
            </Box>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
              gap: 2,
            }}
          >
            <Box>
              <MetricBars
                title="Solicitudes por estado"
                items={metrics.byStatus.map((item) => ({
                  label: getStatusLabel(item.status),
                  value: item.count,
                }))}
              />
            </Box>
            <Box>
              <MetricBars
                title="Solicitudes por prioridad"
                items={metrics.byPriority.map((item) => ({
                  label: getPriorityLabel(item.priority),
                  value: item.count,
                }))}
              />
            </Box>
          </Box>

          <Stack spacing={2}>
            <Typography variant="h6" fontWeight={800}>
              Solicitudes recientes
            </Typography>
            <RecentRequestsTable requests={metrics.recentRequests} />
          </Stack>
        </>
      )}
    </Stack>
  );
}
