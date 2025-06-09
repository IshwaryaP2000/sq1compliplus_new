import { useState } from "react";
import { Modal } from "react-bootstrap";
import { postApi } from "../../services/apiService";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import ButtonWithLoader from "../Button/ButtonLoader";
import { domain, email, name } from "../Validationschema/commonSchema";
import { PlusIcon } from "../Icons/Icons";

function OrganizationInviteModal({ data, fetchAllOrganizations }) {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
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

  const inviteOrganization = async (values, { setErrors }) => {
    try {
      setIsLoading(true);
      const payload = {
        name: values.name,
        email: values.email,
        domain: values.domain,
      };

      await postApi("organization-store", payload);
      fetchAllOrganizations();
      handleClose();
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response?.data?.errors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button onClick={handleShow} className="ms-2 primary-btn btn">
        <PlusIcon/>
        Invite Organization
      </button>

      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title> Invite Organization</Modal.Title>
        </Modal.Header>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={inviteOrganization}
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
                    maxlength="50"
                    id="name"
                    name="name"
                    placeholder="Organization Name"
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
                  />
                  <ErrorMessage
                    name="domain"
                    component="div"
                    className="text-danger"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="submit"
                  className="btn primary-btn"
                  disabled={isSubmitting}
                >
                  {isLoading ? <ButtonWithLoader name="" /> : "Invite"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </Modal>
    </>
  );
}

export default OrganizationInviteModal;
