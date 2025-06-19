import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Offcanvas, Form, Modal, Button } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { getApi, postApi } from "../../../../services/apiService";
import ButtonWithLoader from "../../../../components/Button/ButtonLoader";
import { email } from "../../../../components/Validationschema/commonSchema";
import DeleteModal from "../../../../components/Modal/DeleteModal";
import { PlusIcon, UploadIcon } from "../../../../components/Icons/Icons";

const Employee = () => {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmployeeCanvas, setShowEmployeeCanvas] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const response = await getApi("/policy/employees");
      if (response?.data?.data) {
        setEmployees(response.data.data.employees.data);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleBulkUpload = () => {
    navigate("/policy/employees/bulk-upload");
  };

  const employeeInitialValues = {
    name: "",
    email: "",
  };

  const employeeValidationSchema = Yup.object().shape({
    name: Yup.string().required("Employee Name is required*"),
    email: email,
  });

  const employeeFormik = useFormik({
    initialValues: employeeInitialValues,
    validationSchema: employeeValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        setIsLoading(true);
        const response = await postApi("/policy/employee-create", {
          name: values.name,
          email: values.email,
        });

        if (response?.success || response?.data?.success) {
          resetForm();
          setShowEmployeeCanvas(false);
          await fetchEmployees(); // Update list immediately
        } else {
        }
      } catch (error) {
        console.error("Error creating employee:", error);
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleShowEmployeeCanvas = () => setShowEmployeeCanvas(true);
  const handleCloseEmployeeCanvas = () => setShowEmployeeCanvas(false);

  // Delete employee functions
  const handleShowDeleteModal = (employee) => {
    setSelectedEmployee(employee);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setSelectedEmployee(null);
    setShowDeleteModal(false);
  };

  const handleDeleteEmployee = async () => {
    if (!selectedEmployee) return;

    try {
      setDeleteLoading(true);
      const response = await postApi(
        `/policy/employee-delete/${selectedEmployee.id}`
      );

      if (response?.success || response?.data?.success) {
        // Refresh employee list after successful deletion
        await fetchEmployees();
      } else {
        console.error("Employee deletion failed:", response?.data?.message);
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
    } finally {
      setDeleteLoading(false);
      handleCloseDeleteModal();
    }
  };

  return (
    <div>
      <h5>Employees</h5>
      <div className="d-flex justify-content-end flex-wrap mb-3">
        <button
          className="btn mx-1 ms-2 p-2 primary-btn"
          onClick={handleBulkUpload}
          disabled={isLoading}
        >
          Bulk Upload
          <UploadIcon className="ms-1" />
        </button>
        <button
          className="btn mx-1 ms-2 p-2 primary-btn"
          onClick={handleShowEmployeeCanvas}
          disabled={isLoading}
        >
          <PlusIcon className="ms-1 me-2" />
          Create Employee
        </button>
      </div>

      <table className="table users-table">
        <thead>
          <tr>
            <th scope="col" className="radius-design-ls">
              #
            </th>
            <th scope="col">Name</th>
            <th scope="col">Email</th>
            <th scope="col">Status</th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <tr key={`loading-${index}`}>
                {Array.from({ length: 5 }).map((_, colIndex) => (
                  <td key={`loading-col-${colIndex}`}>
                    <p className="placeholder-glow">
                      <span className="placeholder col-12 bg-secondary"></span>
                    </p>
                  </td>
                ))}
              </tr>
            ))
          ) : employees.length > 0 ? (
            employees.map((employee, index) => (
              <tr key={employee.id || `employee-${index}`}>
                <td>{index + 1}</td>
                <td>{employee.name}</td>
                <td>{employee.email}</td>
                <td>
                  <span
                    className={`badge ${
                      employee.status === "active"
                        ? "bg-success"
                        : "bg-secondary"
                    }`}
                  >
                    {employee.status || "N/A"}
                  </span>
                </td>
                <td>
                  <i
                    className="fa-solid fa-trash text-danger border-0"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleShowDeleteModal(employee)}
                  ></i>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">
                No Data Available...
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Offcanvas for Employee Creation */}
      <Offcanvas
        show={showEmployeeCanvas}
        onHide={handleCloseEmployeeCanvas}
        placement="end"
        style={{ width: "400px" }}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Create New Employee</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form onSubmit={employeeFormik.handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Employee Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                placeholder="Enter employee name"
                value={employeeFormik.values.name}
                onChange={employeeFormik.handleChange}
                onBlur={employeeFormik.handleBlur}
                isInvalid={
                  employeeFormik.touched.name && !!employeeFormik.errors.name
                }
                disabled={isLoading}
              />
              <Form.Control.Feedback type="invalid">
                {employeeFormik.errors.name}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="Enter employee email"
                value={employeeFormik.values.email}
                onChange={employeeFormik.handleChange}
                onBlur={employeeFormik.handleBlur}
                isInvalid={
                  employeeFormik.touched.email && !!employeeFormik.errors.email
                }
                disabled={isLoading}
              />
              <Form.Control.Feedback type="invalid">
                {employeeFormik.errors.email}
              </Form.Control.Feedback>
            </Form.Group>

            <button
              type="submit"
              className="btn primary-btn mx-1 p-1 mb-2 mt-2 d-flex justify-content-center align-items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <ButtonWithLoader name="Creating..." />
                </>
              ) : (
                "Create Employee"
              )}
            </button>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        backdrop="static"
        onHide={handleCloseDeleteModal}
        centered
      >
        <Modal.Body className="p-3 m-0 text-center modal-body">
          {selectedEmployee && (
            // <p className="mb-0">
            //   Are you sure you want to delete the employee ?
            // </p>
            <DeleteModal msg="employee" />
          )}
        </Modal.Body>
        <Modal.Footer className="justify-content-center border-0 m-0 p-2 modal-footer">
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteEmployee}
            disabled={deleteLoading}
          >
            {deleteLoading ? "Deleting..." : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Employee;
