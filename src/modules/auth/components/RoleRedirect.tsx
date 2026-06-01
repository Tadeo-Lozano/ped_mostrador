import { Navigate } from 'react-router-dom';

import { LoadingState } from '@/shared/components/LoadingState';
import { useAuth } from '../hooks/useAuth';

export function RoleRedirect() {
  const { profile, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingState label="Cargando perfil" />;
  }

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  if (profile.role === 'surtidor') {
    return <Navigate to="/solicitudes/pendientes" replace />;
  }

  if (profile.role === 'supervisor') {
    return <Navigate to="/supervisor" replace />;
  }

  return <Navigate to="/solicitudes/nueva" replace />;
}
