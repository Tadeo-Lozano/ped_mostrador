import Box from '@mui/material/Box';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
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

export function PendingRequestsPage() {
  const { profile } = useAuth();
  const [filters, setFilters] = useState<RequestFilters>(initialFilters);
  const [selectedRequest, setSelectedRequest] = useState<RequestRow | null>(null);
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

  function openStatusDialog(request: RequestRow, status: RequestStatus) {
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
      <Box>
        <Typography variant="h4" component="h1" fontWeight={800}>
          Solicitudes pendientes
        </Typography>
        <Typography color="text.secondary">
          Atiende solicitudes nuevas y actualiza su estado operativo.
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
        mode="operational"
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
