import { useState, useEffect } from "react";
import { Formik, Form, Field, FieldArray } from "formik";
import * as Yup from "yup";
import { getApi, postApi } from "../../api/apiClient";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import usePageTitle from "../includes/usePageTitle";

const DepartmentsPage = () => {
  usePageTitle("Departments and Tools");
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [tools, setTools] = useState([]);
  const [filteredTools, setFilteredTools] = useState([]);
  const [isNewToolMode, setIsNewToolMode] = useState(false);
  const [typedTool, setTypedTool] = useState("");

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await getApi("/department-list");
      setDepartments(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchTools = async (departmentId) => {
    try {
      const response = await getApi(
        `/tools-list?department_id=${departmentId}`
      );
      const fetchedTools = response.data?.data || [];
      setTools(fetchedTools);
      setFilteredTools(fetchedTools);
      setIsNewToolMode(false);
    } catch (error) {
      console.error("Error fetching tools:", error);
    }
  };

  const handleToolInputChange = (inputValue) => {
    setTypedTool(inputValue);
    const matches = tools.filter((tool) =>
      tool.name.toLowerCase().startsWith(inputValue.toLowerCase())
    );
    setFilteredTools(matches);

    if (matches.length === 0 && inputValue.trim() !== "") {
      setIsNewToolMode(true);
    } else {
      setIsNewToolMode(false);
    }
  };

  const handleAddDepartment = async (values, actions) => {
    try {
      await postApi("/department-store", { name: values.departmentName });
      actions.resetForm();
      fetchDepartments();
    } catch (error) {
      const apiErrors = error.response?.data?.errors || {};
      const errorMessage =
        error.response?.data?.message || "Something went wrong!";
      actions.setErrors(apiErrors);

      // Show error in toaster
      toast.error(errorMessage);
    }
  };

  const handleAddTool = async (values, actions) => {
    try {
      await postApi("/tool-store", {
        department_id: selectedDepartment,
        name: values.toolName,
        credentials: values.credentials,
      });
      actions.resetForm();
      setIsNewToolMode(false);
      fetchTools(selectedDepartment);
      toast.success("Tool added successfully!");
    } catch (error) {
      const apiErrors = error.response?.data?.errors || {};
      const errorMessage =
        error.response?.data?.message || "Something went wrong!";
      actions.setErrors(apiErrors);

      // Show error in toaster
      toast.error(errorMessage);
    }
  };

  // Validation schema for Formik
  const departmentValidationSchema = Yup.object().shape({
    departmentName: Yup.string().required("Please enter the department name"),
  });

  const toolValidationSchema = Yup.object().shape({
    // toolName: Yup.string().required("Tool name is required"),
    credentials: Yup.array()
      .of(Yup.string().required("Credential cannot be empty"))
      .min(1, "At least one credential is required"),
  });

  return (
    <div className="container my-4">
      <div className="row">
        {/* Add Department */}
        <div className="col-md-6">
          <div className="card form-card h-100">
            <h5 className="card-title">Add Department</h5>
            <hr />
            <Formik
              initialValues={{ departmentName: "" }}
              validationSchema={departmentValidationSchema}
              validateOnBlur={false} // Disable validation on blur
              validateOnChange={false} // Disable validation on change
              onSubmit={(values, actions) =>
                handleAddDepartment(values, actions)
              }
            >
              {({ errors, handleSubmit }) => (
                <Form
                  onSubmit={handleSubmit}
                  className="h-100 d-grid align-content-between"
                >
                  <div className="mb-3">
                    <label htmlFor="departmentName" className="form-label">
                      Department Name
                    </label>
                    <Field
                      id="departmentName"
                      name="departmentName"
                      type="text"
                      maxLength="20"
                      className={`form-control ${errors.departmentName ? "is-invalid" : ""
                        }`}
                    />
                    {errors.departmentName && (
                      <div className="invalid-feedback">
                        {errors.departmentName}
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="btn primary-btn "
                    style={{ width: "fit-content" }}
                  >
                    Add Department
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        </div>

        {/* Add Tools */}
        <div className="col-md-6">
          <div className="card form-card h-100">
            <h5 className="card-title">Add Tools</h5>
            <hr />
            <Formik
              initialValues={{ toolName: "", credentials: [] }}
              validationSchema={toolValidationSchema}
              onSubmit={(values, actions) => handleAddTool(values, actions)}
            >
              {({ values, errors, touched, handleChange }) => (
                <Form>
                  {/* Select Department */}
                  <div className="mb-3">
                    <label htmlFor="departmentSelect" className="form-label">
                      Select Department
                    </label>
                    <select
                      id="departmentSelect"
                      className="form-control"
                      value={selectedDepartment}
                      onChange={(e) => {
                        setSelectedDepartment(e.target.value);
                        fetchTools(e.target.value);
                      }}
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tool Input with Dropdown */}
                  <div className="mb-3 position-relative">
                    <label htmlFor="toolName" className="form-label">
                      Tool Name
                    </label>
                    <Field
                      id="toolName"
                      name="toolName"
                      type="text"
                      className={`form-control ${errors.toolName && touched.toolName ? "is-invalid" : ""
                        }`}
                      placeholder="Type tool name"
                      onChange={(e) => {
                        handleChange(e);
                        handleToolInputChange(e.target.value);
                      }}
                    />
                    {errors.toolName && touched.toolName && (
                      <div className="invalid-feedback">{errors.toolName}</div>
                    )}

                    {/* Dropdown for filtered tools */}
                    {typedTool && filteredTools.length > 0 && (
                      <ul className="dropdown-menu show position-absolute w-100">
                        {filteredTools.map((tool) => (
                          <li
                            key={tool.id}
                            className="dropdown-item"
                            onClick={() => {
                              handleChange({
                                target: { name: "toolName", value: tool.name },
                              });
                              setTypedTool(tool.name);
                              setIsNewToolMode(false);
                            }}
                          >
                            {tool.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Credentials for New Tool */}
                  {isNewToolMode && (
                    <FieldArray name="credentials">
                      {({ push, remove }) => (
                        <>
                          {values.credentials.map((_, index) => (
                            <div className="input-group mb-3" key={index}>
                              <Field
                                name={`credentials[${index}]`}
                                type="text"
                                className={`form-control ${errors.credentials &&
                                  errors.credentials[index] &&
                                  touched.credentials &&
                                  touched.credentials[index]
                                  ? "is-invalid"
                                  : ""
                                  }`}
                                placeholder={`Credential Key ${index + 1}`}
                              />
                              {errors.credentials &&
                                errors.credentials[index] &&
                                touched.credentials &&
                                touched.credentials[index] && (
                                  <div className="invalid-feedback d-block">
                                    {errors.credentials[index]}
                                  </div>
                                )}
                              <button
                                type="button"
                                className="btn btn-danger"
                                onClick={() => remove(index)}
                                disabled={values.credentials.length <= 3} // Disable removing if only 3 left
                              >
                                Remove
                              </button>
                            </div>
                          ))}

                          {/* Add Credential Button */}
                          <div className="d-flex justify-content-between">
                            <button
                              type="button"
                              className="btn btn-secondary mb-3"
                              onClick={() => push("")}
                              disabled={values.credentials.length >= 5} // Disable adding if 5 already added
                            >
                              Add Credential
                            </button>
                            <button
                              type="submit"
                              className="btn btn-primary mb-3"
                              disabled={values.credentials.length < 3} // Disable submit if fewer than 3
                            >
                              Add Tool
                            </button>
                          </div>

                          {/* Validation Message for Credential Count */}
                          {values.credentials.length < 3 && (
                            <div className="text-danger">
                              You must add at least 3 credentials.
                            </div>
                          )}
                          {values.credentials.length > 5 && (
                            <div className="text-danger">
                              You cannot add more than 5 credentials.
                            </div>
                          )}
                        </>
                      )}
                    </FieldArray>
                  )}
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentsPage;
