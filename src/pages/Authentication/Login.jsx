import { useFormik } from "formik";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/Stackflo.css";
import { useState } from "react";
import { postApi } from "../../services/apiService";
import usePageTitle from "../../utils/usePageTitle";
import { loginValidationSchema } from "../../components/Validationschema/loginSchema";
import { EyeIcon, EyeslashIcon } from "../../components/Icons/Icons";
import Logo from "../../components/Logo/Logo";
import {
  getCurrentOrganization,
  logoPath,
  setAuthToken,
  setCurrentUser,
} from "../../utils/UtilsGlobalData";

const Login = () => {
  localStorage.setItem("portal", "");
  usePageTitle("Login");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const authType = localStorage.getItem("organization");
  const type = JSON.parse(authType);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginValidationSchema,

    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = { ...values, auth_type: type?.auth_type };
        const response = await postApi("login", payload);
        const user = response?.data?.data?.current_organization?.user;
        setAuthToken(response?.data?.data?.token);
        setCurrentUser(user);
        if (
          user?.user_status === "registered" ||
          user?.user_status === "mfa_accepted"
        ) {
          navigate("/authentication/mfa-scan-qr-code");
        } else if (user?.scope === "unverifiedMFA") {
          navigate("/authentication/mfa-verify");
        }
      } catch (errorLogin) {
        console.error("Login error:", errorLogin);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <section className="overflow-hidden">
      <div>
        <div className="row">
          <div className="col-lg-5 grid-content02 position-relative">
            <div className="card--position">
              <div className="text-center">
                {/* <img
                  src={logoPath()?.product_logo}
                  alt=" logo"
                  className="logo-image-svg"
                /> */}
                <Logo />
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
                {type?.auth_type === "login" && (
                  <h2 className="form-heading mb-40">Login</h2>
                )}
                <div className="auth-log">
                  {type?.auth_type === "login" ? (
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

                          {formik.values.password && (
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="password-toggle bg-transparent border-0 button-focus"
                              aria-label={
                                showPassword ? "Hide password" : "Show password"
                              }
                            >
                              {showPassword ? <EyeslashIcon /> : <EyeIcon />}
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
                        to="/user/forgot-password"
                      >
                        Forgot Password?
                      </Link>
                    </>
                  ) : (
                    ""
                  )}

                  <div className="text-center sign-with-account">
                    {type?.auth_type === "azure" ? (
                      <Link
                        to={getCurrentOrganization()?.sso_link}
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
                alt="Sq1-logo sample"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
