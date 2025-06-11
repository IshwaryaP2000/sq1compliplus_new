import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { getApi } from "../../../../services/apiService";

function VendorFileView() {
  const navigate = useNavigate();
  const id = useParams();
  const [edata, setEdata] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const GetFile = async () => {
    try {
      setIsLoading(true);
      const response = await getApi(`/org-vendor/view-evidence/${id?.id}`);
      setEdata(Object.values(response?.data?.data));
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  const handleback = () => {
    navigate("/vendors");
  };

  useEffect(() => {
    GetFile();
  }, []);

  return (
    <>
      <div className="tabledata-scroll mb-3 mt-3">
        <div className="float-right me-1">
          <button className="btn primary-btn mb-3 " onClick={handleback}>
            Back
          </button>
        </div>
        <table className="table users-table mb-0">
          <thead className="tablescrolling-thead-tr">
            <tr>
              <th scope="col">#</th>
              <th scope="col">Title</th>
              <th scope="col">Description</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody className="tablescrolling-tbody">
            {isLoading ? (
              <tr>
                <td colSpan="4" className="text-center">
                  <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : edata?.length > 0 ? (
              edata?.map((data, index) => (
                <tr key={data?.id}>
                  <th scope="row">{index + 1}</th>
                  <td>{data?.title}</td>
                  <td>{data?.description}</td>
                  <td className="d-flex">
                    <button
                      className="fa-solid fa-eye text-dark border-0 bg-transparent"
                      onClick={() =>
                        window.open(data?.evidence_full_url, "_blank")
                      }
                    ></button>
                    {/* <FileView /> */}
                    <button className="btn btn-outline-danger btn-sm ms-2">
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center">
                  No Data Found...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default VendorFileView;
