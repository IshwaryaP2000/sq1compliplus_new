import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../../styles/Stackflo.css";
import { useNavigate } from "react-router-dom";
import { getApi } from "../../services/apiService";
import { setAuthToken, setCurrentUser } from "../../utils/UtilsGlobalData";
import { useAuthOrganization } from "../../Hooks/OrganizationUserProvider";
import usePageTitle from "../../utils/usePageTitle";

const SsoRedirect = () => {
  usePageTitle("SSO Redirect");
  const navigate = useNavigate();
  const { setAuthUser } = useAuthOrganization();
  const location = useLocation();
  const portal = localStorage.getItem("portal");

  useEffect(() => {
    const redirectAuth = async () => {
      try {
        const PortalURI =
          portal === "vendor"
            ? `vendor/auth/callback${location.search}`
            : portal === "employee"
            ? `employee/auth/callback${location.search}`
            : `auth/callback${location.search}`;

        const response = await getApi(PortalURI); // Replace with your API endpoint

        setAuthToken(response?.data?.data?.token);
        setAuthUser(response?.data?.data?.current_organization?.user);
        setCurrentUser(response?.data?.data?.current_organization?.user);
        navigate("/vendor-portal/dashboard");
        if (response?.data?.data?.portal === "vendor") {
          navigate("/vendor-portal/dashboard");
        } else if (response?.data?.data?.portal === "employee") {
          navigate("/employee/all-policy");
        } else if (
          response?.data?.data?.current_organization?.user?.user_status ===
          "registered"
        ) {
          navigate("/authentication/mfa-scan-qr-code");
        } else if (
          response?.data?.data?.current_organization?.user?.user_status ===
          "unverifiedMFA"
        ) {
          navigate("/dashboard");
        } else if (
          response?.data?.data?.current_organization?.user?.user_status ===
          "active"
        ) {
          navigate("/dashboard");
        } else if (
          response?.data?.data?.current_organization?.user?.user_status ===
          "verified"
        ) {
          navigate("/dashboard");
        }
      } catch (errorLogin) {
        const errorMessage =
          errorLogin.response?.data?.message || "Login failed. Try again.";
        console.error(errorMessage);
        if (portal === "vendor") {
          navigate("/vendor-portal/login");
        } else if (portal === "employee") {
          navigate("/employee/login");
        } else {
          navigate("/login");
        }
      } finally {
      }
    };
    redirectAuth();
  }, []);
};

export default SsoRedirect;
