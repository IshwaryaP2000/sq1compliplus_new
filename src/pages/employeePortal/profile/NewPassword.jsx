import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { postApi } from "../../../services/apiService";
import usePageTitle from "../../../utils/usePageTitle";
import { logoPath } from "../../../utils/UtilsGlobalData";
import { useAuthOrganization } from "../../../hooks/OrganizationUserProvider";
import { confirm_password } from "../../../components/Validationschema/commonSchema";

const NewPassword = () => {
  usePageTitle("Change Password");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { fetchOrganizationUser } = useAuthOrganization();

  // Change Password Formik
  const changePasswordFormik = useFormik({
    initialValues: {
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      newPassword: Yup.string()
        .required("New password is required")
        .min(8, "Password must be at least 8 characters"),
      confirmPassword: confirm_password,
    }),
    onSubmit: async (values, { resetForm, setErrors }) => {
      try {
        setIsLoading(true); 
        const payload = {
          new_password: values.newPassword,
          confirm_new_password: values.confirmPassword,
        };
        await postApi("employee/update-password", payload);
        await fetchOrganizationUser();
        const getStatus = JSON.parse(localStorage.getItem("organization"));
        localStorage.setItem("employee_status", getStatus?.user?.user_status);
        navigate("/employee/all-policy");
        resetForm();
      } catch (err) {
        if (err.response?.data?.errors) {
          setErrors({
            newPassword: err.response?.data?.errors?.new_password?.[0],
            confirmPassword: err.response?.data?.errors?.confirm_password?.[0],
          });
        }
      } finally {
        setIsLoading(false);
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
                  alt="logo"
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
                <h2 className="form-heading mb-40">Update Password</h2>

                <div className="auth-log">
                  <>
                    <form onSubmit={changePasswordFormik.handleSubmit}>
                      <div className="input-wrap mb-4">
                        <input
                          type="password"
                          name="newPassword"
                          className={`form--input ${changePasswordFormik.touched.newPassword &&
                              changePasswordFormik.errors.newPassword
                              ? "input-error"
                              : ""
                            }`}
                          onChange={changePasswordFormik.handleChange}
                          onBlur={changePasswordFormik.handleBlur}
                          value={changePasswordFormik.values.newPassword}
                          placeholder=""
                        />
                        <label>New Password</label>
                        {changePasswordFormik.touched.newPassword &&
                          changePasswordFormik.errors.newPassword && (
                            <div className="error">
                              {changePasswordFormik.errors.newPassword}
                            </div>
                          )}
                      </div>

                      <div className="input-wrap mb-4 position-relative">
                        <input
                          type="password"
                          name="confirmPassword"
                          className={`form--input ${changePasswordFormik.touched.confirmPassword &&
                              changePasswordFormik.errors.confirmPassword
                              ? "input-error"
                              : ""
                            }`}
                          onChange={changePasswordFormik.handleChange}
                          onBlur={changePasswordFormik.handleBlur}
                          value={changePasswordFormik.values.confirmPassword}
                          placeholder=""
                          style={{ paddingRight: "35px" }}
                        />
                        <label>Confirm Password</label>
                        {changePasswordFormik.touched.confirmPassword &&
                          changePasswordFormik.errors.confirmPassword && (
                            <div className="error">
                              {changePasswordFormik.errors.confirmPassword}
                            </div>
                          )}
                      </div>
                      <div>
                        <button
                          type="submit"
                          className="btn btn-auth py-2 mb-3"
                          disabled={isLoading}
                        >
                          {isLoading ? "Changing..." : "Change Password"}
                        </button>
                      </div>
                    </form>
                  </>
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

export default NewPassword;
