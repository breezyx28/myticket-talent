import { useAuth } from '@/hooks/useAuth';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export function RequireTalentCandidate() {
  const { user } = useAuth();
  const location = useLocation();

  if (user?.role === 'organizer' || user?.role === 'vendor') {
    return <Navigate to="/access-denied" replace />;
  }

  if (user?.role === 'talent') {
    if (location.pathname.startsWith('/application/status')) {
      return <Outlet />;
    }
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
