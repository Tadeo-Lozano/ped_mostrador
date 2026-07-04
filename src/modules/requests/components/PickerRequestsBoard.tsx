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
import { WAREHOUSE_LABELS } from '../types';
import { getRequesterColor } from '../utils/requesterColors';
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
        warehouse_location: request.warehouse_location ?? 'arriba',
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
  const isReceipt = view === 'receipt';
  const items = getItemsSummary(request);
  const requesterColor = getRequesterColor(request);

  return (
    <Paper
      elevation={0}
      sx={{
        border: '2px solid',
        borderColor: isReceipt
          ? requesterColor.border
          : isCritical
            ? 'error.main'
            : 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={{
          px: isReceipt ? 1.5 : 2.5,
          py: isReceipt ? 1.25 : 2,
          bgcolor:
            isReceipt
              ? requesterColor.border
              : isCritical
                ? 'error.main'
                : 'grey.900',
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
            <Typography
              variant="overline"
              sx={{
                display: 'block',
                fontSize: isReceipt ? 10 : undefined,
                lineHeight: isReceipt ? 1.2 : undefined,
                opacity: 0.78,
              }}
            >
              Pedido #{getRequestNumber(request.id)}
            </Typography>
            <Typography
              component="h2"
              sx={{
                fontSize: isReceipt ? 20 : { xs: 28, md: 36 },
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
          <Typography
            sx={{ fontSize: isReceipt ? 20 : 28, fontWeight: 900 }}
          >
            x{items.reduce((total, item) => total + item.quantity, 0)}
          </Typography>
        </Stack>
      </Box>

      <Stack spacing={isReceipt ? 1 : 2} sx={{ p: isReceipt ? 1.5 : 2.5 }}>
        <Stack
          direction="row"
          spacing={isReceipt ? 0.75 : 1}
          flexWrap="wrap"
          useFlexGap
          alignItems="center"
        >
          <RequestStatusChip status={request.status} />
          <RequestPriorityChip priority={request.priority} />
          {request.warehouse_location && (
            <Typography
              color="text.secondary"
              sx={{ fontSize: isReceipt ? 12 : undefined, fontWeight: 800 }}
            >
              {WAREHOUSE_LABELS[request.warehouse_location]}
            </Typography>
          )}
          <Typography
            color="text.secondary"
            sx={{ fontSize: isReceipt ? 12 : undefined, fontWeight: 700 }}
          >
            {formatTime(request.created_at)}
          </Typography>
        </Stack>

        {request.picker_employee_number && (
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight={700}
              sx={{ fontSize: isReceipt ? 11 : undefined }}
            >
              Surtidor
            </Typography>
            <Typography
              sx={{ fontSize: isReceipt ? 16 : 20, fontWeight: 900 }}
            >
              #{request.picker_employee_number}
            </Typography>
          </Box>
        )}

        <Box
          sx={{
            border: '2px solid',
            borderColor: requesterColor.border,
            borderRadius: 1.5,
            bgcolor: requesterColor.background,
            px: isReceipt ? 1 : 1.5,
            py: isReceipt ? 0.75 : 1.25,
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            fontWeight={700}
            sx={{ fontSize: isReceipt ? 11 : undefined }}
          >
            Solicitante
          </Typography>
          <Typography
            sx={{
              color: requesterColor.text,
              fontSize: isReceipt ? 18 : 24,
              fontWeight: 900,
              lineHeight: 1.15,
            }}
          >
            {request.requester?.full_name ?? '-'}
          </Typography>
        </Box>

        <Box>
          <Typography
            variant="body2"
            color="text.secondary"
            fontWeight={700}
            sx={{ fontSize: isReceipt ? 11 : undefined }}
          >
            Productos
          </Typography>
          <Stack spacing={isReceipt ? 0.5 : 1} sx={{ mt: isReceipt ? 0.5 : 1 }}>
            {items.map((item) => (
              <Box
                key={item.id}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1.5,
                  px: isReceipt ? 1 : 1.5,
                  py: isReceipt ? 0.625 : 1,
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  spacing={2}
                >
                  <Box>
                    <Typography
                      sx={{ fontSize: isReceipt ? 16 : 20, fontWeight: 900 }}
                    >
                      {item.part_code}
                    </Typography>
                    <Typography
                      color="text.secondary"
                      fontWeight={700}
                      sx={{
                        fontSize: isReceipt ? 12 : undefined,
                        lineHeight: 1.25,
                      }}
                    >
                      {item.part_description ?? 'Sin descripcion'}
                    </Typography>
                    <Typography
                      color="text.secondary"
                      fontWeight={800}
                      sx={{ fontSize: isReceipt ? 11 : undefined }}
                    >
                      {WAREHOUSE_LABELS[item.warehouse_location]}
                    </Typography>
                  </Box>
                  <Typography
                    sx={{ fontSize: isReceipt ? 17 : 22, fontWeight: 900 }}
                  >
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
              <Typography
                variant="body2"
                color="text.secondary"
                fontWeight={700}
                sx={{ fontSize: isReceipt ? 11 : undefined }}
              >
                Observaciones
              </Typography>
              <Typography sx={{ fontSize: isReceipt ? 12 : undefined }}>
                {request.notes}
              </Typography>
            </Box>
          </>
        )}

        {isReceipt && (
          <>
            <Divider />
            <Button
              size="medium"
              variant="contained"
              startIcon={<HowToRegOutlinedIcon />}
              onClick={() => onStatusChange(request, 'recibida')}
              sx={{ minHeight: 40, fontWeight: 900 }}
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

function RequestRow({
  request,
  view,
  onStatusChange,
}: Pick<PickerRequestsBoardProps, 'view' | 'onStatusChange'> & {
  request: RequestWithRequester;
}) {
  const items = getItemsSummary(request);
  const requesterColor = getRequesterColor(request);
  const isReceipt = view === 'receipt';

  return (
    <Paper
      elevation={0}
      sx={{
        border: '2px solid',
        borderColor: isReceipt
          ? requesterColor.border
          : request.priority === 'critica'
            ? 'error.main'
            : 'divider',
        borderRadius: 1.5,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: isReceipt
              ? '170px minmax(180px, 0.8fr) minmax(360px, 2.2fr) minmax(260px, auto)'
              : 'minmax(0, 1fr) minmax(260px, auto)',
          },
          alignItems: 'stretch',
        }}
      >
        {isReceipt ? (
          <>
            <Box
              sx={{
                bgcolor: requesterColor.border,
                color: 'common.white',
                px: 1.5,
                py: 1.25,
              }}
            >
              <Typography
                variant="overline"
                sx={{
                  display: 'block',
                  fontSize: 10,
                  lineHeight: 1.2,
                  opacity: 0.8,
                }}
              >
                Pedido #{getRequestNumber(request.id)}
              </Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 900, lineHeight: 1.1 }}>
                {items.length === 1
                  ? items[0].part_code
                  : `${items.length} productos`}
              </Typography>
              <Typography sx={{ mt: 0.5, fontSize: 14, fontWeight: 800 }}>
                Total: {items.reduce((total, item) => total + item.quantity, 0)}
              </Typography>
              <Typography sx={{ mt: 0.5, fontSize: 12, opacity: 0.85 }}>
                {formatTime(request.created_at)}
              </Typography>
            </Box>

            <Stack
              spacing={0.75}
              sx={{
                borderRight: { lg: '1px solid' },
                borderColor: { lg: 'divider' },
                px: 1.5,
                py: 1.25,
              }}
            >
              <Box
                sx={{
                  borderLeft: '5px solid',
                  borderColor: requesterColor.border,
                  bgcolor: requesterColor.background,
                  color: requesterColor.text,
                  px: 1,
                  py: 0.75,
                }}
              >
                <Typography sx={{ fontSize: 11, fontWeight: 700 }}>
                  Solicitante
                </Typography>
                <Typography
                  sx={{ fontSize: 18, fontWeight: 900, lineHeight: 1.15 }}
                >
                  {request.requester?.full_name ?? '-'}
                </Typography>
              </Box>

              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                <RequestStatusChip status={request.status} />
                <RequestPriorityChip priority={request.priority} />
              </Stack>
            </Stack>

            <Stack
              spacing={0.5}
              sx={{
                borderRight: { lg: '1px solid' },
                borderColor: { lg: 'divider' },
                px: 1.5,
                py: 1.25,
              }}
            >
              {items.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns:
                      'minmax(110px, 0.7fr) minmax(130px, 1.5fr) auto',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Typography sx={{ fontSize: 18, fontWeight: 900 }}>
                    {item.part_code}
                  </Typography>
                  <Box>
                    <Typography
                      color="text.secondary"
                      sx={{ fontSize: 12, fontWeight: 700 }}
                    >
                      {item.part_description ?? 'Sin descripcion'}
                    </Typography>
                    <Typography
                      color="text.secondary"
                      sx={{ fontSize: 11, fontWeight: 800 }}
                    >
                      {WAREHOUSE_LABELS[item.warehouse_location]}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: 17, fontWeight: 900 }}>
                    x{item.quantity}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </>
        ) : (
          <Stack
            spacing={0}
            sx={{
              borderRight: { lg: '1px solid' },
              borderColor: { lg: 'divider' },
            }}
          >
            {items.map((item, index) => (
              <Box
                key={item.id}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    md: 'minmax(320px, 1.4fr) minmax(280px, 0.8fr)',
                  },
                  minHeight: { md: 132 },
                  borderBottom:
                    index < items.length - 1 ? '1px solid' : undefined,
                  borderColor: 'divider',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor:
                      request.priority === 'critica' ? 'error.main' : 'grey.900',
                    color: 'common.white',
                    minWidth: 0,
                    px: { xs: 2, md: 3 },
                    py: 2,
                  }}
                >
                  <Typography
                    sx={{
                      width: '100%',
                      fontSize: { xs: 36, md: 48, xl: 58 },
                      fontWeight: 900,
                      lineHeight: 1,
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {item.part_code}
                  </Typography>
                </Box>

                <Stack
                  justifyContent="center"
                  spacing={0.75}
                  sx={{ minWidth: 0, px: 2, py: 1.5 }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    spacing={2}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        color="text.secondary"
                        sx={{ fontSize: 11, fontWeight: 800 }}
                      >
                        Descripcion
                      </Typography>
                      <Typography
                        sx={{ fontSize: 16, fontWeight: 800, lineHeight: 1.2 }}
                      >
                        {item.part_description ?? 'Sin descripcion'}
                      </Typography>
                      <Typography
                        color="text.secondary"
                        sx={{ mt: 0.5, fontSize: 12, fontWeight: 800 }}
                      >
                        {WAREHOUSE_LABELS[item.warehouse_location]}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: 28, fontWeight: 900 }}>
                      x{item.quantity}
                    </Typography>
                  </Stack>

                  {index === 0 && (
                    <>
                      <Box
                        sx={{
                          borderLeft: '5px solid',
                          borderColor: requesterColor.border,
                          bgcolor: requesterColor.background,
                          color: requesterColor.text,
                          px: 1,
                          py: 0.5,
                        }}
                      >
                        <Typography sx={{ fontSize: 11, fontWeight: 700 }}>
                          Solicitante
                        </Typography>
                        <Typography
                          sx={{ fontSize: 18, fontWeight: 900, lineHeight: 1.1 }}
                        >
                          {request.requester?.full_name ?? '-'}
                        </Typography>
                      </Box>

                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={0.75}
                        flexWrap="wrap"
                        useFlexGap
                      >
                        <RequestStatusChip status={request.status} />
                        <RequestPriorityChip priority={request.priority} />
                        <Typography
                          color="text.secondary"
                          sx={{ fontSize: 11, fontWeight: 800 }}
                        >
                          Pedido #{getRequestNumber(request.id)} ·{' '}
                          {formatTime(request.created_at)}
                        </Typography>
                      </Stack>
                    </>
                  )}
                </Stack>
              </Box>
            ))}

            {request.notes && (
              <Typography
                color="text.secondary"
                sx={{ borderTop: '1px solid', borderColor: 'divider', p: 1.25 }}
              >
                Nota: {request.notes}
              </Typography>
            )}
          </Stack>
        )}

        <Stack
          justifyContent="center"
          spacing={1}
          sx={{
            gridColumn: { xs: '1', md: '1 / -1', lg: 'auto' },
            borderTop: { xs: '1px solid', lg: 0 },
            borderColor: 'divider',
            p: 1.25,
          }}
        >
          {isReceipt ? (
            <Button
              variant="contained"
              startIcon={<HowToRegOutlinedIcon />}
              onClick={() => onStatusChange(request, 'recibida')}
              sx={{ minHeight: 42, fontWeight: 900, whiteSpace: 'nowrap' }}
            >
              Confirmar recepcion
            </Button>
          ) : (
            <RequestActions request={request} onStatusChange={onStatusChange} />
          )}
        </Stack>
      </Box>
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

  if (view === 'active' || view === 'receipt') {
    return (
      <Stack spacing={1}>
        {requests.map((request) => (
          <RequestRow
            key={request.id}
            request={request}
            view={view}
            onStatusChange={onStatusChange}
          />
        ))}
      </Stack>
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
        '@media (min-width: 1900px)': {
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
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
