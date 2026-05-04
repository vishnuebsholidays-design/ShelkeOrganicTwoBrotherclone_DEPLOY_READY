import { Navigate } from 'react-router-dom';

function ProtectedUserRoute({ children }) {
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem('customerUser'));
  } catch (e) {
    user = null;
  }

  // If user NOT logged in → go to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If logged in → show page
  return children;
}

export default ProtectedUserRoute;