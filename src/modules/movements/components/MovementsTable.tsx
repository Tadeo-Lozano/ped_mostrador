import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { RequestStatusChip } from '@/modules/requests/components/RequestStatusChip';
import type { MovementFilters, MovementWithDetails } from '../types';

type MovementsTableProps = {
  movements: MovementWithDetails[];
  count: number;
  filters: MovementFilters;
  isLoading: boolean;
  error: string | null;
  onFiltersChange: (filters: MovementFilters) => void;
};

const actionLabels: Record<string, string> = {
  created: 'Creacion',
  started: 'Inicio',
  delivered: 'Surtida',
  received: 'Recibida',
  not_found: 'No encontrada',
  cancelled: 'Cancelada',
  status_changed: 'Cambio',
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(new Date(value));
}

export function MovementsTable({
  movements,
  count,
  filters,
  isLoading,
  error,
  onFiltersChange,
}: MovementsTableProps) {
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <TableContainer>
        <Table sx={{ minWidth: 1050 }} aria-label="Historial de movimientos">
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Codigo</TableCell>
              <TableCell>Accion</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Estado anterior</TableCell>
              <TableCell>Estado nuevo</TableCell>
              <TableCell>Comentario</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={8}>
                  <Stack alignItems="center" spacing={2} sx={{ py: 5 }}>
                    <CircularProgress size={28} />
                    <Typography color="text.secondary">
                      Cargando historial
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            )}

            {!isLoading && movements.length === 0 && (
              <TableRow>
                <TableCell colSpan={8}>
                  <Box sx={{ py: 6, textAlign: 'center' }}>
                    <Typography fontWeight={700}>Sin movimientos</Typography>
                    <Typography color="text.secondary">
                      No hay registros con los filtros actuales.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              movements.map((movement) => (
                <TableRow key={movement.id} hover>
                  <TableCell>{formatDate(movement.created_at)}</TableCell>
                  <TableCell>
                    <Stack spacing={0.25}>
                      <Typography fontWeight={800}>
                        {movement.requests?.part_code ?? '-'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {movement.requests?.part_description ?? ''}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={actionLabels[movement.action] ?? movement.action}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{movement.profiles?.full_name ?? '-'}</TableCell>
                  <TableCell>{movement.profiles?.role ?? '-'}</TableCell>
                  <TableCell>
                    {movement.previous_status ? (
                      <RequestStatusChip status={movement.previous_status} />
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {movement.new_status ? (
                      <RequestStatusChip status={movement.new_status} />
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 280 }}>
                    <Typography variant="body2" noWrap title={movement.comment ?? ''}>
                      {movement.comment ?? '-'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={count}
        page={filters.page}
        rowsPerPage={filters.pageSize}
        onPageChange={(_event, page) =>
          onFiltersChange({
            ...filters,
            page,
          })
        }
        onRowsPerPageChange={(event) =>
          onFiltersChange({
            ...filters,
            page: 0,
            pageSize: Number(event.target.value),
          })
        }
        rowsPerPageOptions={[10, 25, 50]}
        labelRowsPerPage="Filas"
      />
    </Paper>
  );
}
