import { useState } from "react";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { postApi, getApi } from "../../../../services/apiService";
import usePageTitle from "../../../../utils/usePageTitle";
import {
  DownloadIcon,
  LeftarrowIcon,
} from "../../../../components/Icons/Icons";

const BulkUploadQuestion = () => {
  usePageTitle("Bulk Upload Question");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsloading] = useState(false);
  const navigate = useNavigate();

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
      setIsloading(true);
      const formData = new FormData();
      formData.append("bulk_question", file);
      const response = await postApi("/vendor/save-bulk-question", formData);
      if (response?.data?.data) {
        navigate("/settings/validate-upload"); // Navigate after successful upload
      } else {
        toast.error("Failed to upload the file.");
      }
      setFile(null);
      setError("");
      document.getElementById("fileInput").value = null;
    } catch (error) {
      console.error("Error while uploading questions");
    } finally {
      setIsloading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await getApi("/vendor/download-sample-question");
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
      console.error("Error downloading the file:", error);
      toast.error("There was an error downloading the file. Please try again.");
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between mb-3 flex-wrap">
        <h5 className="mb-0 place-item-end">Bulk Upload Question</h5>
        <div className="d-flex">
          <Link to="/settings/question">
            <button className="btn mx-1 primary-btn">
              <LeftarrowIcon className="me-1" />
              Back
            </button>
          </Link>
        </div>
      </div>
      <div className="card ">
        <div className="card-body ">
          <form onSubmit={handleSubmit}>
            <div>
              <label className="mb-2">
                Question Excel <span className="text-danger">*</span>
              </label>
              <div className="d-flex gap-2">
                <input
                  type="file"
                  id="fileInput"
                  className="styled-file-upload w-100 mb-0"
                  onChange={handleFileChange}
                />
                <div className="d-flex align-items-end">
                  {isLoading ? (
                    <div className="stackflo-loadert " role="status">
                      <span className="custom-loader "></span>
                    </div>
                  ) : (
                    <button className="btn primary-btn h-100">Upload</button>
                  )}
                </div>
              </div>
              {error && <div className="text-danger">{error}</div>}
            </div>

            <div className="mt-5">
              <h5>Excel Upload Instructions</h5>
              <ul style={{ color: "red" }}>
                <li>
                  Minimum number of rows: <strong>1</strong>
                </li>
                <li>
                  Maximum number of rows: <strong>500</strong>
                </li>
                <li>
                  Maximum file size: <strong>5 MB</strong>
                </li>
                <li>
                  Ensure <strong>all columns</strong> are filled in each row
                  with proper data
                </li>
                <li>
                  Uploading multiple sheets is <strong>not supported</strong>;
                  only the first sheet (Sheet1) will be processed by default.
                </li>
                <li>
                  Ensure <strong>all columns</strong> are filled in each row
                  with proper data
                </li>
                <li>Only upload valid Excel files (.xls, .xlsx)</li>
              </ul>
            </div>

            <div
              className="cursor-pointer link-btn mt-4"
              onClick={handleDownload}
            >
              Download Sample
              <DownloadIcon className="me-1" />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadQuestion;
