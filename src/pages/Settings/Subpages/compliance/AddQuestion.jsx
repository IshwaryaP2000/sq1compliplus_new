import React, { useState } from "react";
import { postApi } from "../../../api/apiClient";
import { toast } from "react-toastify";

function AddQuestion() {
  usePageTitle("Add Questions");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;
    const validTypes = [
      "application/vnd.ms-excel",
      "text/csv",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (!validTypes.includes(selectedFile.type)) {
      setError("Please upload a valid file (Excel or CSV).");
      setFile(null);
    } else {
      setError("");
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      setError("File is required.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await postApi("/questions-import", formData);
      toast.success(response?.data?.data);
      setFile(null);
      setError("");
      document.getElementById("fileInput").value = null;
    } catch (error) {
      // toast.error("Error while uploading questions");
      console.log("Error while uploading questions");
    }
  };

  return (
    <>
      <div className="justify-items-center">
        <div className="card form-card w-100">
          <h4 className="text-center mb-2">Upload Questions</h4>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              {/* <label htmlFor="fileInput ">Upload File</label> */}
              <label className="form-label">Upload File</label>
              <input
                type="file"
                id="fileInput"
                className="form-control mt-2"
                onChange={handleFileChange}
              />
              {error && <div className="text-danger">{error}</div>}
            </div>

            <center>
              <button type="submit" className="btn btn-sm primary-btn mt-3">
                Upload
              </button>
            </center>
          </form>
        </div>
      </div>
    </>
  );
}

export default AddQuestion;
