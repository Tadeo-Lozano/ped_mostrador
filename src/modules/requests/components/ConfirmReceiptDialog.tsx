import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

import type { RequestWithRequester } from '../types';

type ConfirmReceiptDialogProps = {
  request: RequestWithRequester | null;
  isSaving: boolean;
  onClose: () => void;
  onConfirm: (pin: string, comment: string) => Promise<void>;
};

export function ConfirmReceiptDialog({
  request,
  isSaving,
  onClose,
  onConfirm,
}: ConfirmReceiptDialogProps) {
  const [pin, setPin] = useState('');
  const [comment, setComment] = useState('');
  const isOpen = Boolean(request);

  async function handleConfirm() {
    await onConfirm(pin, comment);
    setPin('');
    setComment('');
  }

  function handleClose() {
    setPin('');
    setComment('');
    onClose();
  }

  return (
    <Dialog open={isOpen} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Confirmar recepcion con NIP</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Typography color="text.secondary">
            {request
              ? `Captura el NIP del solicitante ${request.requester?.full_name ?? ''} para confirmar la entrega del pedido ${request.part_code}. Esta confirmacion quedara registrada como comprobante digital.`
              : ''}
          </Typography>
          <TextField
            label="NIP de recepcion"
            value={pin}
            onChange={(event) => setPin(event.target.value.replace(/\D/g, ''))}
            inputProps={{ maxLength: 8, inputMode: 'numeric' }}
            type="password"
            fullWidth
          />
          <TextField
            label="Comentario opcional"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            multiline
            minRows={3}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSaving}>
          Volver
        </Button>
        <Button
          variant="contained"
          onClick={() => void handleConfirm()}
          disabled={isSaving || pin.length < 4}
        >
          Confirmar recepcion
        </Button>
      </DialogActions>
    </Dialog>
  );
}
