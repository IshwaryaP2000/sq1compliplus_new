import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";
import { Routes, Route } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { setNavigator } from "../utils/navigation";
import LandingPage from "../Layout/LandingPage";
import InternalserverPage from "../pages/Errorpage/InternalserverPage";
import { useEffect } from "react";
import Login from "../pages/Authentication/Login";
import MFA from "../pages/Authentication/MFA";
import NoPage from "../pages/Errorpage/NoPage";
import {
  AuthUserMiddleware,
  AuthUserProtectedMiddleware,
  GuestMiddleware,
  RoleAccessMiddleware,
} from "../middleware/Middleware";
import Dashboard from "../pages/Dashboard/Dashboard";
import Layout from "../Layout/Layouts";
import User from "../pages/Settings/Subpages/User/User";
import MFAQr from "../pages/Authentication/MFAQr";
import Organization from "../pages/Settings/Subpages/Organizations/Organization";
// import AuditLogs from "../pages/Settings/Subpages/logs/AuditLogs";
// import ActivityLogs from "../pages/Settings/Subpages/logs/ActivityLogs";

function MainRoutes() {
  const navigate = useNavigate();
  useEffect(() => {
    setNavigator(navigate);
  }, [navigate]);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <GuestMiddleware>
            <LandingPage />
          </GuestMiddleware>
        }
      />
      <Route
        path="/login"
        element={
          <>
            <AuthUserMiddleware>
              <Login />
            </AuthUserMiddleware>
          </>
        }
      />
      <Route
        element={
          <AuthUserProtectedMiddleware>
            <Layout />
          </AuthUserProtectedMiddleware>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings/users" element={<User />} />
        <Route
          path="/settings/organizations"
          element={
            <RoleAccessMiddleware
              requiredRoles={["sq1_super_admin", "sq1_admin", "sq1_user"]}
            >
              <Organization />
            </RoleAccessMiddleware>
          }
        />
        {/* <Route path="/settings/audit-logs" element={<AuditLogs />} />
        <Route path="/settings/activity-logs" element={<ActivityLogs />} /> */}
      </Route>

      <Route
        path="/authentication/mfa-verify"
        element={
          <AuthUserMiddleware>
            <MFA />
          </AuthUserMiddleware>
        }
      />

      <Route
        path="/authentication/mfa-scan-qr-code"
        element={
          <AuthUserMiddleware>
            <MFAQr />
          </AuthUserMiddleware>
        }
      />

      <Route
        path="/500-internal-server-error"
        element={<InternalserverPage />}
      />
      <Route path="*" element={<NoPage />} />
    </Routes>
  );
}
export default MainRoutes;
