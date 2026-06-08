import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import DoneAllOutlinedIcon from '@mui/icons-material/DoneAllOutlined';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import type {
  RequestFilters,
  RequestStatus,
  RequestWithRequester,
} from '../types';
import { WAREHOUSE_LABELS } from '../types';
import { RequestPriorityChip } from './RequestPriorityChip';
import { RequestStatusChip } from './RequestStatusChip';

type TableMode = 'mine' | 'operational';

type RequestsTableProps = {
  requests: RequestWithRequester[];
  count: number;
  filters: RequestFilters;
  isLoading: boolean;
  error: string | null;
  mode: TableMode;
  onFiltersChange: (filters: RequestFilters) => void;
  onStatusChange?: (request: RequestWithRequester, status: RequestStatus) => void;
};

function formatDate(value: string | null) {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function getItemsSummary(request: RequestWithRequester) {
  if (!request.request_items?.length) {
    return [
      {
        id: request.id,
        part_code: request.part_code,
        part_description: request.part_description,
        quantity: request.quantity,
        warehouse_location: request.warehouse_location ?? 'arriba',
      },
    ];
  }

  return request.request_items;
}

function ActionsCell({
  mode,
  request,
  onStatusChange,
}: Pick<RequestsTableProps, 'mode' | 'onStatusChange'> & {
  request: RequestWithRequester;
}) {
  if (!onStatusChange) {
    return null;
  }

  if (mode === 'mine') {
    return (
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        {request.status === 'surtida' && (
          <Button
            size="small"
            variant="contained"
            startIcon={<CheckCircleOutlineOutlinedIcon />}
            onClick={() => onStatusChange(request, 'recibida')}
          >
            Recibir
          </Button>
        )}
        {request.status === 'pendiente' && (
          <Button
            size="small"
            color="error"
            variant="outlined"
            startIcon={<CancelOutlinedIcon />}
            onClick={() => onStatusChange(request, 'cancelada')}
          >
            Cancelar
          </Button>
        )}
      </Stack>
    );
  }

  return (
    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
      {request.status === 'pendiente' && (
        <Tooltip title="Marcar en proceso">
          <IconButton
            color="info"
            onClick={() => onStatusChange(request, 'en_proceso')}
            aria-label="Marcar en proceso"
          >
            <PlayArrowOutlinedIcon />
          </IconButton>
        </Tooltip>
      )}

      {(request.status === 'pendiente' || request.status === 'en_proceso') && (
        <>
          <Tooltip title="Marcar surtida">
            <IconButton
              color="primary"
              onClick={() => onStatusChange(request, 'surtida')}
              aria-label="Marcar surtida"
            >
              <DoneAllOutlinedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="No encontrada">
            <IconButton
              color="default"
              onClick={() => onStatusChange(request, 'no_encontrada')}
              aria-label="No encontrada"
            >
              <HighlightOffOutlinedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Cancelar">
            <IconButton
              color="error"
              onClick={() => onStatusChange(request, 'cancelada')}
              aria-label="Cancelar"
            >
              <CancelOutlinedIcon />
            </IconButton>
          </Tooltip>
        </>
      )}
    </Stack>
  );
}

export function RequestsTable({
  requests,
  count,
  filters,
  isLoading,
  error,
  mode,
  onFiltersChange,
  onStatusChange,
}: RequestsTableProps) {
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
        <Table sx={{ minWidth: 1050 }} aria-label="Solicitudes">
          <TableHead>
            <TableRow>
              <TableCell>Productos</TableCell>
              <TableCell>Solicitante</TableCell>
              <TableCell>Descripcion</TableCell>
              <TableCell align="right">Cantidad</TableCell>
              <TableCell>Prioridad</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Creada</TableCell>
              <TableCell>Notas</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={9}>
                  <Stack alignItems="center" spacing={2} sx={{ py: 5 }}>
                    <CircularProgress size={28} />
                    <Typography color="text.secondary">
                      Cargando solicitudes
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            )}

            {!isLoading && requests.length === 0 && (
              <TableRow>
                <TableCell colSpan={9}>
                  <Box sx={{ py: 6, textAlign: 'center' }}>
                    <Typography fontWeight={700}>Sin solicitudes</Typography>
                    <Typography color="text.secondary">
                      No hay registros con los filtros actuales.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              requests.map((request) => (
                <TableRow key={request.id} hover>
                  <TableCell>
                    <Stack spacing={0.75}>
                      {getItemsSummary(request).map((item) => (
                        <Box key={item.id}>
                          <Typography fontWeight={800}>
                            {item.part_code}{' '}
                            <Typography component="span" color="text.secondary">
                              x{item.quantity}
                            </Typography>
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.part_description ?? '-'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {WAREHOUSE_LABELS[item.warehouse_location]}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.25}>
                      <Typography fontWeight={700}>
                        {request.requester?.full_name ?? '-'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {request.requester?.role ?? 'solicitante'}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    {request.request_items?.length > 1
                      ? `${request.request_items.length} productos`
                      : request.part_description ?? '-'}
                  </TableCell>
                  <TableCell align="right">{request.quantity}</TableCell>
                  <TableCell>
                    <RequestPriorityChip priority={request.priority} />
                  </TableCell>
                  <TableCell>
                    <RequestStatusChip status={request.status} />
                  </TableCell>
                  <TableCell>{formatDate(request.created_at)}</TableCell>
                  <TableCell sx={{ maxWidth: 240 }}>
                    <Typography variant="body2" noWrap title={request.notes ?? ''}>
                      {request.notes ?? '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <ActionsCell
                      mode={mode}
                      request={request}
                      onStatusChange={onStatusChange}
                    />
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
