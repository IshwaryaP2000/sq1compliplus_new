import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { postApi, getApi } from "../../../../services/apiService";

function BulkUploadEmployees() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedEmployees, setUploadedEmployees] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  const fetchUploadedEmployees = async () => {
    try {
      setIsLoading(true);
      const response = await getApi("/policy/uploaded-employees");
      if (response?.data?.success && response?.data?.data) {
        setUploadedEmployees(response.data.data);
        setShowResults(true);
      } else {
      }
    } catch (error) {
      console.error("Error fetching uploaded employees:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;
    const fileName = selectedFile.name;
    const fileExtension = fileName.split(".").pop().toLowerCase();
    const validExtensions = ["csv", "xls", "xlsx"];
    const validTypes = [
      "application/vnd.ms-excel",
      "text/csv",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/octet-stream",
    ];

    if (
      validExtensions.includes(fileExtension) ||
      validTypes.includes(selectedFile.type)
    ) {
      setError("");
      setFile(selectedFile);
      setShowResults(false);
    } else {
      setError("Please upload a valid file (Excel or CSV).");
      setFile(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      setError("File is required.");
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("group_employee", file);

      // Step 1: Upload the file
      const uploadResponse = await postApi("/policy/employee-upload", formData);

      if (uploadResponse?.success || uploadResponse?.data?.success) {
        await fetchUploadedEmployees();
      } else {
      }
    } catch (error) {
      setShowResults(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEmployees = async () => {
    try {
      setIsLoading(true);
      const response = await postApi("/policy/employee-save", {});
      if (response?.success || response?.data?.success) {
        navigate("/policy/employees");
      } else {
      }
    } catch (error) {
      console.error("Error while saving employees:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await getApi("/policy/template/download");
      const downloadUrl = response?.data?.data;
      if (!downloadUrl) {
        throw new Error("Download URL is missing in the response.");
      }
      if (downloadUrl.startsWith("http")) {
        window.location.href = downloadUrl;
      } else {
        throw new Error("Invalid URL provided for downloading.");
      }
    } catch (error) {
      // console.error("Error downloading the file:", error);
      // toast.error("There was an error downloading the file. Please try again.");
    }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Bulk Upload Employees</h4>
        <div className="invisible" style={{ width: "100px" }}></div>
      </div>

      <div className="justify-items-center">
        {!showResults ? (
          <>
            <div className="card form-card w-100">
              <h4 className="text-center mb-4">Upload Employees</h4>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">
                    Upload File (Excel or CSV)
                  </label>
                  <input
                    type="file"
                    id="fileInput"
                    className="form-control mt-2"
                    onChange={handleFileChange}
                    accept=".xlsx,.xls,.csv"
                    disabled={isLoading}
                  />
                  {error && <div className="text-danger mt-2">{error}</div>}
                </div>

                <div className="mt-2">
                  <span
                    className="text-primary cursor-pointer"
                    onClick={handleDownload}
                    style={{ cursor: "pointer" }}
                  >
                    Download Sample
                    <i className="fa-solid fa-download ms-1"></i>
                  </span>
                </div>

                <div className="text-center">
                  <button
                    type="submit"
                    className="btn primary-btn mt-3"
                    disabled={!file || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Uploading...
                      </>
                    ) : (
                      "Upload"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="card form-card w-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="mb-0">Uploaded Employees</h4>
            </div>

            {isLoading ? (
              <div className="text-center p-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading uploaded employees...</p>
              </div>
            ) : (
              <>
                {uploadedEmployees.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-striped table-hover">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {uploadedEmployees.map((employee, index) => (
                          <tr key={employee.id || index}>
                            <td>{index + 1}</td>
                            <td>{employee.name}</td>
                            <td>{employee.email}</td>
                            <td>
                              <span
                                className={`badge ${
                                  employee.status === "success"
                                    ? "bg-success"
                                    : "bg-danger"
                                }`}
                              >
                                {employee.status || "Processed"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="alert alert-info">
                    No employees were uploaded or found.
                  </div>
                )}

                <div className="text-center mt-3">
                  <button
                    className="btn btn-sm primary-btn"
                    onClick={handleSaveEmployees}
                    disabled={isLoading || uploadedEmployees.length === 0}
                  >
                    {isLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Saving...
                      </>
                    ) : (
                      "Save Employees"
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default BulkUploadEmployees;
