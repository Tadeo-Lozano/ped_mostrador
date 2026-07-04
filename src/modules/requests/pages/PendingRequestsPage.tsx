import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import FullscreenExitOutlinedIcon from '@mui/icons-material/FullscreenExitOutlined';
import FullscreenOutlinedIcon from '@mui/icons-material/FullscreenOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from 'react';

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
  warehouseLocation: 'all',
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const scope = useMemo(() => ({ type: 'operational' as const }), []);

  const effectiveFilters = {
    ...filters,
    warehouseLocation: profile?.warehouse_location ?? filters.warehouseLocation,
  };

  const { requests, count, isLoading, error, refresh } = useRequests(
    scope,
    effectiveFilters,
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

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === boardRef.current);
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }

      await boardRef.current?.requestFullscreen();
    } catch {
      setSnackbar('No se pudo activar la pantalla completa.');
    }
  }

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

  async function handleConfirm(comment: string, pickerEmployeeNumber: string) {
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
        pickerEmployeeNumber:
          nextStatus === 'en_proceso' || nextStatus === 'surtida'
            ? pickerEmployeeNumber
            : selectedRequest.picker_employee_number ?? undefined,
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
            Vista operativa para {profile?.warehouse_location
              ? `almacen ${profile.warehouse_location}`
              : 'pantalla de almacen'}.
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

          <Button
            variant="contained"
            size="large"
            startIcon={<FullscreenOutlinedIcon />}
            onClick={() => void toggleFullscreen()}
          >
            Pantalla completa
          </Button>
        </Stack>
      </Stack>

      <Box
        ref={boardRef}
        sx={{
          bgcolor: isFullscreen ? 'grey.100' : 'transparent',
          minHeight: isFullscreen ? '100vh' : 'auto',
          overflowY: isFullscreen ? 'auto' : 'visible',
          p: isFullscreen ? 2 : 0,
        }}
      >
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            bgcolor: 'background.paper',
            px: 2.5,
            py: 2,
            mb: 2,
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
            spacing={1}
          >
            <Box>
              <Typography sx={{ fontSize: isFullscreen ? 26 : 20, fontWeight: 900 }}>
                {filters.statusGroup === 'closed'
                  ? 'Pedidos anteriores'
                  : 'Pedidos abiertos y en proceso'}
              </Typography>
              {isFullscreen && (
                <Typography color="text.secondary" fontWeight={700}>
                  {profile?.warehouse_location
                    ? `Almacen ${profile.warehouse_location}`
                    : 'Pantalla de almacen'}
                </Typography>
              )}
            </Box>

            <Stack direction="row" spacing={2} alignItems="center">
              <Typography
                color="text.secondary"
                sx={{ fontSize: isFullscreen ? 22 : 18, fontWeight: 800 }}
              >
                {count} pedidos
              </Typography>

              {isFullscreen && (
                <Button
                  variant="outlined"
                  startIcon={<FullscreenExitOutlinedIcon />}
                  onClick={() => void toggleFullscreen()}
                >
                  Salir
                </Button>
              )}
            </Stack>
          </Stack>
        </Box>

        {realtime.error && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {realtime.error}
          </Alert>
        )}

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
          disablePortal={isFullscreen}
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
      </Box>
    </Stack>
  );
}
