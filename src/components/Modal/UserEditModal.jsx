import { useState } from "react";
import { Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import { PenToSquareIcon } from "../Icons/Icons";
import { postApi } from "../../services/apiService";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import ButtonWithLoader from "../Button/ButtonLoader";
import { email } from "../Validationschema/commonSchema";

function UserEditModel({ data, fetchAllUser, userRolesGet }) {
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const userRoles = userRolesGet;
  const [initialValues, setInitialValues] = useState({
    id: null,
    email: "",
    role: "",
    name: "",
  });

  const validationSchema = Yup.object({
    email: email,
    name: Yup.string()
      .matches(/^[A-Za-z\s]*$/, "Name should only contain alphabets and spaces")
      .required("Name is required"),
  });

  const handleClose = () => setShow(false);

  const handleShow = () => {
    setShow(true);
    setInitialValues({
      id: data.id,
      email: data.email,
      role: data.role,
      name: data.name,
    });
  };

  const editUser = async (values, { setErrors }) => {
    try {
      setIsLoading(true);
      const payload = {
        name: values.name,
        role_id: values.role,
        id: values.id,
      };
      await postApi("user-update", payload); // API call to update the user
      handleClose();
      fetchAllUser(); 
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response?.data?.errors);
      }
      console.error("Error while updating user:", err);
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
          style={{
            width: "32px", // Explicit width
            height: "32px", // Explicit height
            display: "flex", // Flex container
            alignItems: "center", // Vertical centering
            justifyContent: "center", // Horizontal centering
          }}
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
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={editUser}
            enableReinitialize={true} // Important to reset form when data changes
          >
            {({ isSubmitting, setFieldValue, values }) => (
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
                      {userRoles.length > 0 ? (
                        userRoles.map((role, index) => (
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

export default UserEditModel;
