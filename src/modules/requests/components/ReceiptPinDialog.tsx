import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

type ReceiptPinDialogProps = {
  open: boolean;
  isSaving: boolean;
  onClose: () => void;
  onConfirm: (pin: string) => Promise<void>;
};

export function ReceiptPinDialog({
  open,
  isSaving,
  onClose,
  onConfirm,
}: ReceiptPinDialogProps) {
  const [pin, setPin] = useState('');

  async function handleConfirm() {
    await onConfirm(pin);
    setPin('');
  }

  function handleClose() {
    setPin('');
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle>Configurar NIP de recepcion</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Typography color="text.secondary">
            Este NIP sustituye la firma del ticket cuando confirmes que recibiste
            un pedido.
          </Typography>
          <TextField
            label="NIP"
            value={pin}
            onChange={(event) => setPin(event.target.value.replace(/\D/g, ''))}
            inputProps={{ maxLength: 8, inputMode: 'numeric' }}
            type="password"
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
          Guardar NIP
        </Button>
      </DialogActions>
    </Dialog>
  );
}
