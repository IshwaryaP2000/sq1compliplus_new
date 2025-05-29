import { useEffect } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  getAuthToken,
  getCurrentOrganization,
  getCurrentUser,
  hasRole,
  logout,
} from "../utils/UtilsGlobalData";
import { toast } from "react-toastify";

export const AuthUserProtectedMiddleware = ({ children }) => {
  const portal = localStorage.getItem("portal");
  const currentUser = getCurrentUser();
  const authToken = getAuthToken();

  if (portal === "vendor") {
    return <Navigate to="/unauthorized" replace />;
  }

  if (!currentUser || !authToken) {
    return <Navigate to="/login" replace />;
  }

  const currentOrganization = getCurrentOrganization();
  if (currentOrganization?.auth_type === "login") {
    switch (currentUser.scope) {
      case "verifiedMFA":
        return children;

      case "registered":
        return <Navigate to="/authentication/mfa-scan-qr-code" replace />;

      case "unverifiedMFA":
        return <Navigate to="/authentication/mfa-verify" replace />;

      default:
        logout();
        return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export const AuthUserMiddleware = ({ children }) => {
  const location = useLocation();
  const currentUser = getCurrentUser();
  const authToken = getAuthToken();

  if (currentUser && authToken) {
    if (currentUser?.scope === "verifiedMFA") {
      return <Navigate to="/dashboard" replace />;
    }
  } else {
    // Avoid redirect loop if already on login page
    if (location.pathname !== "/login") {
      logout();
      return <Navigate to="/login" replace />;
    }
  }
  // return children;
    return children ? children : <Outlet />;
};

export const GuestMiddleware = ({ children }) => {
  const currentUser = getCurrentUser();
  const authToken = getAuthToken();
  if (currentUser && authToken) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

export const RoleAccessMiddleware = ({ children, requiredRoles }) => {
  const userHasAccess = hasRole(requiredRoles);
  console.log(userHasAccess, "userHasAccess");

  if (!userHasAccess) {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
};

export const AuthVendorMiddleware = (element, isLoginPage = false) => {
  const portal = localStorage.getItem("portal");
  const navigate = useNavigate();

  const isAuthenticated = () => {
    return localStorage.getItem("authToken") !== null;
  };

  const ProtectedRoute = () => {
    if (!isAuthenticated()) {
      if (portal !== "vendor") {
        return navigate("/unauthorized");
      }
      return navigate("/vendor-portal/login");
    }
    return element;
  };

  const ProtectedRouteLogin = () => {
    if (isAuthenticated() && isLoginPage) {
      return navigate("/vendor-portal/dashboard");
    }
    return element;
  };

  return isLoginPage ? ProtectedRouteLogin() : ProtectedRoute();
};

export const AuthEmployeeMiddleware = (element, isLoginPage = false) => {
  const portal = localStorage.getItem("portal");
  const employee_status = localStorage.getItem("employee_status");
  const navigate = useNavigate();

  const isAuthenticated = () => {
    return localStorage.getItem("authToken") !== null;
  };

  const ProtectedRoute = () => {
    if (!isAuthenticated()) {
      if (portal !== "employee") {
        return navigate("/unauthorized");
      }
      return navigate("/employee/login");
    }
    if (employee_status !== "active") {
      toast.error("Please update your password to go further pages");
      return navigate("/employee/change-password");
    }
    return element;
  };

  const ProtectedRouteLogin = () => {
    if (isAuthenticated() && isLoginPage) {
      if (employee_status !== "active") {
        toast.error("Please update your password to go further pages");
        return navigate("/employee/change-password");
      }
      return navigate("/employee/all-policy");
    }
    return element;
  };
  return isLoginPage ? ProtectedRouteLogin() : ProtectedRoute();
};
