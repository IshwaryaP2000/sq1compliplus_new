import { useEffect, useState } from "react";
import Card from "react-bootstrap/Card";
import { Form as BootstrapForm } from "react-bootstrap";
import { Icon } from "@iconify/react/dist/iconify.js";
import Modal from "react-bootstrap/Modal";
import { Formik, Field, Form, ErrorMessage } from "formik";
import { postApi, getApi } from "../../../../services/apiService";
import usePageTitle from "../../../../utils/usePageTitle";
import ButtonWithLoader from "../../../../components/Button/ButtonLoader";
import { SSOValidationSchema } from "../../../../components/Validationschema/ssoSchema";
import { PencilIcon } from "../../../../components/Icons/Icons";
import {
  setCurrentOrganization,
  ucFirst,
} from "../../../../utils/UtilsGlobalData";
import AzureInstruction from "../../../../components/Modal/AzureInstruction";
import GoogleInstruction from "../../../../components/Modal/GoogleInstruction";

const SsoSetup = () => {
  usePageTitle("SSO Setup");
  const [show, setShow] = useState(false);
  const [modalHeader, setModalHeader] = useState("");
  const handleClose = () => setShow(false);
  const handleShow = (header, editMode = false) => {
    setModalHeader(header);
    setIsEditMode(editMode);
    setShow(true);
  };
  const [loginType, setLoginType] = useState("");
  const [azure, setAzure] = useState("");
  const [google, setGoogle] = useState("");
  const [ssoType, setSsoType] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formInitialValues, setFormInitialValues] = useState("");
  const validationSchema = SSOValidationSchema;
  const [isChecked, setIsChecked] = useState(false);
  const [isCheckedAzure, setIsCheckedAzure] = useState(false);
  const [isCheckedGCP, setIsCheckedGCP] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const handleChange = async () => {
    await postApi(`sso-activate`, {
      auth_type: "login",
    });
    getSSOLists();
    setIsCheckedAzure(false);
    setIsCheckedGCP(false);
  };

  const handleChangeAzure = async () => {
    await postApi(`sso-activate`, {
      auth_type: "azure",
    });
    getSSOLists();
    setIsChecked(false);
    setIsCheckedGCP(false);
  };

  const handleChangeGCP = async () => {
    await postApi(`sso-activate`, {
      auth_type: "google",
    });
    getSSOLists();
    setIsChecked(false);
    setIsCheckedAzure(false);
  };

  const getSSOLists = async () => {
    try {
      setIsChecked(false);
      setIsCheckedAzure(false);
      setIsCheckedGCP(false);
      const response = await getApi("get-sso");
      response.data?.data.map((item) => {
        const authType = item?.auth_type?.toLowerCase();
        const status = item?.status;

        if (authType === "login" && status === "active") {
          setIsChecked((prev) => !prev);
        } else if (authType === "azure" && status === "active") {
          setIsCheckedAzure((prev) => !prev);
        } else if (authType === "google" && status === "active") {
          setIsCheckedGCP((prev) => !prev);
        }

        if (authType === "azure") {
          setAzure("azure");
        } else if (authType === "google") {
          setGoogle("google");
        }
      });
    } catch (err) {
      console.error("Error fetching SSO lists:", err);
    }
  };

  const orgInfo = async () => {
    try {
      const response = await getApi("organization-info");
      setCurrentOrganization(response?.data?.data?.current_organization);
    } catch (error) {
      console.error("error", error);
    }
  };

  const handleSubmitSso = async (values, { resetForm }) => {
    try {
      setIsLoading(true);
      const endpoint = isEditMode ? `sso-setup-update` : `sso-setup-store`;
      await postApi(endpoint, values);
      orgInfo();
      resetForm();
      setIsEditing(false);
      setFormInitialValues(ucFirst(values?.auth_type) || "");
      getSSOLists();
      handleClose();
    } catch (error) {
      console.error("Error posting data:", error);
      resetForm();
      setIsEditing(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getSSOLists();
    const getAuthType = localStorage.getItem("organization");
    const authTypeFromStorage = JSON.parse(getAuthType)?.auth_type;
    if (authTypeFromStorage) {
      setFormInitialValues(ucFirst(authTypeFromStorage));
    }
  }, []);

  //Get auth_type for login type
  useEffect(() => {
    const getAuthType = localStorage.getItem("organization");
    const authTypeFromStorage = JSON.parse(getAuthType)?.auth_type;
    if (authTypeFromStorage) {
      setLoginType(
        ucFirst(authTypeFromStorage !== "login" ? "SSO" : authTypeFromStorage)
      );
    }
  }, []);

  //Get auth_type for sso type
  useEffect(() => {
    const getAuthType = localStorage.getItem("organization");
    const authTypeFromStorage = JSON.parse(getAuthType)?.auth_type;
    if (authTypeFromStorage) {
      setSsoType(ucFirst(authTypeFromStorage));
    }
  }, []);

  //set current set 6 when ssotype Google or Azure
  useEffect(() => {
    const getAuthType = localStorage.getItem("organization");
    const authTypeFromStorage = JSON.parse(getAuthType)?.auth_type;
    if (
      ucFirst(authTypeFromStorage) === "Google" ||
      ucFirst(authTypeFromStorage) === "Azure"
    ) {
      setCurrentStep(6);
    }
  }, []);

  const handleEdit = (event, resetForm, setValues) => {
    event.preventDefault();
    resetForm();
    setValues({
      auth_type: ssoType.toLocaleLowerCase(),
      client_id: "",
      client_secret: "",
      redirect_url: "",
      tenant_id: "",
    });

    setIsEditing(true); // Enable editing
  };

  return (
    <>
      <div className="row d-none">
        <div className="col-4">
          <Card className="text-center">
            <Card.Body>
              <div className="card-text">
                <div className="row align-items-center mt-2">
                  {/* Label */}
                  <div className="col-8">
                    <p className="mb-0 text-start fw-semibold">
                      <Icon
                        icon="mdi:password-check"
                        width="60"
                        height="60"
                        style={{ color: "#30BC47" }}
                      />
                      <span className="ms-2">Login</span>
                    </p>
                  </div>
                  <div className="col-4 d-flex justify-content-end align-items-center gap-2">
                    <BootstrapForm>
                      <BootstrapForm.Check
                        type="switch"
                        id="custom-switch"
                        label="" // Optional: Add a label if needed
                        checked={isChecked}
                        onChange={handleChange}
                      />
                    </BootstrapForm>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-4">
          <Card className="text-center">
            <Card.Body>
              <div className="card-text">
                <div className="row align-items-center mt-2">
                  <div className="col-8">
                    <p className="mb-0 text-start">
                      <Icon
                        icon="devicon:azure-wordmark"
                        width="60"
                        height="60"
                      />
                    </p>
                  </div>
                  <div className="col-4 d-flex justify-content-end align-items-center gap-2">
                    <BootstrapForm>
                      <BootstrapForm.Check
                        type="switch"
                        id="custom-switch"
                        label="" // Optional: Add a label if needed
                        checked={isCheckedAzure}
                        onChange={handleChangeAzure}
                        disabled={azure === "" ? true : false}
                      />
                    </BootstrapForm>

                    <button
                      onClick={() => handleShow("Azure")}
                      className="btn btn-secondary btn-sm"
                    >
                      {azure === "azure" ? (
                        <i className="fa-solid fa-pencil"></i>
                      ) : (
                        <i className="fa-solid fa-plus"></i>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-4">
          <Card className="text-center">
            <Card.Body>
              <div className="card-text">
                <div className="row align-items-center mt-2">
                  <div className="col-8">
                    <p className="mb-0 text-start">
                      <Icon
                        icon="devicon:google-wordmark"
                        width="60"
                        height="60"
                      />
                    </p>
                  </div>
                  <div className="col-4 d-flex justify-content-end align-items-center gap-2">
                    <BootstrapForm>
                      <BootstrapForm.Check
                        type="switch"
                        id="custom-switch"
                        label="" // Optional: Add a label if needed
                        checked={isCheckedGCP}
                        onChange={handleChangeGCP}
                        disabled={google === "" ? true : false}
                      />
                    </BootstrapForm>

                    <button
                      onClick={() => handleShow("Google")} // Pass "Google" as the header
                      className="btn btn-secondary btn-sm"
                    >
                      {google === "google" ? (
                        <i className="fa-solid fa-pencil"></i>
                      ) : (
                        <i className="fa-solid fa-plus"></i>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 col-12 col-lg-4">
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <Icon
                    icon="mdi:password-check"
                    width="40"
                    height="40"
                    style={{ color: "#000" }}
                  />
                </div>
                {isChecked ? (
                  <div className="d-flex ">
                    <i className="fa-solid fa-circle-check text-success fs-22 me-2"></i>
                    <p className="mb-0">Connected</p>
                  </div>
                ) : (
                  <div className="d-flex" style={{ opacity: "0.2" }}>
                    <i className="fa-solid fa-circle-check text-secondary fs-22 me-2"></i>
                    <p className="mb-0">Not connected</p>
                  </div>
                )}
              </div>
              <div className="card-title">
                <h3>Login</h3>
              </div>
              <div className="card-description">
                <p>
                  Login provides secure, role-based access to ensure compliance
                  with industry regulations
                </p>
              </div>
              <div className="card-buttons d-flex justify-content-between ">
                <BootstrapForm className="align-content-end custom-switch">
                  <BootstrapForm.Check
                    type="switch"
                    id="custom-switch"
                    label="" // Optional: Add a label if needed
                    checked={isChecked}
                    onChange={handleChange}
                  />
                </BootstrapForm>
              </div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-6 col-12 col-lg-4">
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <Icon
                    icon="vscode-icons:file-type-azure"
                    width="40"
                    height="40"
                  />
                </div>

                {isCheckedAzure ? (
                  <div className="d-flex ">
                    <i className="fa-solid fa-circle-check text-success fs-22 me-2"></i>
                    <p className="mb-0">Connected</p>
                  </div>
                ) : (
                  <div className="d-flex" style={{ opacity: "0.2" }}>
                    <i className="fa-solid fa-circle-check text-secondary fs-22 me-2"></i>
                    <p className="mb-0">Not connected</p>
                  </div>
                )}
              </div>
              <div className="card-title d-flex">
                <h3>Azure</h3>
                <AzureInstruction />
              </div>
              <div className="card-description">
                <p>
                  Azure offers seamless, secure access using enterprise
                  credentials and enhancing compliance.
                </p>
              </div>
              <div className="card-buttons d-flex justify-content-between ">
                <BootstrapForm className="align-content-end custom-switch">
                  <BootstrapForm.Check
                    type="switch"
                    id="custom-switch"
                    label=""
                    checked={isCheckedAzure}
                    onChange={handleChangeAzure}
                    disabled={azure === "" ? true : false}
                  />
                </BootstrapForm>
                <button
                  onClick={() => handleShow("Azure", false)}
                  className="btn btn-integrate rounded-0"
                >
                  {azure === "azure" ? (
                    <i
                      className="fa-solid fa-pencil"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShow("Azure", true);
                      }}
                    ></i>
                  ) : (
                    "INTEGRATE"
                  )}
                </button>
              </div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-6 col-12 col-lg-4">
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <Icon icon="logos:google-icon" width="40" height="40" />
                </div>
                {isCheckedGCP ? (
                  <div className="d-flex ">
                    <i className="fa-solid fa-circle-check text-success fs-22 me-2"></i>
                    <p className="mb-0">Connected</p>
                  </div>
                ) : (
                  <div className="d-flex" style={{ opacity: "0.2" }}>
                    <i className="fa-solid fa-circle-check text-secondary fs-22 me-2"></i>
                    <p className="mb-0">Not connected</p>
                  </div>
                )}
              </div>
              <div className="card-title d-flex">
                <h3>Google</h3>
                <GoogleInstruction />
              </div>
              <div className="card-description">
                <p>
                  Google delivers secure, unified access to applications through
                  Google Workspace credentials.
                </p>
              </div>
              <div className="card-buttons d-flex justify-content-between ">
                <BootstrapForm>
                  <BootstrapForm.Check
                    className="align-content-end custom-switch"
                    type="switch"
                    id="custom-switch"
                    label="" // Optional: Add a label if needed
                    checked={isCheckedGCP}
                    onChange={handleChangeGCP}
                    disabled={google === "" ? true : false}
                  />
                </BootstrapForm>
                <button
                  onClick={() => handleShow("Google", false)} // Pass false for integrate mode
                  className="btn btn-integrate rounded-0"
                >
                  {google === "google" ? (
                    <i
                      className="fa-solid fa-pencil"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the parent button
                        handleShow("Google", true); // Pass true for edit mode
                      }}
                    ></i>
                  ) : (
                    "INTEGRATE"
                  )}
                </button>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
      <Modal show={show} onHide={handleClose} centered>
        <div className="card">
          <Modal.Header closeButton>
            <Modal.Title>{modalHeader} SSO Setup</Modal.Title>
            {/* Use the dynamic header */}
          </Modal.Header>
          <div className="card-body">
            <Formik
              initialValues={{
                auth_type: modalHeader.toLocaleLowerCase(),
                client_id: "",
                client_secret: "",
                redirect_url: "",
                tenant_id: "",
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmitSso}
              enableReinitialize={true}
            >
              {({
                values,
                handleChange,
                resetForm,
                isSubmitting,
                setValues,
              }) => (
                <Form>
                  <div className="form-group mb-3 ">
                    <label className="mb-1" htmlFor="client_id">
                      Client ID <span className="text-danger">*</span>
                    </label>
                    <Field
                      type="text"
                      id="client_id"
                      name="client_id"
                      className="form-control"
                      value={values.client_id}
                      onChange={handleChange}
                      disabled={!isEditing && formInitialValues === "Azure"}
                    />
                    <ErrorMessage
                      name="client_id"
                      component="div"
                      className="text-danger"
                    />
                  </div>

                  <div className="form-group mb-3">
                    <label className="mb-1" htmlFor="client_secret">
                      Client Secret <span className="text-danger">*</span>
                    </label>
                    <Field
                      type="text"
                      id="client_secret"
                      name="client_secret"
                      className="form-control"
                      value={values.client_secret}
                      onChange={handleChange}
                      disabled={!isEditing && formInitialValues === "Azure"}
                    />
                    <ErrorMessage
                      name="client_secret"
                      component="div"
                      className="text-danger"
                    />
                  </div>

                  <div className="form-group mb-3">
                    <label className="mb-1" htmlFor="redirect_url">
                      Redirect URL <span className="text-danger">*</span>
                    </label>
                    <Field
                      type="text"
                      id="redirect_url"
                      name="redirect_url"
                      className="form-control"
                      value={values.redirect_url}
                      onChange={handleChange}
                      disabled={!isEditing && formInitialValues === "Azure"}
                    />
                    <ErrorMessage
                      name="redirect_url"
                      component="div"
                      className="text-danger"
                    />
                  </div>

                  <div className="form-group">
                    <label className="mb-1" htmlFor="tenant_id">
                      Tenant ID <span className="text-danger">*</span>
                    </label>
                    <Field
                      type="text"
                      id="tenant_id"
                      name="tenant_id"
                      className="form-control"
                      value={values.tenant_id}
                      onChange={handleChange}
                      disabled={!isEditing && formInitialValues === "Azure"}
                    />
                  </div>

                  <div className="d-flex justify-content-end mt-4">
                    {!isEditing && formInitialValues === "Azure" ? (
                      <button
                        type="button"
                        className="btn btn-sm primary-btn"
                        onClick={(event) =>
                          handleEdit(event, resetForm, setValues)
                        }
                      >
                        Edit
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="btn btn-sm primary-btn w-auto"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <ButtonWithLoader name="Submitting..." />
                          </>
                        ) : (
                          "Submit"
                        )}
                      </button>
                    )}
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </Modal>
    </>
  );
};
export default SsoSetup;
