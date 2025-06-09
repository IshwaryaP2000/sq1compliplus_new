import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { postApi } from "../../services/apiService";
import { useAuthOrganization } from "../../Hooks/OrganizationUserProvider";
import { getCurrentOrganization } from "../../utils/UtilsGlobalData";
import ButtonWithLoader from "../Button/ButtonLoader";
import { logo, shortName } from "../Validationschema/commonSchema";

const OrganizationInfo = () => {
  const { fetchOrganizationUser } = useAuthOrganization();
  const [darkLogo, setDarkLogo] = useState("");
  const [lightLogo, setLightLogo] = useState("");
  const [imgDataDark, setImgDataDark] = useState(null);
  const [imgDataLight, setImgDataLight] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const domain = localStorage.getItem("organization");
  const domain_name = JSON.parse(domain)?.domain_name;
  const getLastSegment = () => currentPath.split("/").pop();

  const handleLogoChange = (event, logoType) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const binaryData = e.target.result;
        if (logoType === "dark") {
          setDarkLogo(file);
          setImgDataDark(binaryData);
          formik.setFieldValue("dark_logo", file);
        } else if (logoType === "light") {
          setLightLogo(file);
          setImgDataLight(binaryData);
          formik.setFieldValue("light_logo", file);
        }
      };
      reader.readAsArrayBuffer(file);
    }
    event.target.value = "";
  };

  const validationSchema = Yup.object({
    name: Yup.string().required("Organization Name is required"),
    shortName: shortName,
    light_logo: logo,
    dark_logo: logo,
  });

  const formik = useFormik({
    initialValues: {
      name: getCurrentOrganization()?.name || "",
      shortName: getCurrentOrganization()?.short_name || "",
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setFieldError, resetForm }) => {
      try {
        setIsLoading(true);
        const formData = new FormData();
        if (imgDataDark) {
          formData.append(
            "dark_logo",
            new Blob([imgDataDark], { type: "image/png" })
          );
        }
        if (imgDataLight) {
          formData.append(
            "light_logo",
            new Blob([imgDataLight], { type: "image/png" })
          );
        }

        formData.append("name", values.name);
        formData.append("short_name", values.shortName);

        await postApi("organization-info-update", formData);
        setIsLoading(false);
        fetchOrganizationUser();
        resetForm();
        setDarkLogo(null);
        setLightLogo(null);
        setImgDataDark(null);
        setImgDataLight(null);

        if (getLastSegment() === "initial-setup") {
          navigate("/dashboard");
        }
      } catch (error) {
        setIsLoading(false);
        const backendErrors = error.response?.data?.errors;
        if (backendErrors?.short_name) {
          setFieldError("shortName", backendErrors.short_name[0]);
        }
      }
    },
  });

  const handleUploadBoxClick = (inputId) => {
    document.getElementById(inputId).click();
  };

  return (
    <div className="auth-log">
      <form onSubmit={formik.handleSubmit}>
        <div className="input-wrap mb-4">
          <input
            type="text"
            className={`form--input ${
              formik.touched.name && formik.errors.name ? "is-invalid" : ""
            }`}
            id="name"
            name="name"
            maxLength="50"
            value={formik.values.name}
            onChange={(e) => {
              formik.handleChange(e);
              const upperShortName = e.target.value
                .substring(0, 3)
                .toUpperCase();
              formik.setFieldValue("shortName", upperShortName);
            }}
            onBlur={formik.handleBlur}
            placeholder=""
          />
          <label>Organization Name</label>
          {formik.touched.name && formik.errors.name && (
            <div className="invalid-feedback">{formik.errors.name}</div>
          )}
        </div>

        <div className="input-wrap mb-4">
          <input
            type="text"
            className={`form--input ${
              formik.touched.shortName && formik.errors.shortName
                ? "is-invalid"
                : ""
            }`}
            id="shortName"
            name="shortName"
            maxLength="3"
            placeholder=""
            value={formik.values.shortName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <label htmlFor="shortName">Short Name</label>
          {formik.touched.shortName && formik.errors.shortName && (
            <div className="invalid-feedback">{formik.errors.shortName}</div>
          )}
        </div>
        <div className="input-wrap mb-4">
          <input
            type="text"
            className={`form--input not-allowed`}
            disabled={true}
            placeholder=""
            value={domain_name}
          />
          <label htmlFor="shortName">Domain</label>
        </div>

        <div className="image-upload-container mb-3">
          <div
            className="upload-box"
            onClick={() => handleUploadBoxClick("dark_logo")}
          >
            <label className="upload-icon">
              <img src="../images/upload 1.svg" alt="Upload Icon" />
            </label>
            <div className="files-image-uploads">
              <div className="file-preview">
                {darkLogo ? (
                  <>
                    <img
                      id="darkLogoPreview"
                      src={
                        darkLogo.name ? URL.createObjectURL(darkLogo) : darkLogo
                      }
                      alt="Preview"
                    />
                    <span className="file-name">{darkLogo.name}</span>
                    <i className="fa-solid fa-check text-lightgreen"></i>
                  </>
                ) : (
                  <span className="file-name">Upload Dark Logo</span>
                )}
              </div>
              <input
                type="file"
                id="dark_logo"
                name="dark_logo"
                onChange={(e) => handleLogoChange(e, "dark")}
                accept=".jpeg, .jpg, .png, .gif, .svg"
                style={{ display: "none" }}
              />
            </div>
          </div>
          {formik.touched.dark_logo && formik.errors.dark_logo && (
            <div className="invalid-feedback d-block">
              {formik.errors.dark_logo}
            </div>
          )}

          <div
            className="upload-box"
            onClick={() => handleUploadBoxClick("light_logo")}
          >
            <label className="upload-icon">
              <img src="../images/upload 1.svg" alt="Upload Icon" />
            </label>
            <div className="files-image-uploads">
              <div className="file-preview">
                {lightLogo ? (
                  <>
                    <img
                      id="lightLogoPreview"
                      src={
                        lightLogo.name
                          ? URL.createObjectURL(lightLogo)
                          : lightLogo
                      }
                      alt="Preview"
                    />
                    <span className="file-name">{lightLogo.name}</span>
                    <i className="fa-solid fa-check text-lightgreen"></i>
                  </>
                ) : (
                  <span className="file-name">Upload Light Logo</span>
                )}
              </div>
              <input
                type="file"
                id="light_logo"
                name="light_logo"
                onChange={(e) => handleLogoChange(e, "light")}
                accept=".jpeg, .jpg, .png, .gif, .svg"
                style={{ display: "none" }}
              />
            </div>
          </div>
          {formik.touched.light_logo && formik.errors.light_logo && (
            <div className="invalid-feedback d-block">
              {formik.errors.light_logo}
            </div>
          )}
        </div>

        <div className="text-center">
          <button
            type="submit"
            className="btn btn-auth py-2 mb-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <ButtonWithLoader name="" />
              </>
            ) : (
              "Update Organization"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrganizationInfo;
