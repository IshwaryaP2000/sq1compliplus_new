import { useState } from "react";
import { Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import { postApi } from "../../services/apiService";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import ButtonWithLoader from "../Button/ButtonLoader";
import { domain, email } from "../Validationschema/commonSchema";
import { PenToSquareIcon } from "../Icons/Icons";

function OrganizationEditModal({ organization, fetchAllOrganizations }) {
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [initialValues, setInitialValues] = useState({
    id: null,
    name: "",
    email: "",
    domain: "",
  });

  const validationSchema = Yup.object({
    name: name,
    email: email,
    domain: domain,
  });

  // Handle modal open and close
  const handleClose = () => setShow(false);
  const handleShow = () => {
    setShow(true);
    setInitialValues({
      id: organization.id,
      name: organization.name,
      email: organization.email || "",
      domain: organization.domain_name || "",
    });
  };

  const editOrganization = async (values) => {
    try {
      setIsLoading(true);
      await postApi("organization-update", {
        name: values.name,
        id: values.id,
      });
      handleClose();
      fetchAllOrganizations();
    } catch (err) {
      console.error("Error in editOrganization:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">Edit</Tooltip>}>
        <button
          className="btn btn-sm py-0 my-1 tableborder-right"
          onClick={handleShow}
        >
          <PenToSquareIcon />
        </button>
      </OverlayTrigger>

      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Organization</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={editOrganization}
            enableReinitialize={true}
          >
            {({ isSubmitting, values }) => (
              <Form>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                      Name
                    </label>
                    <Field
                      type="text"
                      className="form-control"
                      id="name"
                      maxLength="50"
                      name="name"
                      placeholder="Name"
                    />
                    <ErrorMessage
                      name="name"
                      component="div"
                      className="text-danger"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email
                    </label>
                    <Field
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      placeholder="Organization Email"
                      disabled
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-danger"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="domain" className="form-label">
                      Domain
                    </label>
                    <Field
                      type="text"
                      className="form-control"
                      id="domain"
                      name="domain"
                      placeholder="Organization Domain"
                      disabled
                    />
                    <ErrorMessage
                      name="domain"
                      component="div"
                      className="text-danger"
                    />
                  </div>
                </div>

                <div className="text-center">
                  <button
                    type="submit"
                    className="btn primary-btn"
                    disabled={isSubmitting || isLoading}
                  >
                    {isLoading ? <ButtonWithLoader name="" /> : "Update"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default OrganizationEditModal;
