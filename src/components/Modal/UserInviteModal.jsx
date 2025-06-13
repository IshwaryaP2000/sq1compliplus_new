import { useState } from "react";
import { Modal } from "react-bootstrap";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { postApi } from "../../services/apiService";
import { PlusIcon } from "../Icons/Icons";
import { email, role } from "../Validationschema/commonSchema";
import { Spinner } from "../Spinner/Spinner";

function UserInviteModel({ data, fetchAllUser }) {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [isLoading, setIsLoading] = useState(false);
  const [initialValues, setInitialValues] = useState({
    id: null,
    email: "",
    role: "",
  });

  const validationSchema = Yup.object({
    role: role,
    email: email,
  });

  const inviteUser = async (values, { setErrors }) => {
    try {
      setIsLoading(true);
      const payload = {
        email: values.email,
        role_id: values.role,
      };
      await postApi("user-store", payload);
      fetchAllUser();
      handleClose();
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response?.data?.errors);
      }
      console.error(err.response?.data?.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button onClick={handleShow} className="ms-2 btn primary-btn btn">
        <PlusIcon />
        Invite User
      </button>

      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title> Invite User</Modal.Title>
        </Modal.Header>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={inviteUser}
          enableReinitialize={true}
        >
          {({ isSubmitting, setFieldValue, values }) => (
            <Form>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <Field
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    placeholder="User Email"
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-danger"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="role" className="form-label">
                    Role
                  </label>
                  <Field
                    as="select"
                    name="role"
                    className="form-control"
                    id="role"
                    onChange={(e) => setFieldValue("role", e.target.value)}
                  >
                    <option value="">Select a Role</option>
                    {data?.length > 0 ? (
                      data?.map((role, index) => (
                        <option key={index} value={role}>
                          {role.replace(/_/g, " ")}
                        </option>
                      ))
                    ) : (
                      <option value="">Loading...</option>
                    )}
                  </Field>
                  <ErrorMessage
                    name="role"
                    component="div"
                    className="text-danger"
                  />
                </div>
              </div>

              <div className="modal-footer border-0">
                {isLoading ? (
                  <Spinner />
                ) : (
                  <button
                    type="submit"
                    className="btn primary-btn"
                    disabled={isSubmitting}
                  >
                    {isLoading ? "Inviting..." : "Invite"}
                  </button>
                )}
              </div>
            </Form>
          )}
        </Formik>
      </Modal>
    </>
  );
}

export default UserInviteModel;
