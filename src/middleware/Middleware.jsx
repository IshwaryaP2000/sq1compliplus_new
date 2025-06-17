import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getAuthToken,
  getCurrentOrganization,
  getCurrentUser,
  hasRole,
  logout,
} from "../utils/UtilsGlobalData";
import { useEffect } from "react";

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
    if (location.pathname !== "/login") {
      logout();
      return <Navigate to="/login" replace />;
    }
  }
  return children ? children : <Outlet />;
};

export const GuestMiddleware = ({ children }) => {
  const currentUser = getCurrentUser();
  const authToken = getAuthToken();
  if (currentUser && authToken) {
    return <Navigate to="/dashboard" replace />;
  }
  return children ? children : <Outlet />;
};

export const RoleAccessMiddleware = ({ children, requiredRoles }) => {
  const userHasAccess = hasRole(requiredRoles);

  if (!userHasAccess) {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
};

export const AuthVendorMiddleware = (element, isLoginPage = false) => {
  // localStorage.setItem("portal", "vendor");
  const portal = localStorage.getItem("portal");

  const isAuthenticated = () => {
    return localStorage.getItem("authToken") !== null;
  };

  const ProtectedRoute = () => {
    if (!isAuthenticated()) {
      if (portal !== "vendor") {
        return <Navigate to="/unauthorized" />;
      }
      return <Navigate to="/vendor-portal/login" />;
    }
    return element;
  };

  const ProtectedRouteLogin = () => {
    if (isAuthenticated() && isLoginPage) {
      return <Navigate to="/vendor-portal/dashboard" />;
    }
    return element;
  };

  return isLoginPage ? ProtectedRouteLogin() : ProtectedRoute();
};

// export const AuthEmployeeMiddleware = (element, isLoginPage = false) => {
//   const portal = localStorage.getItem("portal");
//   const employee_status = localStorage.getItem("employee_status");

//   const isAuthenticated = () => {
//     return localStorage.getItem("authToken") !== null;
//   };

//   const ProtectedRoute = () => {
//     if (!isAuthenticated()) {
//       if (portal !== "employee") {
//         return <Navigate to="/unauthorized" />;
//       }
//       return <Navigate to="/employee/login" />;
//     }
//     if (employee_status !== "active") {
//       toast.error("Please update your password to go further pages");
//       return <Navigate to="/employee/change-password" />;
//     }
//     return element;
//   };

//   const ProtectedRouteLogin = () => {
//     if (isAuthenticated() && isLoginPage) {
//       if (employee_status !== "active") {
//         toast.error("Please update your password to go further pages");
//         return <Navigate to="/employee/change-password" />;
//       }
//       return <Navigate to="/employee/all-policy" />;
//     }
//     return element;
//   };
//   return isLoginPage ? ProtectedRouteLogin() : ProtectedRoute();
// };

export const AuthEmployeeMiddleware = (element, isLoginPage = false) => {
  const portal = localStorage.getItem("portal");
  const employee_status = localStorage.getItem("employee_status");

  const isAuthenticated = () => {
    return localStorage.getItem("authToken") !== null;
  };

  function ProtectedRoute() {
    useEffect(() => {
      if (!isAuthenticated()) {
        if (portal !== "employee") return;
        // No toast here for unauthorized
      } else if (employee_status !== "active") {
        toast.error("Please update your password to go further pages");
      }
    }, []);

    if (!isAuthenticated()) {
      if (portal !== "employee") {
        return <Navigate to="/unauthorized" />;
      }
      return <Navigate to="/employee/login" />;
    }
    if (employee_status !== "active") {
      return <Navigate to="/employee/change-password" />;
    }
    return element;
  }

  function ProtectedRouteLogin() {
    useEffect(() => {
      if (isAuthenticated() && isLoginPage && employee_status !== "active") {
        toast.error("Please update your password to go further pages");
      }
    }, []);

    if (isAuthenticated() && isLoginPage) {
      if (employee_status !== "active") {
        return <Navigate to="/employee/change-password" />;
      }
      return <Navigate to="/employee/all-policy" />;
    }
    return element;
  }

  return isLoginPage ? <ProtectedRouteLogin /> : <ProtectedRoute />;
};
