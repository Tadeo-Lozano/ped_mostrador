import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import { useState } from 'react';

import { MovementFiltersBar } from '../components/MovementFiltersBar';
import { MovementsTable } from '../components/MovementsTable';
import { useMovements } from '../hooks/useMovements';
import type { MovementFilters } from '../types';

const initialFilters: MovementFilters = {
  status: 'all',
  userSearch: '',
  partCode: '',
  dateFrom: '',
  dateTo: '',
  page: 0,
  pageSize: 10,
};

export function MovementsHistoryPage() {
  const [filters, setFilters] = useState<MovementFilters>(initialFilters);
  const { movements, count, isLoading, error, refresh } = useMovements(filters);

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
      >
        <Box>
          <Typography variant="h4" component="h1" fontWeight={800}>
            Historial
          </Typography>
          <Typography color="text.secondary">
            Consulta auditoria de solicitudes, usuarios, estados y comentarios.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshOutlinedIcon />}
          onClick={() => void refresh()}
        >
          Actualizar
        </Button>
      </Stack>

      <MovementFiltersBar filters={filters} onChange={setFilters} />

      <MovementsTable
        movements={movements}
        count={count}
        filters={filters}
        isLoading={isLoading}
        error={error}
        onFiltersChange={setFilters}
      />
    </Stack>
  );
}
