import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import { useCallback, useMemo, useState } from 'react';

import { ConfirmReceiptDialog } from '../components/ConfirmReceiptDialog';
import { PickerRequestsBoard } from '../components/PickerRequestsBoard';
import { useRequestRealtime } from '../hooks/useRequestRealtime';
import { useRequests } from '../hooks/useRequests';
import { confirmRequestReceipt } from '../services/requests.service';
import type { RequestFilters, RequestWithRequester } from '../types';
import { groupRequestsByOrder } from '../utils/groupRequests';
import { getRequesterColor } from '../utils/requesterColors';

const initialFilters: RequestFilters = {
  status: 'all',
  priority: 'all',
  search: '',
  statusGroup: 'receipt',
  page: 0,
  pageSize: 50,
};

export function ReceiptTerminalPage() {
  const [filters] = useState<RequestFilters>(initialFilters);
  const [selectedRequest, setSelectedRequest] =
    useState<RequestWithRequester | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const scope = useMemo(() => ({ type: 'operational' as const }), []);

  const { requests, count, isLoading, error, refresh } = useRequests(
    scope,
    filters,
  );
  const groupedRequests = groupRequestsByOrder(requests).filter(
    (request) => request.status === 'surtida',
  );
  const requesterLegend = groupedRequests
    .reduce<Array<{ id: string; name: string; color: ReturnType<typeof getRequesterColor> }>>(
      (legend, request) => {
        const id = request.requester?.id ?? request.requester_id;

        if (legend.some((item) => item.id === id)) {
          return legend;
        }

        return [
          ...legend,
          {
            id,
            name: request.requester?.full_name ?? 'Sin nombre',
            color: getRequesterColor(request),
          },
        ];
      },
      [],
    )
    .sort((first, second) => first.name.localeCompare(second.name, 'es-MX'));

  const realtime = useRequestRealtime({
    scope,
    enabled: true,
    onEvent: useCallback(
      async () => {
        await refresh();
      },
      [refresh],
    ),
  });

  async function handleReceiptConfirm(pin: string, comment: string) {
    if (!selectedRequest) {
      return;
    }

    setIsSaving(true);

    try {
      await confirmRequestReceipt({
        requestId: selectedRequest.id,
        pin,
        comment,
      });
      setSnackbar('Pedido completo confirmado con NIP.');
      setSelectedRequest(null);
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

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', md: 'flex-end' }}
        spacing={2}
      >
        <Box>
          <Typography variant="h4" component="h1" fontWeight={900}>
            Recepcion de pedidos
          </Typography>
          <Typography color="text.secondary">
            Terminal fija para confirmar entrega con NIP del vendedor.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          size="large"
          startIcon={<RefreshOutlinedIcon />}
          onClick={() => void refresh()}
        >
          Actualizar
        </Button>
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
            Listos para recoger
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: 18, fontWeight: 700 }}>
            {groupedRequests.length || count} pedidos
          </Typography>
        </Stack>

        {requesterLegend.length > 0 && (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
            {requesterLegend.map((requester) => (
              <Box
                key={requester.id}
                sx={{
                  border: '2px solid',
                  borderColor: requester.color.border,
                  borderRadius: 1.5,
                  bgcolor: requester.color.background,
                  color: requester.color.text,
                  px: 1.25,
                  py: 0.75,
                  fontWeight: 900,
                }}
              >
                {requester.name}
              </Box>
            ))}
          </Stack>
        )}
      </Box>

      {realtime.error && <Alert severity="warning">{realtime.error}</Alert>}

      <PickerRequestsBoard
        requests={groupedRequests}
        isLoading={isLoading}
        error={error}
        view="receipt"
        onStatusChange={(request) => setSelectedRequest(request)}
      />

      <ConfirmReceiptDialog
        request={selectedRequest}
        isSaving={isSaving}
        onClose={() => setSelectedRequest(null)}
        onConfirm={handleReceiptConfirm}
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
