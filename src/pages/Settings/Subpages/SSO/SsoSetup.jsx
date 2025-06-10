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

const SsoSetup = () => {
  usePageTitle("SSO Setup");
  const [show, setShow] = useState(false);
  const [modalHeader, setModalHeader] = useState("");
  const [azure, setAzure] = useState("");
  const [google, setGoogle] = useState("");
  const [ssoType, setSsoType] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formInitialValues, setFormInitialValues] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [isCheckedAzure, setIsCheckedAzure] = useState(false);
  const [isCheckedGCP, setIsCheckedGCP] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = (header) => {
    setModalHeader(header); // Set the modal header dynamically
    setShow(true); // Open the modal
  };

  const validationSchema = SSOValidationSchema;

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
    } catch (error) { console.error("Error fetching SSO lists:", error); }
  };

  const orgInfo = async () => {
    try {
      const response = await getApi("organization-info");
      setCurrentOrganization(response?.data?.data?.current_organization);
    } catch {
      console.log("error");
    }
  };

  const handleSubmitSso = async (values, { resetForm }) => {
    try {
      await postApi(`sso-setup-store`, values);
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
      setIsEditing(true);
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

  //Get auth_type for sso type
  useEffect(() => {
    const getAuthType = localStorage.getItem("organization");
    const authTypeFromStorage = JSON.parse(getAuthType)?.auth_type;
    if (authTypeFromStorage) {
      setSsoType(ucFirst(authTypeFromStorage));
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
      <div className="row">
        <div className="col-4">
          <Card className="text-center">
            <Card.Body>
              <Card.Text>
                <div className="row align-items-center mt-2">
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
              </Card.Text>
            </Card.Body>
          </Card>
        </div>
        <div className="col-4">
          <Card className="text-center">
            <Card.Body>
              <Card.Text>
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
                        <PencilIcon />
                      ) : (
                        <i className="fa-solid fa-plus"></i>
                      )}
                    </button>
                  </div>
                </div>
              </Card.Text>
            </Card.Body>
          </Card>
        </div>
        <div className="col-4">
          <Card className="text-center">
            <Card.Body>
              <Card.Text>
                <div className="row align-items-center mt-2">
                  <div className="col-8">
                    <p className="mb-0 text-start">
                      {/* <Icon icon="devicon:google" width="50" height="50" /> */}
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
                        <PencilIcon />
                      ) : (
                        <i className="fa-solid fa-plus"></i>
                      )}
                    </button>
                  </div>
                </div>
              </Card.Text>
            </Card.Body>
          </Card>
        </div>
      </div>
      <Modal show={show} onHide={handleClose} centered>
        <div className="card">
          <Modal.Header closeButton>
            <Modal.Title>{modalHeader} SSO Setup</Modal.Title>{" "}
            {/* Use the dynamic header */}
          </Modal.Header>
          <div className="card-body">
            <Formik
              initialValues={{
                auth_type: modalHeader.toLocaleLowerCase(),
                client_id: formInitialValues === "Azure" ? "****" : "",
                client_secret: formInitialValues === "Azure" ? "****" : "",
                redirect_url: formInitialValues === "Azure" ? "****" : "",
                tenant_id: formInitialValues === "Azure" ? "****" : "",
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
