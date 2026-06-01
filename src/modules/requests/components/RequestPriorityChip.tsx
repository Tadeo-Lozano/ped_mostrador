import Chip from '@mui/material/Chip';
import type { ChipProps } from '@mui/material/Chip';

import type { RequestPriority } from '../types';

const priorityLabels: Record<RequestPriority, string> = {
  normal: 'Normal',
  urgente: 'Urgente',
  critica: 'Critica',
};

const priorityColors: Record<RequestPriority, ChipProps['color']> = {
  normal: 'default',
  urgente: 'warning',
  critica: 'error',
};

type RequestPriorityChipProps = {
  priority: RequestPriority;
};

export function RequestPriorityChip({ priority }: RequestPriorityChipProps) {
  return (
    <Chip
      label={priorityLabels[priority]}
      color={priorityColors[priority]}
      size="small"
      variant={priority === 'normal' ? 'outlined' : 'filled'}
    />
  );
}
