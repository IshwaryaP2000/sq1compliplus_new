import { useState, useEffect, useMemo } from "react";
import { useFormik } from "formik";
import CreatableSelect from "react-select/creatable";
import { getApi, postApi } from "../../../../services/apiService";
import Searchbar from "../../../../components/Search/Searchbar";
import usePageTitle from "../../../../utils/usePageTitle";
import { PlusIcon } from "../../../../components/Icons/Icons";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import TanstackTable from "../../../../components/DataTable/TanstackTable";

const ComplexIntegration = () => {
  usePageTitle("Compliance Integration");
  const [departments, setDepartments] = useState([]);
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [credentialFields, setCredentialFields] = useState([
    { key: Date.now(), field1: "", field2: "" },
  ]);

  const preDefinedDepartments = departments.map((department) => ({
    value: department.id,
    label: department.name,
  }));

  const preDefinedTools = tools.map((tool) => ({
    value: tool.id,
    label: tool.name,
  }));

  useEffect(() => {
    fetchDepartments();
    fetchTableData();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await getApi("/department-list");
      setDepartments(response.data.data || []);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchTools = async (departmentId) => {
    try {
      const response = await getApi(
        `/storeDepartment?department_id=${departmentId}`
      );
      const toolsWithCredentials = response.data.data.map((tool) => ({
        ...tool,
        credentials: tool.credentials ? JSON.parse(tool.credentials) : [],
      }));
      setTools(toolsWithCredentials);
    } catch (error) {
      console.error("Error fetching tools:", error);
    }
  };

  const fetchTableData = async () => {
    try {
      setLoading(true);
      const response = await getApi("/compliance-integration");
      setTableData(response.data.data || []);
    } catch (error) {
      console.error("Error fetching table data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setCredentialFields([{ key: Date.now(), field1: "", field2: "" }]);
  };

  const formik = useFormik({
    initialValues: {
      department: "",
      tool: "",
      credentials: credentialFields,
    },
    onSubmit: async (values) => {
      if (!values.department || !values.tool) {
        formik.setFieldError("department", "Please select a department");
        formik.setFieldError("tool", "Please select a tool");
        return;
      }

      for (const field of values.credentials) {
        if (!field.field1.trim() || !field.field2.trim()) {
          formik.setFieldError(
            "credentials",
            "Please fill in all credential fields."
          );
          return;
        }
      }

      setLoading(true);

      try {
        const payload = {
          organization_id: 1,
          compliance_department_id: values.department,
          compliance_tool_id: values.tool,
          credentials: values.credentials,
        };

        await postApi("/compliance-integration", payload);
        fetchTableData();
        formik.resetForm();
        handleCloseDialog();
      } catch (error) {
        console.error("API Error:", error);
      } finally {
        setLoading(false);
      }
    },
  });

  const handleDepartmentSelect = (selectedOption) => {
    const departmentId = selectedOption?.value;
    formik.setFieldValue("department", departmentId);
    formik.setFieldValue("tool", "");
    formik.setFieldValue("credentials", []);
    if (departmentId) {
      fetchTools(departmentId);
    }
  };

  const handleToolSelect = (selectedOption) => {
    const toolId = selectedOption?.value;
    formik.setFieldValue("tool", toolId);
  };

  const addCredentialField = () => {
    setCredentialFields([
      ...credentialFields,
      { key: Date.now(), field1: "", field2: "" },
    ]);
  };

  const removeCredentialField = (key) => {
    setCredentialFields(credentialFields.filter((field) => field.key !== key));
  };

  const handleSearch = () => {};

  const columns = useMemo(
    () => [
      {
        accessorKey: "index",
        header: "S. No.",
        cell: ({ row }) => row.index + 1,
        enableSorting: false,
      },
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ getValue }) => getValue(),
        enableSorting: false,
      },
      {
        accessorKey: "department",
        header: "Department",
        cell: ({ getValue }) => getValue() || "",
        enableSorting: false,
      },
      {
        accessorKey: "tool",
        header: "Tool",
        cell: ({ getValue }) => getValue() || "",
        enableSorting: false,
      },
      {
        accessorKey: "credentials",
        header: "API Credentials",
        cell: () => "****",
        enableSorting: false,
      },
    ],
    []
  );

  const table = useReactTable({
    data: tableData || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      <div className="d-flex flex-wrap float-end mb-3">
        <Searchbar onSearch={handleSearch} placeHolder={"Search"} />
        <button
          type="button"
          className="btn primary-btn ms-2"
          data-bs-toggle="modal"
          data-bs-target="#complianceIntegration"
        >
          Compliance Integration
        </button>
      </div>
      <div
        className="modal fade"
        id="complianceIntegration"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
        aria-labelledby="complianceIntegrationLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="complianceIntegrationLabel">
                Compliance Integration
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={formik.handleSubmit}>
                {/* Department Dropdown */}
                <div className="form-group">
                  <label className="my-2" htmlFor="department">
                    Department
                  </label>
                  <CreatableSelect
                    isClearable
                    options={preDefinedDepartments}
                    onChange={handleDepartmentSelect}
                    value={preDefinedDepartments.find(
                      (option) => option.value === formik.values.department
                    )}
                  />
                  {formik.errors.department && formik.touched.department && (
                    <div className="text-danger">
                      {formik.errors.department}
                    </div>
                  )}
                </div>

                {/* Tool Dropdown */}
                {formik.values.department && (
                  <div className="form-group">
                    <label className="my-2" htmlFor="tool">
                      Tools
                    </label>
                    <CreatableSelect
                      isClearable
                      options={preDefinedTools}
                      onChange={handleToolSelect}
                      value={preDefinedTools.find(
                        (option) => option.value === formik.values.tool
                      )}
                    />
                    {formik.errors.tool && formik.touched.tool && (
                      <div className="text-danger">{formik.errors.tool}</div>
                    )}
                  </div>
                )}

                {/* Add Credential Fields only if Tool is selected */}
                {formik.values.tool && (
                  <div>
                    <h5 className="my-3">Credential Fields</h5>
                    {credentialFields.map((field, index) => (
                      <div
                        key={field.key}
                        className="form-group d-flex align-items-center mb-3"
                      >
                        <div className="me-3">
                          <label className="mb-2">Key</label>
                          <input
                            type="text"
                            className="form-control"
                            value={field.field1}
                            onChange={(e) => {
                              const newFields = [...credentialFields];
                              newFields[index].field1 = e.target.value;
                              setCredentialFields(newFields);
                            }}
                          />
                        </div>
                        <div className="me-3">
                          <label className="mb-2">Value</label>
                          <input
                            type="text"
                            className="form-control"
                            value={field.field2}
                            onChange={(e) => {
                              const newFields = [...credentialFields];
                              newFields[index].field2 = e.target.value;
                              setCredentialFields(newFields);
                            }}
                          />
                        </div>
                        {index === 0 ? (
                          <button
                            type="button"
                            className="btn primary-btn mt-30"
                            onClick={addCredentialField}
                          >
                            <PlusIcon />
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-danger mt-30"
                            onClick={() => removeCredentialField(field.key)}
                          >
                            <i className="fa-solid fa-x"></i>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseDialog}
                    disabled={loading}
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn primary-btn"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm"></span>
                    ) : (
                      "Submit"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <TanstackTable
        table={table}
        columns={columns}
        isLoading={loading}
        emptyMessage="No data available"
        className="table mt-5  users-table"
      />
    </div>
  );4
};

export default ComplexIntegration;