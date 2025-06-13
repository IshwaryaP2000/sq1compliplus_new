import { useState, useRef } from "react";
import apiClient from "../../../../services/apiService";
import usePageTitle from "../../../../utils/usePageTitle";

const ImportQuestions = () => {
  usePageTitle("Questions Import");
  const [file, setFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadSuccess(false);
    setError("");
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }
    setLoading(true);
    setError("");
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await apiClient.post("/questions-import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setUploadSuccess(true);
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        throw new Error(response.data.message || "File upload failed.");
      }
    } catch (error) {
      setError(
        error.response?.data?.data ||
          error.response?.data?.message ||
          "An error occurred during the upload."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5 form-card" style={{ maxWidth: "500px" }}>
      <h5 className="text-center mb-4">Import Questions</h5>

      {/* Default File Input */}
      <div className="mb-3">
        <input
          type="file"
          onChange={handleFileChange}
          className="form-control"
          ref={fileInputRef} // Attach ref to the input
        />
        {file && (
          <small className="text-muted d-block mt-2">
            Selected File: {file.name}
          </small>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Success Message */}
      {uploadSuccess && (
        <div className="alert alert-success" role="alert">
          File uploaded successfully!
        </div>
      )}

      {/* Upload Button */}
      <button
        className="btn btn-success w-100 primary-btn"
        onClick={handleUpload}
        disabled={loading}
      >
        {loading ? (
          <span
            className="spinner-border spinner-border-sm "
            role="status"
            aria-hidden="true"
          ></span>
        ) : (
          "Upload"
        )}
      </button>
    </div>
  );
};

export default ImportQuestions;
