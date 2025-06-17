import { Routes, Route } from "react-router-dom";
import AllPolicy from "../pages/employeePortal/AllPolicy";
import ViewPolicy from "../pages/EmployeePortal/ViewPolicy";
import ChangePassword from "../pages/EmployeePortal/Profile/ChangePassword";
import AcceptedPolicy from "../pages/EmployeePortal/AcceptedPolicy";
import NoPage from "../pages/Errorpage/NoPage";

function EmployeePortalRoute() {
  return (
    <Routes>
      <Route path="all-policy" element={<AllPolicy />} />
      <Route path="policy/:id" element={<ViewPolicy />} />
      <Route path="accepted-policy" element={<AcceptedPolicy />} />
      <Route path="profile" element={<ChangePassword />} />
      <Route path="*" element={<NoPage />} />
    </Routes>
  );
}

export default EmployeePortalRoute;
