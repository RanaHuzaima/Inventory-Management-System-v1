import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  session: any;
}

const ProtectedRoute = ({ session }: ProtectedRouteProps) => {
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;