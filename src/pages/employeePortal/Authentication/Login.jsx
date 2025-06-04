import { useFormik } from "formik";
import * as Yup from "yup";
import "../../../styles/stackflo.css";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getApi, postApi } from "../../../services/apiService";
import {
  getCurrentOrganization,
  logoPath,
  setAuthToken,
  setCurrentUser,
} from "../../../utils/UtilsGlobalData";
import { useAuthOrganization } from "../../../hooks/OrganizationUserProvider";
import usePageTitle from "../../../utils/usePageTitle";
import {
  email,
  password,
} from "../../../components/Validationschema/commonSchema";
import { EyeIcon, EyeslashIcon } from "../../../components/Icons/Icons";

const Login = () => {
  usePageTitle("Employee-Login");
  const [showPassword, setShowPassword] = useState(false);
  const [SSOLink, SetSSOLink] = useState();
  const { setAuthUser } = useAuthOrganization();
  const navigate = useNavigate();
  const currentOrganization = getCurrentOrganization();
  localStorage.setItem("portal", "employee");

  // Initialize Formik
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: email,
      password: password,
    }),

    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = {
          ...values,
          auth_type: getCurrentOrganization()?.auth_type,
        };
        const response = await postApi("/employee/login", payload);
        const employee = response?.data?.data?.current_organization?.user;
        setAuthToken(response?.data?.data?.token);
        setAuthUser(employee);
        setCurrentUser(employee);
        const employeeStatus =
          response?.data?.data?.current_organization?.user?.employee_status;
        if (employeeStatus === "invited") {
          navigate("/employee/change-password");
        } else {
          navigate("/employee/all-policy");
        }
        localStorage.setItem("employee_status", employeeStatus);
        localStorage.setItem("portal", "employee");
      } catch (errorLogin) {
        console.log(errorLogin);
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (currentOrganization?.auth_type === "google") {
      getSSOLink(); // Call the API only if loginType is google
    }
    localStorage.setItem("portal", "");
  }, []);

  //It will call only auth type google
  const getSSOLink = async () => {
    try {
      const response = await getApi("get-sso-link"); // Replace with your API endpoint
      SetSSOLink(response?.data);
    } catch (errorLogin) {
      console.log(errorLogin);
    } finally {
    }
  };

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
                <h2 className="form-heading mb-40">Employee Login</h2>

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
                        to="/employee/forgot-password"
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
                        to={SSOLink}
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
