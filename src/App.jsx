import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import MainRoutes from "./routes/MainRoutes";
import OrganizationUserProvider from "./Hooks/OrganizationUserProvider";
import { LoadingProvider } from "./hooks/LoadingContext";
import { LoadingBarContainer } from "react-top-loading-bar";

function App() {
  return (
    <>
      <BrowserRouter>
        <LoadingProvider>
          <OrganizationUserProvider>
            <ToastContainer />
            <LoadingBarContainer>
              <MainRoutes />
            </LoadingBarContainer>
          </OrganizationUserProvider>
        </LoadingProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
