import { useState } from "react";
import { useFormik } from "formik";
import { useNavigate, useSearchParams } from "react-router-dom";
import { postApi } from "../../services/apiService";
import usePageTitle from "../../utils/usePageTitle";
import {
  logoPath,
  setAuthToken,
  setCurrentOrganization,
  setCurrentUser,
} from "../../utils/UtilsGlobalData";
import { useAuthOrganization } from "../../hooks/OrganizationUserProvider";

const Registration = () => {
  usePageTitle("Registration");
  const [searchParams] = useSearchParams();
  const access_email = searchParams.get("access_email");
  const access_token = searchParams.get("_token");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { setOrganization, setAuthUser, setOrganizationError } =
    useAuthOrganization();
  const navigate = useNavigate();

  if (!access_email || !access_token) {
    setOrganizationError("Access Denied! You can't register");
    navigate(`/${"/login"}`);
  }

  // Initialize Formik
  const formik = useFormik({
    initialValues: {
      name: "",
      password: "",
      confirm_password: "",
    },
    validationSchema: registrationValidationSchema,
    onSubmit: async (values, { setFieldError }) => {
      try {
        const response = await postApi(`registration/${access_token}`, {
          name: values.name,
          password: values.password,
        });

        const responseData = response?.data?.data;
        // Set tokens and user info
        setAuthUser(responseData?.current_organization?.user);
        setOrganization(responseData?.current_organization);
        setCurrentUser(responseData?.current_organization?.user);
        setCurrentOrganization(responseData?.current_organization);
        // Navigate based on user status
        const portal = responseData?.portal || null;
        const userStatus =
          responseData?.current_organization?.user?.user_status;
        if (userStatus === "registered" && portal === null) {
          setAuthToken(responseData?.token);
          navigate("/authentication/mfa-scan-qr-code");
        } else if (userStatus === "unverifiedMFA" && portal === null) {
          navigate("/authentication/mfa-verify");
        } else if (userStatus === "registered" && portal === "vendor") {
          navigate("/vendor-portal/login");
        } else {
          navigate("/dashboard");
        }
      } catch (error) {
        const backendErrors = error.response?.data?.data?.errors;
        if (backendErrors) {
          Object.keys(backendErrors).forEach((field) => {
            setFieldError(field, backendErrors[field]);
          });
        }
      }
    },
  });

  return (
    <section className="overflow-hidden">
      <div className="row">
        {/* Left Side Content */}
        <div className="col-lg-5 grid-content02 position-relative">
          <div className="card--position">
            <div className="text-center">
              <img
                src={logoPath()?.product_logo}
                alt="Stackflo Logo"
                className="logo-image-svg"
              />
            </div>
            <div className="card form-card02">
              <p className="yourtTrust">
                Your Trustworthy <br />
                <span>Compliance Companion!</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side Content */}
        <div className="col-lg-7 grid-content position-relative">
          <div className="bg-color-gradiend"></div>
          <div className="text-center">
            <img
              src={logoPath()?.client_logo}
              alt="Logo"
              className="logo-image-upload"
            />
          </div>
          <div className="d-flex justify-content-center">
            <div className="card form-card w-75">
              <h2 className="form-heading mb-2">Welcome to Stackflo</h2>
              <p className="gray-block fs-16 text-center mb-3">
                Please register your account
              </p>
              {access_email && access_token ? (
                <div className="auth-log">
                  <form onSubmit={formik.handleSubmit}>
                    {/* Name Input */}
                    <div className="input-wrap mb-4">
                      <input
                        type="text"
                        className={`form--input ${
                          formik.touched.name && formik.errors.name
                            ? "is-invalid"
                            : ""
                        }`}
                        id="name"
                        name="name"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder=" "
                      />
                      <label>Your Name</label>
                      {formik.touched.name && formik.errors.name && (
                        <div className="invalid-feedback">
                          {formik.errors.name}
                        </div>
                      )}
                    </div>

                    {/* Password Input */}
                    <div className="input-wrap mb-4 position-relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        className={`form--input ${
                          formik.touched.password && formik.errors.password
                            ? "is-invalid"
                            : ""
                        }`}
                        id="password"
                        name="password"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder=" "
                        style={{ paddingRight: "35px" }}
                      />
                      <label>New Password</label>
                      {formik.values.password && (
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="password-toggle bg-transparent border-0 button-focus"
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? (
                            <i className="fa-solid fa-eye-slash text-secondary" />
                          ) : (
                            <i className="fa-solid fa-eye text-secondary" />
                          )}
                        </button>
                      )}
                      {formik.touched.password && formik.errors.password && (
                        <div className="invalid-feedback">
                          {formik.errors.password}
                        </div>
                      )}
                    </div>

                    {/* Confirm Password Input */}
                    <div className="input-wrap mb-4 position-relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        className={`form--input ${
                          formik.touched.confirm_password &&
                          formik.errors.confirm_password
                            ? "is-invalid"
                            : ""
                        }`}
                        id="confirm_password"
                        name="confirm_password"
                        value={formik.values.confirm_password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder=" "
                        style={{ paddingRight: "35px" }}
                      />
                      <label>Confirm Password</label>
                      {formik.values.confirm_password && (
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="password-toggle bg-transparent border-0 button-focus"
                          aria-label={
                            showConfirmPassword
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          {showConfirmPassword ? (
                            <i className="fa-solid fa-eye-slash text-secondary" />
                          ) : (
                            <i className="fa-solid fa-eye text-secondary" />
                          )}
                        </button>
                      )}
                      {formik.touched.confirm_password &&
                        formik.errors.confirm_password && (
                          <div className="invalid-feedback">
                            {formik.errors.confirm_password}
                          </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="btn btn-auth py-2 mb-3"
                      disabled={formik.isSubmitting}
                    >
                      {formik.isSubmitting ? "Submitting..." : "Register"}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="alert alert-danger mt-3">
                  Access Denied! Please check.
                </div>
              )}
            </div>
          </div>
          <div className="bg-color-gradiend-02"></div>
          <div>
            <img
              src={logoPath()?.sq1_poweredby}
              className="powered-by-sq1"
              alt="Powered by Sq1"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Registration;
