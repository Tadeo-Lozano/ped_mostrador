import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { LoadingState } from '@/shared/components/LoadingState';
import type { AppRole } from '../types';
import { useAuth } from '../hooks/useAuth';

type ProtectedRouteProps = {
  allowedRoles?: AppRole[];
};

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { profile, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingState label="Validando sesión" />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
