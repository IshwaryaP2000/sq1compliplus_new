import { useFormik } from "formik";
import * as Yup from "yup";
import { postApi } from "../../../api/apiClient";
import {
  getCurrentOrganization,
  logoPath,
  setAuthToken,
  setCurrentUser,
} from "../../../utils/UtilsGlobalData";
import { Link, useNavigate } from "react-router-dom";
import { useAuthOrganization } from "../../../customHooks/OrganizationUserProvider";
import "../../../css/Stackflo.css";
import usePageTitle from "../../includes/usePageTitle";
import { useEffect, useState } from "react";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  usePageTitle("Vendor-Login");
  const { fetchOrganizationUser } = useAuthOrganization();
  const navigate = useNavigate();
  const { setAuthUser } = useAuthOrganization();
  localStorage.setItem("portal", "vendor");

  // Initialize Formik
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .max(50, "Email must be below 50 characters")
        .email("Invalid email address")
        .required("Email is required"),
      password: Yup.string()
        .max(20, "Password must be below 20 characters")
        .required("Password is required"),
    }),

    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = {
          ...values,
          auth_type: getCurrentOrganization()?.auth_type,
        };
        const response = await postApi("/vendor-portal/login", payload); // Replace with your API endpoint
        const vendor = response?.data?.data?.current_organization?.user;
        setAuthToken(response?.data?.data?.token);
        setAuthUser(vendor);
        setCurrentUser(vendor);
        // getCurrentVendor();
        navigate("/vendor-portal/dashboard");
        localStorage.setItem("portal", "vendor");
      } catch (errorLogin) {
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    fetchOrganizationUser();
    localStorage.setItem("portal", "");
  }, []);

  return (
    <section className="overflow-hidden">
      <div>
        <div className="row">
          <div className="col-lg-5 grid-content02 position-relative">
            <div className="card--position">
              <div className="text-center">
                <img
                  src={logoPath()?.product_logo}
                  alt=" logo"
                  className="logo-image-svg"
                />
              </div>

              <div className="card form-card02">
                <p className="yourtTrust">
                  Your Trustworthy <br /> <span>Compliance Companion!</span>
                </p>
              </div>
            </div>
          </div>
          <div className="col-lg-7 grid-content position-relative">
            <div className="bg-color-gradiend"></div>
            <div className="text-center">
              <img
                src={logoPath()?.client_logo}
                alt=" logo"
                className="logo-image-upload"
              />
            </div>
            <div className="d-flex justify-content-center">
              <div className="card form-card w-75">
                <h2 className="form-heading mb-40">Vendor Login</h2>

                <div className="auth-log">
                  {getCurrentOrganization()?.auth_type === "login" ? (
                    <>
                      <form onSubmit={formik.handleSubmit}>
                        <div className="input-wrap mb-4">
                          <input
                            autoComplete="off"
                            type="text"
                            id="email"
                            name="email"
                            className={`form--input ${
                              formik.touched.email && formik.errors.email
                                ? "is-invalid"
                                : ""
                            }`}
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder=" "
                          />
                          <label>Email</label>
                          {formik.touched.email && formik.errors.email ? (
                            <div className="invalid-feedback">
                              {formik.errors.email}
                            </div>
                          ) : null}
                        </div>

                        {/* <div className="input-wrap mb-4">
                          <input
                            autoComplete="new-password"
                            type="password"
                            className={`form--input ${formik.touched.password && formik.errors.password
                                ? "is-invalid"
                                : ""
                              }`}
                            id="password"
                            name="password"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder=" "
                          />
                          <label>Password</label>
                          {formik.touched.password && formik.errors.password ? (
                            <div className="invalid-feedback">
                              {formik.errors.password}
                            </div>
                          ) : null}
                        </div> */}
                        <div className="input-wrap mb-4 position-relative">
                          <input
                            autoComplete="new-password"
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
                          <label>Password</label>

                          {/* Eye icon toggle */}
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

                          {formik.touched.password && formik.errors.password ? (
                            <div className="invalid-feedback">
                              {formik.errors.password}
                            </div>
                          ) : null}
                        </div>
                        <div>
                          <button
                            type="submit"
                            className="btn btn-auth py-2 mb-3"
                            disabled={formik.isSubmitting}
                          >
                            {formik.isSubmitting ? "Logging in..." : "Login"}
                          </button>
                        </div>
                      </form>
                      <Link
                        className="forgot-pagelink"
                        to="/vendor-portal/forgot-password"
                      >
                        Forgot Password?
                      </Link>
                    </>
                  ) : (
                    ""
                  )}

                  <div className="text-center sign-with-account">
                    {getCurrentOrganization()?.auth_type === "azure" ? (
                      <Link
                        to="/sso/microsoft"
                        className="text-decoration-none mx-3 "
                      >
                        <button className="btn btn-auth d-flex align-items-center px-3 py-2">
                          <img
                            src="../images/microsoft-img.png"
                            alt="Sign in with Microsoft"
                            className="me-2"
                            width="20"
                          />
                          Sign in with Microsoft
                        </button>
                      </Link>
                    ) : (
                      ""
                    )}

                    {getCurrentOrganization()?.auth_type === "google" ? (
                      <Link
                        to={getCurrentOrganization()?.sso_link}
                        className="text-decoration-none mx-3 w-100"
                      >
                        <button className="btn  btn-auth d-flex align-items-center px-3 py-2">
                          <img
                            src="../images/google-img.png"
                            alt="Sign in with Google"
                            className="me-2"
                            width="20"
                          />
                          Sign in with Google
                        </button>
                      </Link>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-color-gradiend-02"></div>
            <div>
              <img
                src={logoPath()?.sq1_poweredby}
                className="powered-by-sq1"
                alt="Sq1-logo"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
