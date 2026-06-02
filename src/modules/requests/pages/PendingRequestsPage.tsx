import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import { useCallback, useMemo, useState, type MouseEvent } from 'react';

import { useAuth } from '@/modules/auth/hooks/useAuth';
import { PickerRequestsBoard } from '../components/PickerRequestsBoard';
import { RequestStatusDialog } from '../components/RequestStatusDialog';
import { updateRequestStatus } from '../services/requests.service';
import type {
  RequestFilters,
  RequestStatus,
  RequestStatusGroup,
  RequestWithRequester,
} from '../types';
import { useRequests } from '../hooks/useRequests';
import { useRequestRealtime } from '../hooks/useRequestRealtime';

const initialFilters: RequestFilters = {
  status: 'all',
  priority: 'all',
  search: '',
  statusGroup: 'active',
  page: 0,
  pageSize: 50,
};

export function PendingRequestsPage() {
  const { profile } = useAuth();
  const [filters, setFilters] = useState<RequestFilters>(initialFilters);
  const [selectedRequest, setSelectedRequest] =
    useState<RequestWithRequester | null>(null);
  const [nextStatus, setNextStatus] = useState<RequestStatus | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const scope = useMemo(() => ({ type: 'operational' as const }), []);

  const { requests, count, isLoading, error, refresh } = useRequests(
    scope,
    filters,
  );
  const realtime = useRequestRealtime({
    scope,
    enabled: Boolean(profile),
    onEvent: useCallback(
      async (event) => {
        await refresh();

        if (event.type === 'insert') {
          setSnackbar(`Nueva solicitud: ${event.request.part_code}.`);
        }

        if (event.type === 'update') {
          setSnackbar(
            `Solicitud ${event.request.part_code} cambio a ${event.request.status.replace('_', ' ')}.`,
          );
        }
      },
      [refresh],
    ),
  });

  function handleViewChange(
    _event: MouseEvent<HTMLElement>,
    nextView: RequestStatusGroup | null,
  ) {
    if (!nextView) {
      return;
    }

    setFilters({
      ...filters,
      status: 'all',
      statusGroup: nextView,
      page: 0,
    });
  }

  function openStatusDialog(request: RequestWithRequester, status: RequestStatus) {
    setSelectedRequest(request);
    setNextStatus(status);
  }

  async function handleConfirm(comment: string) {
    if (!selectedRequest || !nextStatus || !profile) {
      return;
    }

    setIsSaving(true);

    try {
      await updateRequestStatus({
        requestId: selectedRequest.id,
        status: nextStatus,
        pickerId:
          nextStatus === 'en_proceso' || nextStatus === 'surtida'
            ? profile.id
            : selectedRequest.picker_id,
        notes: comment || selectedRequest.notes || undefined,
      });
      setSnackbar('Solicitud actualizada.');
      setSelectedRequest(null);
      setNextStatus(null);
      await refresh();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', md: 'flex-end' }}
        spacing={2}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            fontWeight={900}
            sx={{ letterSpacing: 0 }}
          >
            Tablero de pedidos
          </Typography>
          <Typography color="text.secondary">
            Vista operativa para pantalla de almacen.
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <ToggleButtonGroup
            exclusive
            value={filters.statusGroup ?? 'active'}
            onChange={handleViewChange}
            aria-label="Vista de pedidos"
            size="large"
          >
            <ToggleButton value="active" sx={{ px: 3, fontWeight: 800 }}>
              Abiertos
            </ToggleButton>
            <ToggleButton value="closed" sx={{ px: 3, fontWeight: 800 }}>
              Anteriores
            </ToggleButton>
          </ToggleButtonGroup>

          <Button
            variant="outlined"
            size="large"
            startIcon={<RefreshOutlinedIcon />}
            onClick={() => void refresh()}
          >
            Actualizar
          </Button>
        </Stack>
      </Stack>

      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          bgcolor: 'background.paper',
          px: 2.5,
          py: 2,
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          spacing={1}
        >
          <Typography sx={{ fontSize: 20, fontWeight: 800 }}>
            {filters.statusGroup === 'closed'
              ? 'Pedidos anteriores'
              : 'Pedidos abiertos y en proceso'}
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: 18, fontWeight: 700 }}>
            {count} pedidos
          </Typography>
        </Stack>
      </Box>

      {realtime.error && <Alert severity="warning">{realtime.error}</Alert>}

      <PickerRequestsBoard
        requests={requests}
        isLoading={isLoading}
        error={error}
        view={filters.statusGroup ?? 'active'}
        onStatusChange={openStatusDialog}
      />

      <RequestStatusDialog
        request={selectedRequest}
        nextStatus={nextStatus}
        isSaving={isSaving}
        onClose={() => {
          setSelectedRequest(null);
          setNextStatus(null);
        }}
        onConfirm={handleConfirm}
      />

      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={3000}
        onClose={() => setSnackbar(null)}
        message={snackbar}
      />
    </Stack>
  );
}
