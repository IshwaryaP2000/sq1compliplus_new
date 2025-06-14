import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { postApi } from "../../services/apiService";
import usePageTitle from "../../utils/usePageTitle";
import { getCurrentUser } from "../../utils/UtilsGlobalData";
import { useAuthOrganization } from "../../Hooks/OrganizationUserProvider";

const ChangePassword = () => {
  usePageTitle("Profile");
  const [isLoading, setIsLoading] = useState(false);
  const user_name = localStorage.getItem("authUser");
  const name = JSON.parse(user_name);
  const users = getCurrentUser();
  const { somefunction } = useAuthOrganization();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const Change_Password = async (values, { resetForm, setErrors }) => {
    try {
      setIsLoading(true);
      const payload = {
        current_password: values.currentPassword,
        new_password: values.newPassword,
        confirm_new_password: values.confirmPassword,
      };
      await postApi("change-password", payload);
      resetForm();
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors({
          currentPassword: err.response?.data?.errors?.current_password,
          newPassword: err.response?.data?.errors?.new_password?.[0],
          confirmPassword: err.response?.data?.errors?.confirm_password?.[0],
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const changeProfileFormik = useFormik({
    initialValues: {
      changeprofile: name?.name || "",
    },
    validationSchema: Yup.object({
      changeprofile: Yup.string()
        .matches(
          /^[A-Za-z\s]*$/,
          "Name should only contain alphabets and spaces"
        )
        .max(30, "Name must be below 30 characters")
        .required("Name is required"),
    }),
    enableReinitialize: true,
    onSubmit: async (values, { setErrors }) => {
      try {
        const payload = { user_name: values.changeprofile };
        await postApi("change-profile", payload);
        somefunction();
      } catch (err) {
        if (err.response?.data?.errors?.user_name) {
          setErrors({ changeprofile: err.response.data.errors.user_name[0] });
        }
      }
    },
  });

  const formik = useFormik({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      currentPassword: Yup.string().required("Current password is required"),
      newPassword: Yup.string()
        .required("New password is required")
        .min(8, "Password must be at least 8 characters"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
        .required("Confirm password is required"),
    }),
    onSubmit: (values) => {
      Change_Password(values, formik);
    },
  });

  return (
    <div>
      <h4 className="mb-3">Profile Settings</h4>
      <div className="w-100 d-flex row">
        <div className="card form-card  col-md -6 mx-2">
          <h4 className="mb-3">Change Profile</h4>
          <form
            onSubmit={changeProfileFormik.handleSubmit}
            className="h-100 d-grid align-content-between"
          >
            <div>
              <div className="input-wrap mb-4">
                <input
                  type="text"
                  name="changeprofile"
                  className={`form--input ${
                    changeProfileFormik.touched.changeprofile &&
                    changeProfileFormik.errors.changeprofile
                      ? "input-error"
                      : ""
                  }`}
                  value={changeProfileFormik.values.changeprofile}
                  onChange={changeProfileFormik.handleChange}
                  onBlur={changeProfileFormik.handleBlur}
                  placeholder=""
                />
                <label>Name</label>
                {changeProfileFormik.touched.changeprofile &&
                  changeProfileFormik.errors.changeprofile && (
                    <div className="error">
                      {changeProfileFormik.errors.changeprofile}
                    </div>
                  )}
              </div>
              <div className="input-wrap mb-4">
                <input
                  type="text"
                  name="changeprofile"
                  className={`form--input ${
                    changeProfileFormik.touched.changeprofile &&
                    changeProfileFormik.errors.changeprofile
                      ? "input-error"
                      : ""
                  }`}
                  value={users?.email}
                  disabled
                  placeholder=""
                />
                <label>Email</label>
              </div>
            </div>
            <div>
              <button type="submit" className="btn primary-btn">
                Submit
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Section */}
        <div className="card form-card  col-md-6 mx-2">
          <h4 className="mb-3">Update Password</h4>
          <div className="auth-log">
            <form onSubmit={formik.handleSubmit}>
              <div className="input-wrap mb-4 position-relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  name="currentPassword"
                  className={`form--input ${
                    formik.touched.currentPassword &&
                    formik.errors.currentPassword
                      ? "input-error"
                      : ""
                  }`}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.currentPassword}
                  placeholder=""
                  style={{ paddingRight: "35px" }}
                />
                <label>Current Password</label>
                {formik.values.currentPassword && (
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="password-toggle bg-transparent border-0 button-focus"
                    aria-label={
                      showCurrentPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showCurrentPassword ? (
                      <i className="fa-solid fa-eye-slash text-secondary" />
                    ) : (
                      <i className="fa-solid fa-eye text-secondary" />
                    )}
                  </button>
                )}
                {formik.touched.currentPassword &&
                  formik.errors.currentPassword && (
                    <div className="error">{formik.errors.currentPassword}</div>
                  )}
              </div>

              <div className="input-wrap mb-4 position-relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  className={`form--input ${
                    formik.touched.newPassword && formik.errors.newPassword
                      ? "input-error"
                      : ""
                  }`}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.newPassword}
                  placeholder=""
                  style={{ paddingRight: "35px" }}
                />
                <label>New Password</label>
                {formik.values.newPassword && (
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="password-toggle bg-transparent border-0 button-focus"
                    aria-label={
                      showNewPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showNewPassword ? (
                      <i className="fa-solid fa-eye-slash text-secondary" />
                    ) : (
                      <i className="fa-solid fa-eye text-secondary" />
                    )}
                  </button>
                )}
                {formik.touched.newPassword && formik.errors.newPassword && (
                  <div className="error">{formik.errors.newPassword}</div>
                )}
              </div>

              <div className="input-wrap mb-4 position-relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  className={`form--input ${
                    formik.touched.confirmPassword &&
                    formik.errors.confirmPassword
                      ? "input-error"
                      : ""
                  }`}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.confirmPassword}
                  placeholder=""
                  style={{ paddingRight: "35px" }}
                />
                <label>Confirm Password</label>
                {formik.values.confirmPassword && (
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="password-toggle bg-transparent border-0 button-focus"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <i className="fa-solid fa-eye-slash text-secondary" />
                    ) : (
                      <i className="fa-solid fa-eye text-secondary" />
                    )}
                  </button>
                )}
                {formik.touched.confirmPassword &&
                  formik.errors.confirmPassword && (
                    <div className="error">{formik.errors.confirmPassword}</div>
                  )}
              </div>

              <div>
                <button
                  type="submit"
                  className="btn primary-btn"
                  disabled={isLoading}
                >
                  {isLoading ? "Changing..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
