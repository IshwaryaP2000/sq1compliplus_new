import { useFormik } from "formik";
import * as Yup from "yup";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { postApi } from "../../services/apiService";
import { logoPath } from "../../utils/UtilsGlobalData";
import usePageTitle from "../../utils/usePageTitle";
import {
  confirm_password,
  password,
} from "../../components/Validationschema/commonSchema";
import { Logo } from "../../components/Logo/Logo";

const UpdateForgotPassword = () => {
  usePageTitle("Update Password");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const access_email = searchParams.get("access_email");
  const access_token = searchParams.get("_token");

  if (!access_email || !access_token) {
    toast.error("Access Denied! You Can't be update password");
    navigate(`login`);
  }

  // Initialize Formik
  const formik = useFormik({
    initialValues: {
      password: "",
      confirm_password: "",
    },
    validationSchema: Yup.object({
      password: password,
      confirm_password: confirm_password,
    }),
    onSubmit: async (values) => {
      try {
        const response = await postApi(
          `forgot-password/update/${access_token}`,
          {
            password: values.password,
          }
        );

        if (response.data.data === "updated") {
          localStorage.removeItem("access_email");
          localStorage.removeItem("access_token");
          navigate(`/login`);
        }
      } catch (errorLogin) {
        console.error("Error updating password:", errorLogin);
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
                  src={"../" + logoPath()?.product_logo}
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
                <h2 className="form-heading mb-3">Forgot your password?</h2>
                <p className="fs-18 text-center">
                  Enter your email address and we will send you instructions to
                  reset your password
                </p>
                <div className="auth-log">
                  {access_email && access_token ? (
                    <form onSubmit={formik.handleSubmit}>
                      {/* Password Input */}
                      <div className="input-wrap mb-4">
                        <input
                          type="password"
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
                        />
                        <label>New Password</label>
                        {formik.touched.password && formik.errors.password && (
                          <div className="invalid-feedback">
                            {formik.errors.password}
                          </div>
                        )}
                      </div>

                      {/* Confirm Password Input */}
                      <div className="input-wrap mb-4">
                        <input
                          type="password"
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
                        />
                        <label>Confirm Password</label>
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
                        {formik.isSubmitting ? "Submitting..." : "Reset"}
                      </button>
                    </form>
                  ) : (
                    <div className="alert alert-danger mt-3">
                      Access Denied! Please check.
                    </div>
                  )}
                  <div className="text-center">
                    <Link
                      className="text-decoration-none mx-3 fs-18 color-green"
                      to="/login"
                    >
                      Go to Login
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-color-gradiend-02"></div>
            <div>
              <img
                src={"../" + logoPath()?.sq1_poweredby}
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

export default UpdateForgotPassword;
