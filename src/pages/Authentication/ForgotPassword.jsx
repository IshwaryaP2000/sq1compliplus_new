import { useFormik } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { postApi } from "../../services/apiService";
import { logoPath } from "../../utils/UtilsGlobalData";
import usePageTitle from "../../utils/usePageTitle";
import { email } from "../../components/Validationschema/commonSchema";

const ForgotPassword = () => {
  usePageTitle("Forgot Password");
  const navigate = useNavigate();
  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: Yup.object({
      email: email,
    }),
    onSubmit: async (values, { setFieldError }) => {
      try {
        await postApi("forgot-password", values);
        navigate("/login");
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
                <h2 className="form-heading mb-3">Forgot your password?</h2>
                <p className="fs-18 text-center">
                  Enter your email address and we will send you instructions to
                  reset your password
                </p>
                <div className="auth-log">
                  <form onSubmit={formik.handleSubmit}>
                    <div className="input-wrap mb-4">
                      <input
                        type="text"
                        className={`form--input ${
                          formik.touched.email && formik.errors.email
                            ? "is-invalid"
                            : ""
                        }`}
                        id="email"
                        name="email"
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

                    <div className="mb-3">
                      <div
                        className="g-recaptcha"
                        data-sitekey="YOUR_SITE_KEY"
                      ></div>
                    </div>
                    <div>
                      <button
                        type="submit"
                        className="btn btn-auth py-2 mb-3"
                        disabled={formik.isSubmitting}
                      >
                        {formik.isSubmitting ? "verifiying in..." : "Reset"}
                      </button>
                    </div>
                  </form>
                  <div className="text-center">
                    <Link
                      to="/login"
                      className="text-decoration-none mx-3 fs-18 color-green"
                    >
                      Back to Login
                    </Link>
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

export default ForgotPassword;
