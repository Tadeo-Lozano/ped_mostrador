import { createBrowserRouter, Navigate } from 'react-router-dom';

import { LoginPage } from '@/modules/auth/pages/LoginPage';
import { ProtectedRoute } from '@/modules/auth/components/ProtectedRoute';
import { RoleRedirect } from '@/modules/auth/components/RoleRedirect';
import { CreateRequestPage } from '@/modules/requests/pages/CreateRequestPage';
import { MyRequestsPage } from '@/modules/requests/pages/MyRequestsPage';
import { PendingRequestsPage } from '@/modules/requests/pages/PendingRequestsPage';
import { MovementsHistoryPage } from '@/modules/movements/pages/MovementsHistoryPage';
import { SupervisorDashboardPage } from '@/modules/supervisor/pages/SupervisorDashboardPage';
import { MainLayout } from '@/shared/layouts/MainLayout';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <RoleRedirect />,
          },
          {
            path: 'solicitudes/nueva',
            element: (
              <ProtectedRoute allowedRoles={['solicitante', 'supervisor']} />
            ),
            children: [{ index: true, element: <CreateRequestPage /> }],
          },
          {
            path: 'solicitudes/mias',
            element: (
              <ProtectedRoute allowedRoles={['solicitante', 'supervisor']} />
            ),
            children: [{ index: true, element: <MyRequestsPage /> }],
          },
          {
            path: 'solicitudes/pendientes',
            element: <ProtectedRoute allowedRoles={['surtidor', 'supervisor']} />,
            children: [{ index: true, element: <PendingRequestsPage /> }],
          },
          {
            path: 'historial',
            element: <ProtectedRoute allowedRoles={['supervisor']} />,
            children: [{ index: true, element: <MovementsHistoryPage /> }],
          },
          {
            path: 'supervisor',
            element: <ProtectedRoute allowedRoles={['supervisor']} />,
            children: [{ index: true, element: <SupervisorDashboardPage /> }],
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
