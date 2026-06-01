import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { RequestPriorityChip } from '@/modules/requests/components/RequestPriorityChip';
import { RequestStatusChip } from '@/modules/requests/components/RequestStatusChip';
import type { RequestRow } from '@/modules/requests/types';

type RecentRequestsTableProps = {
  requests: RequestRow[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function RecentRequestsTable({ requests }: RecentRequestsTableProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <TableContainer>
        <Table sx={{ minWidth: 760 }} aria-label="Solicitudes recientes">
          <TableHead>
            <TableRow>
              <TableCell>Codigo</TableCell>
              <TableCell>Descripcion</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Prioridad</TableCell>
              <TableCell>Creada</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                    Sin solicitudes recientes.
                  </Typography>
                </TableCell>
              </TableRow>
            )}

            {requests.map((request) => (
              <TableRow key={request.id} hover>
                <TableCell>
                  <Typography fontWeight={800}>{request.part_code}</Typography>
                </TableCell>
                <TableCell>{request.part_description ?? '-'}</TableCell>
                <TableCell>
                  <RequestStatusChip status={request.status} />
                </TableCell>
                <TableCell>
                  <RequestPriorityChip priority={request.priority} />
                </TableCell>
                <TableCell>{formatDate(request.created_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
