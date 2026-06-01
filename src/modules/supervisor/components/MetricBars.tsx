import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

type MetricBarsProps = {
  title: string;
  items: Array<{
    label: string;
    value: number;
  }>;
};

export function MetricBars({ title, items }: MetricBarsProps) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        p: 2.5,
      }}
    >
      <Stack spacing={2}>
        <Typography variant="h6" fontWeight={800}>
          {title}
        </Typography>

        <Stack spacing={1.5}>
          {items.map((item) => (
            <Stack key={item.label} spacing={0.75}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" fontWeight={700}>
                  {item.label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.value}
                </Typography>
              </Stack>
              <Box
                sx={{
                  height: 10,
                  borderRadius: 1,
                  bgcolor: 'action.hover',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    width: `${(item.value / max) * 100}%`,
                    height: '100%',
                    bgcolor: 'primary.main',
                  }}
                />
              </Box>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
}
