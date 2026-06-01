import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

import type { SupervisorDashboardFilters } from '../types';

type DashboardFiltersProps = {
  filters: SupervisorDashboardFilters;
  onChange: (filters: SupervisorDashboardFilters) => void;
  onRefresh: () => void;
};

export function DashboardFilters({
  filters,
  onChange,
  onRefresh,
}: DashboardFiltersProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        p: 2,
      }}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          label="Desde"
          type="date"
          value={filters.dateFrom ?? ''}
          onChange={(event) =>
            onChange({ ...filters, dateFrom: event.target.value })
          }
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Hasta"
          type="date"
          value={filters.dateTo ?? ''}
          onChange={(event) =>
            onChange({ ...filters, dateTo: event.target.value })
          }
          InputLabelProps={{ shrink: true }}
        />
        <Button variant="outlined" onClick={onRefresh}>
          Actualizar
        </Button>
      </Stack>
    </Paper>
  );
}
