import { Modal, Button, Form } from "react-bootstrap";

const EditRoleModal = ({
  show,
  handleClose,
  selectedRole,
  handleRoleChange,
  organizationRoles,
  handleUpdateRole,
}) => {
  const formatRole = (role) => {
    if (!role) return "";
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <Modal show={show} onHide={handleClose} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Edit Role</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="role">
            <Form.Label>Select Role</Form.Label>
            <Form.Control
              as="select"
              value={selectedRole}
              onChange={handleRoleChange}
            >
              <option value="">Select Role</option>
              {organizationRoles.length > 0 ? (
                organizationRoles.map((role, index) => (
                  <option key={index} value={role.name}>
                    {formatRole(role.name)}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No roles available
                </option>
              )}
            </Form.Control>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          className="primary-btn"
          variant="success"
          onClick={handleUpdateRole}
        >
          Update Role
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditRoleModal;
