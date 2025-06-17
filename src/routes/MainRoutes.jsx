import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";
import { Routes, Route } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { setNavigator } from "../utils/navigation";
import LandingPage from "../layout/LandingPage";
import InternalserverPage from "../pages/Errorpage/InternalserverPage";
import { useEffect } from "react";
import Login from "../pages/Authentication/Login";
import MFA from "../pages/Authentication/MFA";
import NoPage from "../pages/Errorpage/NoPage";
import ForbiddenPage from "../pages/Errorpage/ForbiddenPage";
import TooManyRequests from "../pages/Errorpage/TooManyRequests";
import Unavailable from "../pages/Errorpage/unavailable";
import Dashboard from "../pages/Dashboard/Dashboard";
import Layout from "../layout/Layouts";
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
import Controls from "../pages/Settings/Subpages/Compliance/Controls";
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
import ReadinessAnswers from "../pages/Settings/Subpages/ComplianceReadiness/ReadinessAnswers";
import ReadinessView from "../pages/Settings/Subpages/readiness/ReadinessViewTable";
import UserOrganization from "../pages/Settings/Subpages/User/UserOrganization";
import NewUser from "../pages/Settings/Subpages/Organizations/OrganizationUsers";
import EmployeeLogin from "../pages/employeePortal/Authentication/Login";
import EmployeeLayout from "../pages/employeePortal/Includes/EmployeeLayout";
import EmployeePortalRoute from "../routes/EmployeePortalRoute";
import Employeeforgotpassword from "../pages/employeePortal/Authentication/ForgotPassword";
import NewPassword from "../pages/employeePortal/Profile/NewPassword";
import ActivePolicy from "../pages/Settings/Subpages/Policy/ActivePolicy";
import WaitingPolicy from "../pages/Settings/Subpages/Policy/WaitingPolicy";
import PendingApproval from "../pages/Settings/Subpages/Policy/PendingApproval";
import AllPolicy from "../pages/Settings/Subpages/Policy/AllPolicy";
import MyPolicy from "../pages/Settings/Subpages/Policy/MyPolicy";
import Employee from "../pages/Settings/Subpages/Employees/Employees";
import BulkUploadEmployees from "../pages/Settings/Subpages/Employees/BulkEmployee";
import ReadinessViewAnswers from "../pages/Settings/Subpages/ComplianceReadiness/ReadinessViewAnswers";
import Policy from "../pages/Settings/Subpages/Policy/Policy";
import PolicyTemplate from "../pages/Settings/Subpages/PolicySettings/PolicyTemplate";
import AdminPolicy from "../pages/Settings/Subpages/PolicySettings/AdminPolicy";
import ApprovalCategories from "../pages/Settings/Subpages/PolicySettings/ApprovalCategories";
import Vendor from "../pages/Settings/Subpages/VendorPortal/Vendor";
import VendorCreate from "../pages/Settings/Subpages/VendorPortal/VendorCreate";
import ChangePassword from "../pages/Authentication/ChangePassword";
import ChangePasswordVendor from "../pages/Settings/Subpages/VendorPortal/profile/ChangePassword";
import VendorAssessment from "../pages/Settings/Subpages/VendorPortal/VendorAssessment";
import VendorFileView from "../pages/Settings/Subpages/VendorPortal/VendorFileView";
import Questions from "../pages/Settings/Subpages/Vendors/Questions";
import { PreApprovedVendor } from "../pages/Settings/Subpages/Vendors/PreApprovedVendor";
import BulkUploadQuestion from "../pages/Settings/Subpages/Vendors/BulkUploadQuestion";
import AddQuestions from "../pages/Settings/Subpages/Vendors/AddQuestions";
import {
  AuthEmployeeMiddleware,
  AuthUserMiddleware,
  AuthUserProtectedMiddleware,
  AuthVendorMiddleware,
  GuestMiddleware,
  RoleAccessMiddleware,
} from "../middleware/Middleware";
import UnAuthorized from "../pages/Errorpage/UnAuthorized";
import SsoRedirect from "../pages/Authentication/SsoRedirect";
import ValidateUpload from "../pages/Settings/Subpages/Vendors/ValidateUpload";
import VendorDashbord from "../pages/Settings/Subpages/Vendors/VendorDashbord";
import AssessmentView from "../pages/Settings/Subpages/Vendors/AssessmentView";
import PreApprovedAssessment from "../pages/Settings/Subpages/Vendors/PreApprovedAssessment";
import Notification from "../pages/Settings/Subpages/Notification/Notification";
import VendorNew from "../pages/Settings/Subpages/VendorPortal/Vendor";
import VendorLogin from "../pages/Settings/Subpages/VendorPortal/Authentication/Login";
import VendorLayout from "../pages/Settings/Subpages/VendorPortal/includes/VendorLayout";
import Vendorforgotpassword from "../pages/Settings/Subpages/VendorPortal/Authentication/ForgotPassword";
import VendorPortalRoute from "./VendorPortalRoute";

function MainRoutes() {
  const navigate = useNavigate();
  useEffect(() => {
    setNavigator(navigate);
  }, [navigate]);

  return (
    <Routes>
      {/* ------- Landing Page ------- */}
      <Route
        path="/"
        element={
          <GuestMiddleware>
            <LandingPage />
          </GuestMiddleware>
        }
      />

      {/* ------- Login ------- */}
      <Route
        path="/login"
        element={
          <AuthUserMiddleware>
            <Login />
          </AuthUserMiddleware>
        }
      />

      {/* ------- Authentication ------- */}
      <Route element={<AuthUserMiddleware />}>
        <Route path="/authentication/mfa-verify" element={<MFA />} />
        <Route path="/authentication/mfa-scan-qr-code" element={<MFAQr />} />
      </Route>

      {/* ------- Initial Setup ------- */}
      <Route
        path="/organization/initial-setup"
        element={
          <>
            <AuthUserProtectedMiddleware />
            <OrganizationInitialSetup />
          </>
        }
      />

      {/* ------- SSO Auth ------- */}
      <Route path="/user/sso-auth" element={<SsoRedirect />} />

      {/* ------- Guest User Routes ------- */}
      <Route element={<GuestMiddleware />}>
        <Route path="/user/verify-link" element={<VerifyAndRedirect />} />
        <Route path="/user/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/user/registration/:verify_token?"
          element={<Registration />}
        />
        <Route
          path="/user/update/forgot-password/:verify_token?"
          element={<UpdateForgotPassword />}
        />
      </Route>

      {/* ------- Protected Routes ------- */}
      <Route
        element={
          <AuthUserProtectedMiddleware>
            <Layout />
          </AuthUserProtectedMiddleware>
        }
      >
        {/* --- Dashboard --- */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* --- Settings --- */}
        <Route path="/settings/users" element={<User />} />
        <Route element={<RestrictedRouteWrapper />}>
          <Route path="/settings/readiness" element={<Readiness />} />
        </Route>
        <Route
          path="/settings/readiness-answers"
          element={<ReadinessAnswers />}
        />
        <Route path="/settings/readiness" element={<ReadinessView />} />
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
        <Route
          path="/settings/user-organization/:id"
          element={<UserOrganization />}
        />
        <Route element={<RestrictedRouteWrapper />}>
          <Route
            path="/organizations/readiness/answers/:id"
            element={<ReadinessViewAnswers />}
          />
        </Route>
        <Route path="/settings/organization/users/:id" element={<NewUser />} />
        <Route path="/profile/change-password" element={<ChangePassword />} />
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
        <Route path="/compli-settings" element={<DepartmentsPage />} />
        <Route path="/settings/controls" element={<Controls />} />
        <Route path="/settings/question" element={<Questions />} />
        <Route
          path="/settings/add-pre-approved-vendor"
          element={<PreApprovedVendor />}
        />
        <Route
          path="/settings/upload-question"
          element={<BulkUploadQuestion />}
        />
        <Route path="/settings/add-questions" element={<AddQuestions />} />
        <Route path="/settings/add-question" element={<AddQuestion />} />
        <Route path="/settings/validate-upload" element={<ValidateUpload />} />
        <Route path="/settings/vendor-dashbord" element={<VendorDashbord />} />
        <Route path="/settings/assessment-view" element={<AssessmentView />} />
        <Route path="/settings/sso-setup" element={<SsoSetup />} />
        <Route path="/settings/policy-template" element={<PolicyTemplate />} />
        <Route path="/settings/admin-policy" element={<AdminPolicy />} />
        <Route
          path="/settings/approval-process"
          element={<ApprovalCategories />}
        />
        <Route
          path="/pre-approved-assessment-view/:id"
          element={<PreApprovedAssessment />}
        />

        {/* --- Compliance & Assets --- */}
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

        {/* --- Policy Routes --- */}
        <Route element={<RestrictedRouteWrapper />}>
          <Route
            path="/policy/*"
            element={
              <>
                <Policy />
                <Routes>
                  <Route path="active" element={<ActivePolicy />} />
                  <Route path="waiting" element={<WaitingPolicy />} />
                  <Route path="approval" element={<PendingApproval />} />
                  <Route path="my-policy" element={<MyPolicy />} />
                  <Route path="all" element={<AllPolicy />} />
                  <Route path="employees" element={<Employee />} />
                  <Route
                    path="employees/bulk-upload"
                    element={<BulkUploadEmployees />}
                  />
                </Routes>
              </>
            }
          />
        </Route>

        {/* --- Vendor Routes --- */}
        <Route element={<RestrictedRouteWrapper />} />
        <Route
          path="/vendors/*"
          element={
            <>
              <Routes>
                <Route path="/" element={<Vendor />} />
                <Route path="/vendors-new" element={<VendorNew />} />
                <Route path="/vendor-create" element={<VendorCreate />} />
                <Route
                  path="/change-password"
                  element={<ChangePasswordVendor />}
                />
                <Route
                  path="/assessment-view/:id"
                  element={<VendorAssessment />}
                />
                <Route path="/file-view/:id" element={<VendorFileView />} />
              </Routes>
            </>
          }
        />

        {/* --- Notification --- */}
        <Route
          path="/notification"
          element={
            <RestrictedRouteWrapper
              path="/notification"
              element={<Notification />}
            />
          }
        />
      </Route>

      {/* <Route
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
      /> */}

      {/* ------- Employee Portal ------- */}
      {/* <Route
        path="/employee/login"
        element={
          <AuthEmployeeMiddleware isLoginPage={true}>
            <EmployeeLogin />
          </AuthEmployeeMiddleware>
        }
      /> */}
      <Route
        path="/employee/login"
        element={AuthEmployeeMiddleware(<EmployeeLogin />, true)}
      />

      <Route path="/employee" element={<EmployeeLayout />}>
        <Route
          path="/employee/*"
          element={AuthEmployeeMiddleware(<EmployeePortalRoute />)}
        />
      </Route>

      <Route
        path="/employee/forgot-password"
        element={<Employeeforgotpassword />}
      />
      <Route path="/employee/change-password" element={<NewPassword />} />

      {/* ------- Vendor Portal ------- */}

      <Route
        path="/vendor-portal/login"
        element={AuthVendorMiddleware(<VendorLogin />, true)}
      />

      {/* <Route path="/vendor-portal" element={<VendorLayout />}>
        <Route
          path="/vendor-portal/*"
          element={AuthVendorMiddleware(<VendorPortalRoute />)}
        />
      </Route> */}

       <Route
        path="/vendor-portal/*"
        element={AuthVendorMiddleware(<VendorPortalRoute />)}
      />

      <Route
        path="/vendor-portal/forgot-password"
        element={
          <>
            <Vendorforgotpassword />
          </>
        }
      />

      {/* ------- Error Routes ------- */}
      <Route path="/forbidden" element={<ForbiddenPage />} />
      <Route path="/too-many-request" element={<TooManyRequests />} />
      <Route path="/service-unavailable" element={<Unavailable />} />
      <Route path="/UnAuthorized" element={<UnAuthorized />} />
      <Route
        path="/500-internal-server-error"
        element={<InternalserverPage />}
      />

      {/* ------- Fallback Route ------- */}
      <Route path="*" element={<NoPage />} />
    </Routes>
  );
}
export default MainRoutes;
