import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

import type { RequestRow, RequestStatus } from '../types';

type RequestStatusDialogProps = {
  request: RequestRow | null;
  nextStatus: RequestStatus | null;
  isSaving: boolean;
  disablePortal?: boolean;
  onClose: () => void;
  onConfirm: (comment: string, pickerEmployeeNumber: string) => Promise<void>;
};

export function RequestStatusDialog({
  request,
  nextStatus,
  isSaving,
  disablePortal = false,
  onClose,
  onConfirm,
}: RequestStatusDialogProps) {
  const [comment, setComment] = useState('');
  const [pickerEmployeeNumber, setPickerEmployeeNumber] = useState('');
  const isOpen = Boolean(request && nextStatus);
  const shouldCapturePickerNumber =
    nextStatus === 'en_proceso' || nextStatus === 'surtida';

  async function handleConfirm() {
    await onConfirm(comment, pickerEmployeeNumber);
    setComment('');
    setPickerEmployeeNumber('');
  }

  function handleClose() {
    setComment('');
    setPickerEmployeeNumber('');
    onClose();
  }

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      disablePortal={disablePortal}
    >
      <DialogTitle>Cambiar estado</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Typography color="text.secondary">
            {request
              ? `Solicitud ${request.part_code} cambiara a ${nextStatus?.replace('_', ' ')}.`
              : ''}
          </Typography>
          {shouldCapturePickerNumber && (
            <TextField
              label="Numero de surtidor"
              value={pickerEmployeeNumber}
              onChange={(event) => setPickerEmployeeNumber(event.target.value)}
              inputProps={{ maxLength: 20 }}
              fullWidth
              required
            />
          )}
          <TextField
            label="Observaciones"
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
          disabled={
            isSaving ||
            (shouldCapturePickerNumber && !pickerEmployeeNumber.trim())
          }
        >
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
