import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { isSupabaseConfigured } from '@/config/env';
import { useAuth } from '../hooks/useAuth';

type LocationState = {
  from?: {
    pathname?: string;
  };
};

export function LoginPage() {
  const { signIn, user, profile, isLoading, error } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const from =
    (location.state as LocationState | null)?.from?.pathname ?? '/';

  if (user && profile && !isLoading) {
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (!email.trim() || !password) {
      setFormError('Captura correo y contraseña.');
      return;
    }

    try {
      await signIn(email.trim(), password);
    } catch {
      setFormError('Revisa tus credenciales e intenta de nuevo.');
    }
  }

  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'grid',
        placeItems: 'center',
        px: 2,
        py: 4,
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            p: { xs: 3, sm: 4 },
          }}
        >
          <Stack component="form" spacing={3} onSubmit={handleSubmit}>
            <Stack spacing={1}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Inventory2OutlinedIcon color="primary" fontSize="large" />
                <Typography variant="h5" component="h1" fontWeight={700}>
                  Acceso almacenes
                </Typography>
              </Stack>
              <Typography color="text.secondary">
                Ingresa con tu usuario interno.
              </Typography>
            </Stack>

            {!isSupabaseConfigured && (
              <Alert severity="warning">
                Configura las variables de Supabase antes de iniciar sesión.
              </Alert>
            )}

            {(formError || error) && (
              <Alert severity="error">{formError ?? error}</Alert>
            )}

            <TextField
              label="Correo"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              fullWidth
              required
            />

            <TextField
              label="Contraseña"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              fullWidth
              required
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={<LoginOutlinedIcon />}
              disabled={isLoading || !isSupabaseConfigured}
            >
              Entrar
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
