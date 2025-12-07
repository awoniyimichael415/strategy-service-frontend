import { Navigate, useLocation } from 'react-router-dom';
import { isSubscriptionActive } from '@/lib/metamask';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const token = localStorage.getItem('token');
  const location = useLocation();
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Allow access to subscription page without active subscription
  if (location.pathname === '/subscription') {
    return <>{children}</>;
  }

  // Check if user has active subscription
  const hasActiveSubscription = isSubscriptionActive();
  
  if (!hasActiveSubscription) {
    return <Navigate to="/subscription" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
