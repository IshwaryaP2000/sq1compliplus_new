import { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { postApi, getApi } from "../../services/apiService";
import { role } from "../Validationschema/commonSchema";
import { PlusIcon } from "../Icons/Icons";

function AssignOrganizationModel({ userId, getUserOrg }) {
  const [show, setShow] = useState(false);
  const [org, setOrg] = useState([]);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const validationSchema = Yup.object({
    org_id: Yup.string().required("Organization is required"),
    role: role,
  });

  const handleAssign = async (values, { setSubmitting }) => {
    try {
      const payload = {
        user_id: userId,
        org_id: values.org_id,
        role: values.role,
        type: "users",
      };
      await postApi("assign-organization", payload);
      getUserOrg();
      handleClose();
    } catch (err) {
      console.error("Error in handleAssign:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const getOrg = async () => {
    try {
      const response = await getApi("user-organizations-list");
      const organizations =
        response?.data?.data?.data?.map((org) => ({
          id: org.id,
          name: org.name,
        })) || [];
      setOrg(organizations);
    } catch (err) {
      console.error("Error fetching organizations list:", err);
    }
  };

  useEffect(() => {
    getOrg();
  }, []);

  return (
    <>
      <button
        type="button"
        className="btn btn-sm primary-btn ms-3"
        onClick={handleShow}
      >
        <PlusIcon className="me-2" />
        Assign Organization
      </button>

      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Assign Organization</Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={{ org_id: "", role: "" }}
          validationSchema={validationSchema}
          onSubmit={handleAssign}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="orgDropdown" className="form-label">
                    Select Organization
                  </label>
                  <Field
                    as="select"
                    id="orgDropdown"
                    className="form-select"
                    name="org_id"
                  >
                    <option value="">Select Organization</option>
                    {org.map((organization) => (
                      <option key={organization.id} value={organization.id}>
                        {organization.name}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="org_id"
                    component="div"
                    className="text-danger"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="roleDropdown" className="form-label">
                    Select Role
                  </label>
                  <Field
                    as="select"
                    id="roleDropdown"
                    className="form-select"
                    name="role"
                  >
                    <option value="">Select Role</option>
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </Field>
                  <ErrorMessage
                    name="role"
                    component="div"
                    className="text-danger"
                  />
                </div>
              </div>

              <div className="modal-footer border-0">
                <button
                  type="submit"
                  className="btn primary-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Assigning..." : "Assign"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </Modal>
    </>
  );
}

export default AssignOrganizationModel;
