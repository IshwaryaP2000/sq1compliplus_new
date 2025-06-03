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
import ForbiddenPage from "../pages/Errorpage/ForbiddenPage";
import TooManyRequests from "../pages/Errorpage/TooManyRequests";
import Unavailable from "../pages/Errorpage/unavailable";
import {
  AuthUserMiddleware,
  AuthUserProtectedMiddleware,
  GuestMiddleware,
  RoleAccessMiddleware,
} from "../Middleware/Middleware";
import Dashboard from "../pages/Dashboard/Dashboard";
import Layout from "../Layout/Layouts";
import User from "../pages/Settings/Subpages/User/User";
import MFAQr from "../pages/Authentication/MFAQr";
import Organization from "../pages/Settings/Subpages/Organizations/Organization";
import Registration from "../pages/Authentication/Registration";
import ForgotPassword from "../pages/Authentication/ForgotPassword";
import UpdateForgotPassword from "../pages/Authentication/UpdateForgotPassword";
import VerifyAndRedirect from "../pages/Authentication/VerifyAndRedirect";
import AuditLogs from "../pages/Settings/Subpages/Logs/AuditLogs";
import ActivityLogs from "../pages/Settings/Subpages/Logs/ActivityLogs";
import OrganizationInitialSetup from "../pages/Authentication/OrganizationInitialSetup";
import Organizationinfo from "../pages/Settings/Subpages/Info/Organizationinfo";
import Controls from "../pages/Settings/Subpages/compliance/Controls";
import AddQuestion from "../pages/Settings/Subpages/Readiness/AddQuestion";
import ComplexIntegration from "../pages/Settings/Subpages/Compliances/ComplianceIntegration";
import RestrictedRouteWrapper from "../routes/RestrictedRoutesComponent";
import Index from "../pages/Settings/Subpages/Compliances/Index";
import Hipaa from "../pages/Settings/Subpages/Compliances/Hipaa";
import Soc from "../pages/Settings/Subpages/Compliances/Soc";
import Assets from "../pages/Settings/Subpages/Assets/Assets";
import Readiness from "../pages/Settings/Subpages/ComplianceReadiness/Readiness";
import DepartmentsPage from "../pages/Settings/Subpages/Compliances/DepartmentAdd";
import QuestionsImport from "../pages/Settings/Subpages/Compliances/QuestionsImport";
import SsoSetup from "../pages/Settings/Subpages/SSO/SsoSetup";

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
        <Route path="/settings/audit-logs" element={<AuditLogs />} />
        <Route path="/settings/activity-logs" element={<ActivityLogs />} />
        <Route
          path="/settings/organization-info"
          element={
            <>
              <RoleAccessMiddleware
                requiredRoles={["sq1_super_admin", "sq1_admin", "admin"]}
              >
                <Organizationinfo />
              </RoleAccessMiddleware>
            </>
          }
        />
        <Route
          path="/settings/compli-integration"
          element={<ComplexIntegration />}
        />
        <Route path="/settings/controls" element={<Controls />} />
        <Route path="/settings/add-question" element={<AddQuestion />} />
        <Route path="/settings/sso-setup" element={<SsoSetup />} />

        <Route element={<RestrictedRouteWrapper />}>
          <Route path="/assets" element={<Assets />} />
          <Route path="/compliance/iso" element={<Index />} />
          <Route path="/compliance/hipaa" element={<Hipaa />} />
          <Route path="/compliance/soc" element={<Soc />} />
          <Route path="/readiness" element={<Readiness />} />
          <Route path="/integration" element={<ComplexIntegration />} />
          <Route path="/departments" element={<DepartmentsPage />} />
          <Route path="/questions-import" element={<QuestionsImport />} />
          <Route path="/readiness" element={<Readiness />} />
        </Route>
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
        path="/organization/initial-setup"
        element={
          <>
            <AuthUserProtectedMiddleware /> <OrganizationInitialSetup />
          </>
        }
      />

      <Route element={<GuestMiddleware />}>
        <Route
          path="/user/registration/:verify_token?"
          element={<Registration />}
        />
        <Route path="/user/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/user/update/forgot-password/:verify_token?"
          element={<UpdateForgotPassword />}
        />
        <Route path="/user/verify-link" element={<VerifyAndRedirect />} />
      </Route>

      {/* Error Routes starts*/}
      <Route
        path="/500-internal-server-error"
        element={<InternalserverPage />}
      />
      <Route path="/forbidden" element={<ForbiddenPage />} />
      <Route path="/too-many-request" element={<TooManyRequests />} />
      <Route path="/service-unavailable" element={<Unavailable />} />
      {/* Error Routes Ends*/}

      <Route path="*" element={<NoPage />} />
    </Routes>
  );
}
export default MainRoutes;
