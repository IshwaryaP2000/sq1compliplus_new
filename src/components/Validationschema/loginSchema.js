import * as Yup from "yup";

export const loginValidationSchema = Yup.object({
  email: Yup.string()
    .max(50, "Email must be below 50 characters")
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .max(20, "Password must be below 20 characters")
    .required("Password is required"),
});
