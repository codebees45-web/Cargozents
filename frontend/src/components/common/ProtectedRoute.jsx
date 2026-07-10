import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import TruckLoader from './TruckLoader';

/**
 * Wrap any route that requires login. Optionally restrict to specific
 * roles: <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <TruckLoader label="Getting things ready…" />;

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
