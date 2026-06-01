import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

import { REQUEST_STATUSES } from '@/modules/requests/types';
import type { MovementFilters } from '../types';

type MovementFiltersBarProps = {
  filters: MovementFilters;
  onChange: (filters: MovementFilters) => void;
};

export function MovementFiltersBar({
  filters,
  onChange,
}: MovementFiltersBarProps) {
  function updateFilters(nextFilters: Partial<MovementFilters>) {
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
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
        <TextField
          label="Codigo"
          value={filters.partCode ?? ''}
          onChange={(event) => updateFilters({ partCode: event.target.value })}
          sx={{ minWidth: { lg: 180 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlinedIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="Usuario"
          value={filters.userSearch ?? ''}
          onChange={(event) => updateFilters({ userSearch: event.target.value })}
          sx={{ minWidth: { lg: 220 } }}
        />

        <FormControl sx={{ minWidth: { lg: 190 } }}>
          <InputLabel>Estado nuevo</InputLabel>
          <Select
            label="Estado nuevo"
            value={filters.status ?? 'all'}
            onChange={(event) =>
              updateFilters({
                status: event.target.value as MovementFilters['status'],
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

        <TextField
          label="Desde"
          type="date"
          value={filters.dateFrom ?? ''}
          onChange={(event) => updateFilters({ dateFrom: event.target.value })}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: { lg: 170 } }}
        />

        <TextField
          label="Hasta"
          type="date"
          value={filters.dateTo ?? ''}
          onChange={(event) => updateFilters({ dateTo: event.target.value })}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: { lg: 170 } }}
        />
      </Stack>
    </Box>
  );
}
