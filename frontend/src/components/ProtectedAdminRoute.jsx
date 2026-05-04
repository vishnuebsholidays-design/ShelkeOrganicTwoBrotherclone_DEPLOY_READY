import { Navigate } from 'react-router-dom';

function ProtectedAdminRoute({ children }) {
  const adminKey = localStorage.getItem('adminKey');

  if (!adminKey) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

export default ProtectedAdminRoute;