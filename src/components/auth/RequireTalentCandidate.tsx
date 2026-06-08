import { useAuth } from '@/hooks/useAuth';
import { Navigate, Outlet } from 'react-router-dom';

export function RequireTalentCandidate() {
  const { user } = useAuth();

  if (user?.role === 'organizer' || user?.role === 'vendor') {
    return <Navigate to="/access-denied" replace />;
  }

  if (user?.role === 'talent') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
