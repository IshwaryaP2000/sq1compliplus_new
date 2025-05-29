import { BrowserRouter } from "react-router-dom";
import MainRoutes from "./routes/MainRoutes";
import OrganizationProvider from "./hooks/OrganizationUserProvider";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <>
      <BrowserRouter>
        <OrganizationProvider>
          <ToastContainer />
          <MainRoutes />
        </OrganizationProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
