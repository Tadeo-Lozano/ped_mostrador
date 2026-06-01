import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactElement } from 'react';

type MetricCardProps = {
  title: string;
  value: string | number;
  helper: string;
  icon: ReactElement;
};

export function MetricCard({ title, value, helper, icon }: MetricCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        p: 2.5,
        minHeight: 132,
      }}
    >
      <Stack spacing={1.5}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography color="text.secondary" fontWeight={700}>
            {title}
          </Typography>
          {icon}
        </Stack>
        <Typography variant="h4" fontWeight={900}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {helper}
        </Typography>
      </Stack>
    </Paper>
  );
}
