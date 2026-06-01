import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

import type { RequestFilters } from '../types';
import { REQUEST_PRIORITIES, REQUEST_STATUSES } from '../types';

type RequestFiltersBarProps = {
  filters: RequestFilters;
  onChange: (filters: RequestFilters) => void;
  showStatus?: boolean;
};

export function RequestFiltersBar({
  filters,
  onChange,
  showStatus = true,
}: RequestFiltersBarProps) {
  function updateFilters(nextFilters: Partial<RequestFilters>) {
    onChange({
      ...filters,
      ...nextFilters,
      page: 0,
    });
  }

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        p: 2,
      }}
    >
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <TextField
          label="Buscar codigo o descripcion"
          value={filters.search ?? ''}
          onChange={(event) => updateFilters({ search: event.target.value })}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlinedIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        {showStatus && (
          <FormControl sx={{ minWidth: { xs: '100%', md: 190 } }}>
            <InputLabel>Estado</InputLabel>
            <Select
              label="Estado"
              value={filters.status ?? 'all'}
              onChange={(event) =>
                updateFilters({
                  status: event.target.value as RequestFilters['status'],
                })
              }
            >
              <MenuItem value="all">Todos</MenuItem>
              {REQUEST_STATUSES.map((status) => (
                <MenuItem key={status} value={status}>
                  {status.replace('_', ' ')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <FormControl sx={{ minWidth: { xs: '100%', md: 180 } }}>
          <InputLabel>Prioridad</InputLabel>
          <Select
            label="Prioridad"
            value={filters.priority ?? 'all'}
            onChange={(event) =>
              updateFilters({
                priority: event.target.value as RequestFilters['priority'],
              })
            }
          >
            <MenuItem value="all">Todas</MenuItem>
            {REQUEST_PRIORITIES.map((priority) => (
              <MenuItem key={priority} value={priority}>
                {priority}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
    </Box>
  );
}
