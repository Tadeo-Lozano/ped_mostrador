import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PasswordOutlinedIcon from '@mui/icons-material/PasswordOutlined';
import { useCallback, useMemo, useState } from 'react';

import { useAuth } from '@/modules/auth/hooks/useAuth';
import { ConfirmReceiptDialog } from '../components/ConfirmReceiptDialog';
import { ReceiptPinDialog } from '../components/ReceiptPinDialog';
import { RequestFiltersBar } from '../components/RequestFiltersBar';
import { RequestStatusDialog } from '../components/RequestStatusDialog';
import { RequestsTable } from '../components/RequestsTable';
import {
  confirmRequestReceipt,
  setMyReceiptPin,
  updateRequestStatus,
} from '../services/requests.service';
import type { RequestFilters, RequestStatus, RequestWithRequester } from '../types';
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
  const [selectedRequest, setSelectedRequest] =
    useState<RequestWithRequester | null>(null);
  const [receiptRequest, setReceiptRequest] = useState<RequestWithRequester | null>(
    null,
  );
  const [nextStatus, setNextStatus] = useState<RequestStatus | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
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

  function openStatusDialog(request: RequestWithRequester, status: RequestStatus) {
    if (status === 'recibida') {
      setReceiptRequest(request);
      return;
    }

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

  async function handleReceiptConfirm(pin: string, comment: string) {
    if (!receiptRequest) {
      return;
    }

    setIsSaving(true);

    try {
      await confirmRequestReceipt({
        requestId: receiptRequest.id,
        pin,
        comment,
      });
      setSnackbar('Recepcion confirmada con NIP.');
      setReceiptRequest(null);
      await refresh();
    } catch (receiptError) {
      setSnackbar(
        receiptError instanceof Error
          ? receiptError.message
          : 'No se pudo confirmar la recepcion.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePinConfirm(pin: string) {
    setIsSaving(true);

    try {
      await setMyReceiptPin(pin);
      setSnackbar('NIP de recepcion configurado.');
      setIsPinDialogOpen(false);
    } catch (pinError) {
      setSnackbar(
        pinError instanceof Error
          ? pinError.message
          : 'No se pudo configurar el NIP.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (!profile) {
    return <Alert severity="error">No se encontro el perfil del usuario.</Alert>;
  }

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        spacing={2}
      >
        <Box>
          <Typography variant="h4" component="h1" fontWeight={800}>
            Mis solicitudes
          </Typography>
          <Typography color="text.secondary">
            Consulta tus solicitudes y confirma recepcion con tu NIP.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<PasswordOutlinedIcon />}
          onClick={() => setIsPinDialogOpen(true)}
          sx={{ alignSelf: { sm: 'center' } }}
        >
          Configurar NIP
        </Button>
      </Stack>

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

      <ConfirmReceiptDialog
        request={receiptRequest}
        isSaving={isSaving}
        onClose={() => setReceiptRequest(null)}
        onConfirm={handleReceiptConfirm}
      />

      <ReceiptPinDialog
        open={isPinDialogOpen}
        isSaving={isSaving}
        onClose={() => setIsPinDialogOpen(false)}
        onConfirm={handlePinConfirm}
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
