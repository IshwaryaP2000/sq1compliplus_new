import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { postApi } from "../../../services/apiService";
import usePageTitle from "../../../utils/usePageTitle";
import { getCurrentUser } from "../../../utils/UtilsGlobalData";

const ChangePassword = () => {
  usePageTitle("Profile");
  const [isLoading, setIsLoading] = useState(false);
  const user_name = localStorage.getItem("authUser");
  const name = JSON.parse(user_name);
  const users = getCurrentUser();

  // Change Profile Formik
  const changeProfileFormik = useFormik({
    initialValues: {
      changeprofile: name?.name || "", // Default to an empty string if name is null
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
        setIsLoading(true); // Start loader
        const payload = { name: values.changeprofile };
        await postApi("/employee/update/profile", payload);
        const authUser = {
          ...JSON.parse(localStorage.getItem("authUser") || "{}"),
          name: payload.name,
        }; // to update the name after change the profile name

        // const user_name = localStorage.setItem(
        //   "authUser",
        //   JSON.stringify(authUser)
        // );
        localStorage.setItem("authUser", JSON.stringify(authUser));
        // Custom event to notify other components
        window.dispatchEvent(new Event("profileUpdate"));
      } catch (err) {
        console.error(err, "err");
        if (err.response?.data?.errors?.user_name) {
          setErrors({ changeprofile: err.response.data.errors.user_name[0] });
        }
      } finally {
        setIsLoading(false); // Stop loader
      }
    },
  });

  // Change Password Formik
  const changePasswordFormik = useFormik({
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
    onSubmit: async (values, { resetForm, setErrors }) => {
      try {
        setIsLoading(true); // Start loader
        const payload = {
          current_password: values.currentPassword,
          new_password: values.newPassword,
          confirm_new_password: values.confirmPassword,
        };
        await postApi("employee/change-password", payload);
        resetForm(); // Reset form on success
      } catch (err) {
        if (err.response?.data?.errors) {
          setErrors({
            currentPassword: err.response?.data?.errors?.current_password,
            newPassword: err.response?.data?.errors?.new_password?.[0],
            confirmPassword: err.response?.data?.errors?.confirm_password?.[0],
          });
        }
      } finally {
        setIsLoading(false); // Stop loader
      }
    },
  });

  return (
    <div className="m-5">
      <h4 className="mb-3">Profile Settings</h4>
      <div className="w-100 d-flex row">
        <div className="card form-card col-md -6 mx-2 mt-5">
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
                  value={users.email}
                  placeholder=""
                  disabled
                />
                <label>Email</label>
              </div>
            </div>
            <div>
              <button
                type="submit"
                className="btn primary-btn"
                disabled={isLoading}
              >
                {isLoading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Section */}
        <div className="card form-card  col-md-6 mx-2 mt-5">
          <h4 className="mb-3">Update Password</h4>
          <div className="auth-log">
            <form onSubmit={changePasswordFormik.handleSubmit}>
              <div className="input-wrap mb-4">
                <input
                  type="password"
                  name="currentPassword"
                  className={`form--input ${
                    changePasswordFormik.touched.currentPassword &&
                    changePasswordFormik.errors.currentPassword
                      ? "input-error"
                      : ""
                  }`}
                  onChange={changePasswordFormik.handleChange}
                  onBlur={changePasswordFormik.handleBlur}
                  value={changePasswordFormik.values.currentPassword}
                  placeholder=""
                />
                <label>Current Password</label>
                {changePasswordFormik.touched.currentPassword &&
                  changePasswordFormik.errors.currentPassword && (
                    <div className="error">
                      {changePasswordFormik.errors.currentPassword}
                    </div>
                  )}
              </div>

              <div className="input-wrap mb-4">
                <input
                  type="password"
                  name="newPassword"
                  className={`form--input ${
                    changePasswordFormik.touched.newPassword &&
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

              <div className="input-wrap mb-4">
                <input
                  type="password"
                  name="confirmPassword"
                  className={`form--input ${
                    changePasswordFormik.touched.confirmPassword &&
                    changePasswordFormik.errors.confirmPassword
                      ? "input-error"
                      : ""
                  }`}
                  onChange={changePasswordFormik.handleChange}
                  onBlur={changePasswordFormik.handleBlur}
                  value={changePasswordFormik.values.confirmPassword}
                  placeholder=""
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
