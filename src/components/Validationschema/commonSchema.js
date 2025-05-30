import * as Yup from "yup";

export const email = Yup.string()
  .email("Invalid email format")
  .required("Email is required")
  .max(50, "Email must be below 50 character");

export const role = Yup.string().required("Role is required");

export const typeId = Yup.array()
  .min(1, "At least one Compliance Type is required")
  .required("This field is required");

export const name = Yup.string()
  .required("Organization Name is required")
  .matches(
    /^[A-Za-z0-9\s]*$/,
    "Name should only contain alphabets, numbers, and spaces"
  );

export const domain = Yup.string()
  .required("Organization Domain is required")
  .matches(
    /^[a-z0-9.]*$/,
    "Domain Name should only contain lowercase letters, numbers, and dots"
  );

export const password = Yup.string()
  .min(8, "Password must be at least 8 characters")
  .required("Password is required");

export const confirm_password = Yup.string()
  .oneOf([Yup.ref("password"), null], "Passwords must match")
  .required("Confirm password is required");

export const logo = Yup.mixed();

export const shortName = Yup.string()
      .required("Short Name is required")
      .max(3, "Short Name should be 3 characters max")
