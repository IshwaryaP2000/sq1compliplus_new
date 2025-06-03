import { Navigate, Outlet, useLocation } from "react-router-dom";
import { hasRole } from "../utils/UtilsGlobalData";

// This component will restrict routes based on user role
// If user is sq1_super_admin, they can only access dashboard and settings
const RestrictedRouteWrapper = ({ element, path }) => {
  // Check if user is sq1_super_admin
  const location = useLocation();
  const isSq1SuperAdmin = hasRole(["sq1_super_admin"]);

  // Allowed paths for sq1_super_admin
  const allowedPathsForSq1SuperAdmin = [
    "/dashboard",
    "/settings",
    "/organizations",
  ];

  // If user is sq1_super_admin and trying to access a restricted path
  if (isSq1SuperAdmin) {
    // Check if the current path is allowed
    const isAllowedPath = allowedPathsForSq1SuperAdmin.some(
      (allowedPath) =>
        location.path === allowedPath ||
        location.path.startsWith(allowedPath + "/")
    );

    // If not allowed, redirect to unauthorized page
    if (!isAllowedPath) {
      return <Navigate to="/UnAuthorized" replace />;
    }
  }

  // For all other roles or allowed paths, render the component
  return element ? element : <Outlet />;
};

export default RestrictedRouteWrapper;
