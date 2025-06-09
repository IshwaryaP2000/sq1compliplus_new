import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getApi } from "../../services/apiService";
import { setCurrentOrganization, setDomain } from "../../utils/UtilsGlobalData";
import { useAuthOrganization } from "../../Hooks/OrganizationUserProvider";
import usePageTitle from "../../utils/usePageTitle";

const VerifyAndRedirect = () => {
  usePageTitle("Verify Email");
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setOrganization } = useAuthOrganization();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("_token");

      if (!token) {
        setError("Invalid or missing token.");
        setLoading(false);
        return;
      }

      try {
        const response = await getApi(`verify-link?_token=${token}`);
        const res = response?.data?.data;
        if (res?.access_email && res?.access_token) {
          const tokenUrl = `_token=${res?.access_token}&access_email=${res?.access_email}`;
          setMessage(response?.data?.message || "Email verified successfully!");

          if (res?.module === "forgot_password") {
            navigate(`/user/update/forgot-password?${tokenUrl}`);
          }

          if (res?.module === "organization" || res?.module === "user_invite") {
            setOrganization(res?.current_organization);
            setCurrentOrganization(res?.current_organization);
            setDomain(res?.current_organization?.domain_name);
            navigate(`/user/registration?${tokenUrl}`);
          }
          if (res?.module === "vendor_invite") {
            setOrganization(res?.current_organization);
            setCurrentOrganization(res?.current_organization);
            setDomain(res?.current_organization?.domain_name);
            navigate(`/user/registration?${tokenUrl}`);
          }
        }
      } catch (err) {
        console.error(
          err.response?.data?.message,
          "err.response?.data?.message"
        );
        setError(
          err.response?.data?.message ||
          "An error occurred while verifying the email."
        );
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  useEffect(() => {
    localStorage.clear();
  }, []);

  return (
    <div>
      {loading ? (
        <div className="stackflo-loadert " role="status">
          <span className="custom-loader "></span>
        </div>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <p>{message}</p>
      )}
    </div>
  );
};

export default VerifyAndRedirect;
