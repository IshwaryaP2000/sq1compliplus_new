import { BrowserRouter } from "react-router-dom";
import MainRoutes from "./routes/MainRoutes";
import { ToastContainer } from "react-toastify";
import OrganizationUserProvider from "./Hooks/OrganizationUserProvider";
import EmployeePortalRoute from "./routes/EmployeePortalRoute";

function App() {
  return (
    <>
      <BrowserRouter>
        <OrganizationUserProvider>
          <ToastContainer />
          <MainRoutes />
          <EmployeePortalRoute />
        </OrganizationUserProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
