import { Navigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext.jsx';

export default function AdminRoute({ children }) {
  const { isAdmin, isLoading } = useAdmin();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin-panel" state={{ from: location }} replace />;
  }

  return children;
}
