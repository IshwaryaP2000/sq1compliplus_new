import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import MainRoutes from "./routes/MainRoutes";
import OrganizationUserProvider from "./Hooks/OrganizationUserProvider";
import { LoadingProvider } from "./hooks/LoadingContext";
import { LoadingBarContainer } from "react-top-loading-bar";
import { ErrorFallback } from "./pages/Errorpage/ErrorBoundaryPage";
import { ErrorBoundary } from "react-error-boundary";

function App() {
  return (
    <>
      <BrowserRouter>
        <LoadingProvider>
          <OrganizationUserProvider>
            <ToastContainer />
            <ErrorBoundary
              FallbackComponent={ErrorFallback}
              onReset={() => {
                // Optional: reset logic like clearing state or navigating
              }}
            >
              <LoadingBarContainer>
                <MainRoutes />
              </LoadingBarContainer>
            </ErrorBoundary>
          </OrganizationUserProvider>
        </LoadingProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
