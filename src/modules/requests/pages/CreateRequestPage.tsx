import AddTaskOutlinedIcon from '@mui/icons-material/AddTaskOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { FormEvent } from 'react';
import { useState } from 'react';

import { useAuth } from '@/modules/auth/hooks/useAuth';
import { createRequest } from '../services/requests.service';
import type { RequestPriority } from '../types';
import { REQUEST_PRIORITIES } from '../types';
import { validateCreateRequestForm } from '../validation';
import type { RequestFormState } from '../validation';

const initialForm: RequestFormState = {
  partCode: '',
  partDescription: '',
  quantity: '1',
  priority: 'normal',
  notes: '',
};

export function CreateRequestPage() {
  const { profile } = useAuth();
  const [form, setForm] = useState<RequestFormState>(initialForm);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const validation = validateCreateRequestForm(form);

    if (!validation.isValid || !validation.input) {
      setError(validation.error);
      return;
    }

    if (!profile) {
      setError('No se encontro el perfil del usuario.');
      return;
    }

    setIsSaving(true);

    try {
      const request = await createRequest(profile.id, validation.input);
      setSuccess(`Solicitud ${request.part_code} creada correctamente.`);
      setForm(initialForm);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No se pudo crear la solicitud.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Stack spacing={3} maxWidth="md">
      <Box>
        <Typography variant="h4" component="h1" fontWeight={800}>
          Nueva solicitud
        </Typography>
        <Typography color="text.secondary">
          Captura la pieza que necesita Almacen 1.
        </Typography>
      </Box>

      <Paper
        component="form"
        elevation={0}
        onSubmit={handleSubmit}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          p: { xs: 2, md: 3 },
        }}
      >
        <Stack spacing={3}>
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              label="Codigo de pieza"
              value={form.partCode}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  partCode: event.target.value,
                }))
              }
              required
              fullWidth
              inputProps={{ maxLength: 80 }}
            />

            <TextField
              label="Cantidad"
              type="number"
              value={form.quantity}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  quantity: event.target.value,
                }))
              }
              required
              sx={{ minWidth: { md: 160 } }}
              inputProps={{ min: 1, step: 1 }}
            />

            <FormControl sx={{ minWidth: { md: 180 } }}>
              <InputLabel>Prioridad</InputLabel>
              <Select
                label="Prioridad"
                value={form.priority}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    priority: event.target.value as RequestPriority,
                  }))
                }
              >
                {REQUEST_PRIORITIES.map((priority) => (
                  <MenuItem key={priority} value={priority}>
                    {priority}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <TextField
            label="Descripcion"
            value={form.partDescription}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                partDescription: event.target.value,
              }))
            }
            fullWidth
            inputProps={{ maxLength: 180 }}
          />

          <TextField
            label="Observaciones"
            value={form.notes}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                notes: event.target.value,
              }))
            }
            multiline
            minRows={3}
            fullWidth
          />

          <Stack direction="row" justifyContent="flex-end">
            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={<AddTaskOutlinedIcon />}
              disabled={isSaving}
            >
              {isSaving ? 'Creando solicitud' : 'Crear solicitud'}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}
