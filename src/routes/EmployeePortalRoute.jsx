import { Routes, Route } from "react-router-dom";
import AllPolicy from "../pages/employeePortal/AllPolicy";
import ViewPolicy from "../pages/employeePortal/ViewPolicy";
import ChangePassword from "../pages/employeePortal/profile/ChangePassword";
import AcceptedPolicy from "../pages/employeePortal/AcceptedPolicy";
import NoPage from "../pages/Errorpage/NoPage";
import { AuthEmployeeMiddleware } from "../middleware/Middleware";
import EmployeeLogin from "../pages/employeePortal/Authentication/Login";
import Employeeforgotpassword from "../pages/employeePortal/Authentication/ForgotPassword";
import NewPassword from "../pages/employeePortal/profile/NewPassword";
import EmployeeLayout from "../pages/employeePortal/includes/EmployeeLayout";

function EmployeePortalRoute() {
  return (
    <Routes>
      <Route path="/employee" element={<EmployeeLayout />}>
        <Route
          path="/employee/forgot-password"
          element={<Employeeforgotpassword />}
        />
        <Route path="/employeechange-password" element={<NewPassword />} />

        <Route element={<AuthEmployeeMiddleware />}>
          <Route path="/employee/login" element={<EmployeeLogin />} />
          <Route path="/employee/all-policy" element={<AllPolicy />} />
          <Route path="/employee/policy/:id" element={<ViewPolicy />} />
          <Route
            path="/employee/accepted-policy"
            element={<AcceptedPolicy />}
          />
          <Route path="/employee/profile" element={<ChangePassword />} />
        </Route>

        <Route path="*" element={<NoPage />} />
      </Route>
    </Routes>
  );
}

export default EmployeePortalRoute;
