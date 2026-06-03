import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import DoneAllOutlinedIcon from '@mui/icons-material/DoneAllOutlined';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { RequestStatus, RequestWithRequester } from '../types';
import { RequestPriorityChip } from './RequestPriorityChip';
import { RequestStatusChip } from './RequestStatusChip';

type PickerRequestsBoardProps = {
  requests: RequestWithRequester[];
  isLoading: boolean;
  error: string | null;
  view: 'active' | 'receipt' | 'closed';
  onStatusChange: (request: RequestWithRequester, status: RequestStatus) => void;
};

function formatTime(value: string | null) {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function getRequestNumber(id: string) {
  return id.slice(0, 8).toUpperCase();
}

function getItemsSummary(request: RequestWithRequester) {
  if (!request.request_items?.length) {
    return [
      {
        id: request.id,
        part_code: request.part_code,
        part_description: request.part_description,
        quantity: request.quantity,
      },
    ];
  }

  return request.request_items;
}

function RequestActions({
  request,
  onStatusChange,
}: Pick<PickerRequestsBoardProps, 'onStatusChange'> & {
  request: RequestWithRequester;
}) {
  if (request.status === 'surtida' || request.status === 'recibida') {
    return null;
  }

  if (request.status === 'no_encontrada' || request.status === 'cancelada') {
    return null;
  }

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
      {request.status === 'pendiente' && (
        <Button
          size="large"
          variant="contained"
          color="info"
          startIcon={<PlayArrowOutlinedIcon />}
          onClick={() => onStatusChange(request, 'en_proceso')}
          sx={{ minHeight: 48, fontWeight: 800 }}
        >
          Tomar pedido
        </Button>
      )}

      <Button
        size="large"
        variant="contained"
        startIcon={<DoneAllOutlinedIcon />}
        onClick={() => onStatusChange(request, 'surtida')}
        sx={{ minHeight: 48, fontWeight: 800 }}
      >
        Surtida
      </Button>

      <Button
        size="large"
        variant="outlined"
        color="inherit"
        startIcon={<HighlightOffOutlinedIcon />}
        onClick={() => onStatusChange(request, 'no_encontrada')}
        sx={{ minHeight: 48, fontWeight: 800 }}
      >
        No encontrada
      </Button>

      <Button
        size="large"
        variant="outlined"
        color="error"
        startIcon={<CancelOutlinedIcon />}
        onClick={() => onStatusChange(request, 'cancelada')}
        sx={{ minHeight: 48, fontWeight: 800 }}
      >
        Cancelar
      </Button>
    </Stack>
  );
}

function RequestCard({
  request,
  view,
  onStatusChange,
}: Pick<PickerRequestsBoardProps, 'view' | 'onStatusChange'> & {
  request: RequestWithRequester;
}) {
  const isCritical = request.priority === 'critica';
  const items = getItemsSummary(request);

  return (
    <Paper
      elevation={0}
      sx={{
        border: '2px solid',
        borderColor: isCritical ? 'error.main' : 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={{
          px: 2.5,
          py: 2,
          bgcolor: isCritical ? 'error.main' : 'grey.900',
          color: 'common.white',
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={2}
        >
          <Box>
            <Typography variant="overline" sx={{ opacity: 0.78 }}>
              Pedido #{getRequestNumber(request.id)}
            </Typography>
            <Typography
              component="h2"
              sx={{
                fontSize: { xs: 28, md: 36 },
                fontWeight: 900,
                lineHeight: 1.05,
                wordBreak: 'break-word',
              }}
            >
              {items.length === 1
                ? items[0].part_code
                : `${items.length} PRODUCTOS`}
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 28, fontWeight: 900 }}>
            x{items.reduce((total, item) => total + item.quantity, 0)}
          </Typography>
        </Stack>
      </Box>

      <Stack spacing={2} sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <RequestStatusChip status={request.status} />
          <RequestPriorityChip priority={request.priority} />
          <Typography color="text.secondary" sx={{ fontWeight: 700 }}>
            {formatTime(request.created_at)}
          </Typography>
        </Stack>

        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={700}>
            Solicitante
          </Typography>
          <Typography sx={{ fontSize: 22, fontWeight: 800 }}>
            {request.requester?.full_name ?? '-'}
          </Typography>
        </Box>

        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={700}>
            Productos
          </Typography>
          <Stack spacing={1} sx={{ mt: 1 }}>
            {items.map((item) => (
              <Box
                key={item.id}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1.5,
                  px: 1.5,
                  py: 1,
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  spacing={2}
                >
                  <Box>
                    <Typography sx={{ fontSize: 20, fontWeight: 900 }}>
                      {item.part_code}
                    </Typography>
                    <Typography color="text.secondary" fontWeight={700}>
                      {item.part_description ?? 'Sin descripcion'}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: 22, fontWeight: 900 }}>
                    x{item.quantity}
                  </Typography>
                </Stack>
              </Box>
            ))}
          </Stack>
        </Box>

        {request.notes && (
          <>
            <Divider />
            <Box>
              <Typography variant="body2" color="text.secondary" fontWeight={700}>
                Observaciones
              </Typography>
              <Typography>{request.notes}</Typography>
            </Box>
          </>
        )}

        {view === 'receipt' && (
          <>
            <Divider />
            <Button
              size="large"
              variant="contained"
              startIcon={<HowToRegOutlinedIcon />}
              onClick={() => onStatusChange(request, 'recibida')}
              sx={{ minHeight: 52, fontWeight: 900 }}
            >
              Confirmar recepcion
            </Button>
          </>
        )}

        {view === 'active' && (
          <>
            <Divider />
            <RequestActions request={request} onStatusChange={onStatusChange} />
          </>
        )}
      </Stack>
    </Paper>
  );
}

export function PickerRequestsBoard({
  requests,
  isLoading,
  error,
  view,
  onStatusChange,
}: PickerRequestsBoardProps) {
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (isLoading) {
    return (
      <Stack alignItems="center" spacing={2} sx={{ py: 8 }}>
        <CircularProgress size={42} />
        <Typography color="text.secondary" sx={{ fontSize: 22, fontWeight: 700 }}>
          Cargando pedidos
        </Typography>
      </Stack>
    );
  }

  if (requests.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          py: 8,
          textAlign: 'center',
        }}
      >
        <Typography sx={{ fontSize: 28, fontWeight: 900 }}>
          {view === 'active'
            ? 'Sin pedidos abiertos'
            : view === 'receipt'
              ? 'Sin pedidos listos'
              : 'Sin pedidos anteriores'}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          {view === 'active'
            ? 'Los pedidos nuevos apareceran aqui automaticamente.'
            : view === 'receipt'
              ? 'Los pedidos surtidos apareceran aqui para confirmar recepcion.'
              : 'Los pedidos finalizados apareceran aqui.'}
        </Typography>
      </Paper>
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          lg: 'repeat(2, minmax(0, 1fr))',
          xl: 'repeat(3, minmax(0, 1fr))',
        },
        gap: 2,
      }}
    >
      {requests.map((request) => (
        <RequestCard
          key={request.id}
          request={request}
          view={view}
          onStatusChange={onStatusChange}
        />
      ))}
    </Box>
  );
}
