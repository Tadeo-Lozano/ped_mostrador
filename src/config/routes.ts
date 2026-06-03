import type { AppRole } from '@/modules/auth/types';

type RouteItem = {
  label: string;
  path: AppRoutePath;
  roles: AppRole[];
};

export type AppRoutePath =
  | '/solicitudes/nueva'
  | '/solicitudes/mias'
  | '/solicitudes/pendientes'
  | '/recepcion'
  | '/historial'
  | '/supervisor';

export const routeItems: RouteItem[] = [
  {
    label: 'Nueva solicitud',
    path: '/solicitudes/nueva',
    roles: ['solicitante', 'supervisor'],
  },
  {
    label: 'Mis solicitudes',
    path: '/solicitudes/mias',
    roles: ['solicitante', 'supervisor'],
  },
  {
    label: 'Pendientes',
    path: '/solicitudes/pendientes',
    roles: ['surtidor', 'supervisor'],
  },
  {
    label: 'Recepcion',
    path: '/recepcion',
    roles: ['supervisor'],
  },
  {
    label: 'Historial',
    path: '/historial',
    roles: ['supervisor'],
  },
  {
    label: 'Panel supervisor',
    path: '/supervisor',
    roles: ['supervisor'],
  },
];
