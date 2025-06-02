import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types'; // Assuming UserRole type is in client/src/types.ts

interface RoleBasedRouteProps {
  allowedRoles: UserRole[];
  children?: React.ReactNode;
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Or a loading indicator
  }

  // If user is not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check if user has one of the allowed roles
  if (!allowedRoles.includes(user.role as UserRole)) {
    // Redirect to an unauthorized page or home page
    return <Navigate to="/unauthorized" replace />;
  }

  // If user is authenticated and has an allowed role, render the children or outlet
  return children ? <>{children}</> : <Outlet />;
};

export default RoleBasedRoute; 