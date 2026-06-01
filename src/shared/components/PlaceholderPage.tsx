import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

type PlaceholderPageProps = {
  title: string;
  description: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <Stack spacing={2}>
      <Typography variant="h4" component="h1" fontWeight={700}>
        {title}
      </Typography>
      <Paper
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          p: 3,
        }}
      >
        <Typography color="text.secondary">{description}</Typography>
      </Paper>
    </Stack>
  );
}
