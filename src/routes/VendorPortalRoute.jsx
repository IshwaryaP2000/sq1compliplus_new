import { Routes, Route } from "react-router-dom";
import VendorDashboard from "../pages/Settings/Subpages/VendorPortal/Dashboard";
import ChangePassword from "../pages/Settings/Subpages/VendorPortal/profile/ChangePassword";
import AssessmentView from "../pages/Settings/Subpages/VendorPortal/AssessmentView";
import VendorUsers from "../pages/Settings/Subpages/VendorPortal/VendorUsers";
import DashboardTwo from "../pages/Settings/Subpages/VendorPortal/DashboardTwo";
import NoPage from "../pages/Errorpage/NoPage";
import VendorLayout from "../pages/Settings/Subpages/VendorPortal/includes/VendorLayout";

function VendorPortalRoute() {
  return (
    <>
      {/* <Routes>
        <Route path="/dashboard" element={<VendorDashboard />} />
        <Route path="/profile" element={<ChangePassword />} />
        <Route path="/assessment-view" element={<AssessmentView />} />
        <Route path="/assessment-view" element={<AssessmentView />} />
        <Route path="/users" element={<VendorUsers />} />
        <Route path="/new-dashboard" element={<DashboardTwo />} />
        <Route path="*" element={<NoPage />} />
      </Routes> */}
      <VendorLayout>
        <Routes>
          <Route path="dashboard" element={<VendorDashboard />} />
          <Route path="profile" element={<ChangePassword />} />
          <Route path="assessment-view" element={<AssessmentView />} />
          <Route path="users" element={<VendorUsers />} />
          <Route path="new-dashboard" element={<DashboardTwo />} />
          <Route path="*" element={<NoPage />} />
        </Routes>
      </VendorLayout>
    </>
  );
}

export default VendorPortalRoute;
