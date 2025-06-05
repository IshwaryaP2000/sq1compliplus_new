import { Modal, Button, Form } from "react-bootstrap";

const AssignUserModal = ({
  show,
  handleClose,
  userType,
  handleUserTypeChange,
  email,
  setEmail,
  emailError,
  existingUsers,
  selectedUser,
  setSelectedUser,
  userError,
  selectedRole,
  setSelectedRole,
  roleError,
  roles,
  handleFormSubmit,
}) => {
  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Assign User</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* User Type Selection */}
        <Form.Group className="mb-3">
          <Form.Label>User Type</Form.Label>
          <div className="d-flex">
            <Form.Check
              type="radio"
              id="newUser"
              name="userType"
              label="New User"
              value="new_user"
              checked={userType === "new_user"}
              onChange={handleUserTypeChange}
              className="me-3"
            />
            <Form.Check
              type="radio"
              id="existingUser"
              name="userType"
              label="Existing User"
              value="existing_user"
              checked={userType === "existing_user"}
              onChange={handleUserTypeChange}
              disabled={existingUsers.length === 0}
            />
          </div>
        </Form.Group>

        {/* New User Email Input */}
        {userType === "new_user" && (
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              id="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {emailError && (
              <Form.Text className="text-danger">{emailError}</Form.Text>
            )}
          </Form.Group>
        )}

        {/* Existing User Dropdown */}
        {userType === "existing_user" && (
          <Form.Group className="mb-3">
            <Form.Label>Select User</Form.Label>
            <Form.Select
              id="user"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="">Select User</option>
              {existingUsers.map((user, index) => (
                <option key={index} value={user.email}>
                  {user.email}
                </option>
              ))}
            </Form.Select>
            {userError && (
              <Form.Text className="text-danger">{userError}</Form.Text>
            )}
          </Form.Group>
        )}

        {/* Role Selection */}
        <Form.Group className="mb-3">
          <Form.Label>Role</Form.Label>
          <Form.Select
            id="role"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="">Select Role</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </Form.Select>
          {roleError && (
            <Form.Text className="text-danger">{roleError}</Form.Text>
          )}
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button
          className="primary-btn w-auto"
          variant=""
          onClick={handleFormSubmit}
        >
          Assign
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AssignUserModal;
