import Chip from '@mui/material/Chip';
import type { ChipProps } from '@mui/material/Chip';

import type { RequestStatus } from '../types';

const statusLabels: Record<RequestStatus, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  surtida: 'Surtida',
  recibida: 'Recibida',
  no_encontrada: 'No encontrada',
  cancelada: 'Cancelada',
};

const statusColors: Record<RequestStatus, ChipProps['color']> = {
  pendiente: 'warning',
  en_proceso: 'info',
  surtida: 'primary',
  recibida: 'success',
  no_encontrada: 'default',
  cancelada: 'error',
};

type RequestStatusChipProps = {
  status: RequestStatus;
};

export function RequestStatusChip({ status }: RequestStatusChipProps) {
  return (
    <Chip
      label={statusLabels[status]}
      color={statusColors[status]}
      size="small"
      variant={status === 'no_encontrada' ? 'outlined' : 'filled'}
    />
  );
}
