import { useEffect, useState } from "react";
import "react-international-phone/style.css";
import "react-datepicker/dist/react-datepicker.css";
import { getApi, postApi } from "../../services/apiService";
import { LimitSelector } from "../Search/useSearchAndSort";
import Pagination from "../Pagination/Pagination";

const ListedVendor = ({ GetVendors }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingbtn, setIsLoadingbtn] = useState(false);
  const [data, setData] = useState("");
  const [limit, setLimit] = useState(10);
  const [filteredLength, setFilteredLength] = useState([]);

  const GetService = async () => {
    try {
      setIsLoading(true);
      const response = await getApi("/vendor/get-vendor-service");
      console.error("response", response);
      if (response && response.data && response.data.data) {
        setData(response?.data?.data?.pre_approved_vendors || "");
        setFilteredLength(response?.data?.data?.pre_approved_vendors.length);
      } else {
        console.warn("Invalid API response:", response);
      }
    } catch (error) {
      console.error("Error fetching service data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    GetService();
  }, []);

  const PreVendorAdd = async (id) => {
    try {
      setIsLoadingbtn(true);
      const payload = { id: id };
      await postApi(`/add/pre-approved`, payload);
      GetService();
      GetVendors();
    } catch(err) {
      console.error("Error adding pre-approved vendor:", err);
    } finally {
      setIsLoadingbtn(false);
    }
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
  };

  return (
    <div className="custom-table">
      <div className="table users-table">
        <div>
          {isLoading ? (
            Array.from({ length: data?.length }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: 4 }).map((_, colIndex) => (
                  <td key={colIndex}>
                    <p className="placeholder-glow">
                      <span className="placeholder col-12 bg-secondary"></span>
                    </p>
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <>
              {data?.length === 0 ? (
                <div className="w-100 text-center">
                  <img
                    src="https://img.freepik.com/premium-vector/no-data-found_585024-42.jpg"
                    style={{
                      height: "450px",
                      width: "100%",
                      objectFit: "contain",
                    }}
                    alt=""
                  />
                </div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Name</th>
                      <th scope="col" className="text-start">
                        Service
                      </th>
                      <th scope="col" className="text-center">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, index) => (
                      <tr key={item.id || index}>
                        <td>{index + 1}</td> <td>{item.name || "-"}</td>
                        <td className="text-center d-flex flex-wrap gap-2 border-0">

                          {item?.service_name.map((data) => (
                            <span className="me-2 bg-lightgreen-badge">
                              {data}
                            </span>
                          ))}
                        </td>
                        <td className="text-center" style={{ width: "150px" }}>
                          {item?.is_pre_approved_active === "active" ? (
                            <>
                              <button className="btn primary-btn" disabled>
                                <i className="fa-solid fa-check me-1"></i>{" "}
                                {"Added"}
                              </button>
                            </>
                          ) : (
                            <button
                              className="btn primary-light-btn px-4 d-inline-flex align-items-center"
                              onClick={() => PreVendorAdd(item?.id)}
                            >
                              {isLoadingbtn ? (
                                <div
                                  className="spinner-border p-0 text-white spinner-border-sm"
                                  role="status"
                                ></div>
                              ) : (
                                <>
                                  <i className="fa-solid fa-plus me-1"></i> Add
                                </>
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      </div>
      <div className="d-flex flex-row bd-highlight mb-3 ">
        <div className=" bd-highlight pagennation-list">
          <LimitSelector
            onLimitChange={handleLimitChange}
            filteredLength={filteredLength}
          />
        </div>
        <div className="p-2 bd-highlight w-100">
          <Pagination
            dataFetchFunction={GetVendors}
            filteredLength={filteredLength}
            limit={limit}
          />
        </div>
      </div>
    </div>
  );
};

export default ListedVendor;
