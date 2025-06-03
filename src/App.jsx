import { BrowserRouter } from "react-router-dom";
import MainRoutes from "./routes/MainRoutes";
import { ToastContainer } from "react-toastify";
import OrganizationUserProvider from "./Hooks/OrganizationUserProvider";

function App() {
  return (
    <>
      <BrowserRouter>
        <OrganizationUserProvider>
          <ToastContainer />
          <MainRoutes />
        </OrganizationUserProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
