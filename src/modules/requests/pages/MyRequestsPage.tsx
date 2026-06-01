import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useCallback, useMemo, useState } from 'react';

import { useAuth } from '@/modules/auth/hooks/useAuth';
import { RequestFiltersBar } from '../components/RequestFiltersBar';
import { RequestStatusDialog } from '../components/RequestStatusDialog';
import { RequestsTable } from '../components/RequestsTable';
import { updateRequestStatus } from '../services/requests.service';
import type { RequestFilters, RequestRow, RequestStatus } from '../types';
import { useRequests } from '../hooks/useRequests';
import { useRequestRealtime } from '../hooks/useRequestRealtime';

const initialFilters: RequestFilters = {
  status: 'all',
  priority: 'all',
  search: '',
  page: 0,
  pageSize: 10,
};

export function MyRequestsPage() {
  const { profile } = useAuth();
  const [filters, setFilters] = useState<RequestFilters>(initialFilters);
  const [selectedRequest, setSelectedRequest] = useState<RequestRow | null>(null);
  const [nextStatus, setNextStatus] = useState<RequestStatus | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const scope = useMemo(
    () => ({
      type: 'mine' as const,
      requesterId: profile?.id ?? '',
    }),
    [profile?.id],
  );

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

        if (event.type === 'update') {
          setSnackbar(
            `Solicitud ${event.request.part_code} actualizada a ${event.request.status.replace('_', ' ')}.`,
          );
        }

        if (event.type === 'insert') {
          setSnackbar(`Solicitud ${event.request.part_code} registrada.`);
        }
      },
      [refresh],
    ),
  });

  function openStatusDialog(request: RequestRow, status: RequestStatus) {
    setSelectedRequest(request);
    setNextStatus(status);
  }

  async function handleConfirm(comment: string) {
    if (!selectedRequest || !nextStatus) {
      return;
    }

    setIsSaving(true);

    try {
      await updateRequestStatus({
        requestId: selectedRequest.id,
        status: nextStatus,
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

  if (!profile) {
    return <Alert severity="error">No se encontro el perfil del usuario.</Alert>;
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" component="h1" fontWeight={800}>
          Mis solicitudes
        </Typography>
        <Typography color="text.secondary">
          Consulta tus solicitudes y confirma recepcion cuando sean surtidas.
        </Typography>
      </Box>

      <RequestFiltersBar filters={filters} onChange={setFilters} />

      {realtime.error && <Alert severity="warning">{realtime.error}</Alert>}

      <RequestsTable
        requests={requests}
        count={count}
        filters={filters}
        isLoading={isLoading}
        error={error}
        mode="mine"
        onFiltersChange={setFilters}
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
