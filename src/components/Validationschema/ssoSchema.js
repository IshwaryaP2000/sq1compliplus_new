import * as Yup from "yup";

export const SSOValidationSchema = Yup.object({
  client_id: Yup.string().required("Client ID is required"),
  client_secret: Yup.string().required("Client Secret is required"),
  redirect_url: Yup.string().required("Redirect URL is required"),
  tenant_id: Yup.string().notRequired(),
});
