import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";


export default function ProtectedRoute({ children, requiredRole }) {
  const { currentUser, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-(--color-ink)/60">
        Checking your session...
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && role !== requiredRole) {
    
    return <Navigate to="/" replace />;
  }

  return children;
}
