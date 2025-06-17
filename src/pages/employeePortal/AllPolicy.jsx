import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApi } from "../../services/apiService";
import { ucFirst } from "../../utils/UtilsGlobalData";
import Searchbar from "../../components/Search/Searchbar";
import {
  createDebouncedSearch,
  fetchSearchResults,
  highlightText,
} from "../../components/Search/useSearchAndSort";

const AllPolicy = () => {
  const [data, setData] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredLength, setFilteredLength] = useState([]);
  const [pageIndex, setPageIndex] = useState([]);
  const navigate = useNavigate();

  // useCallback for stable function reference
  const getAllPolicies = useMemo(() => async () => {
    try {
      setIsLoading(true);
      const response = await getApi("employee/all/policies");
      const policies = response?.data?.data;
      setData(policies);
      setFilteredUsers(policies);
      setFilteredLength(policies?.length);
    } catch (err) {
      console.error("error", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // useCallback for stable function reference
  const getAllPoliciesByID = useMemo(() => (id) => {
    try {
      navigate(`/employee/policy/${id}`);
    } catch (err) {
      console.error("error", err);
    }
  }, [navigate]);

  useEffect(() => {
    getAllPolicies();
  }, [getAllPolicies]);

  const debouncedFetchSearchResults = useMemo(
    () =>
      createDebouncedSearch((params) => {
        fetchSearchResults(
          "/employee/all/policies",
          params,
          setFilteredUsers,
          setIsLoading,
          setFilteredLength,
          setPageIndex
        );
      }, 300),
    []
  );

  const handleSearch = (searchVal) => {
    setSearchVal(searchVal);
    debouncedFetchSearchResults({
      search: searchVal,
    });
  };

  return (
    <>
      <div className="d-flex justify-content-between mb-3 flex-wrap">
        <h5>
          {data?.length === 1 ? "All Policy" : "All Policies"}
          {data?.length > 0 && (
            <span className="badge user-active text-white m-2">
              {data?.length}
            </span>
          )}
        </h5>
        <div className="d-flex">
          <Searchbar onSearch={handleSearch} placeHolder={"Search"} />
        </div>
      </div>

      <div className="pb-5 mb-5">
        {isLoading ? (
          <div className="row w-100">
            {Array.from({ length: 7 }).map((_, index) => (
              <div key={index} className="col-12 mb-3">
                <div className="card">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-12">
                        <p className="placeholder-glow">
                          <span className="placeholder col-12 bg-secondary"></span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredUsers?.length > 0 ? (
          <div className="row w-100">
            {filteredUsers.map((policy, index) => (
              <div
                style={{ position: "relative" }}
                className="col-md-4 mb-1"
                key={policy?.id || index}
                onClick={() => getAllPoliciesByID(policy?.id)}
              >
                <div
                  className={`card p-4 rounded-4 activepolicy-card`}
                  style={{
                    cursor: "pointer",
                    transition: "filter 0.3s ease",
                    position: "relative",
                  }}
                >
                  <div className="card-body p-0">
                    <div className="d-flex justify-content-between mb-3">
                      <div>
                        <h5
                          className="fs-24 policy-card-h"
                          dangerouslySetInnerHTML={{
                            __html: highlightText(
                              ucFirst(policy?.name) || "",
                              searchVal
                            ),
                          }}
                        ></h5>

                        <div className="d-flex">
                          <div className="poilcy-status d-flex me-2">
                            <div
                              className="status-color me-2"
                              style={{ background: "#37C650" }}
                            ></div>
                            <span
                              dangerouslySetInnerHTML={{
                                __html: highlightText(
                                  ucFirst(policy?.status) || "",
                                  searchVal
                                ),
                              }}
                            ></span>
                          </div>
                          <p className="policy-review-date mb-0">
                            <span
                              dangerouslySetInnerHTML={{
                                __html: highlightText(
                                  `Policy Valid Until - ${
                                    policy?.expiry_date || ""
                                  }`,
                                  searchVal
                                ),
                              }}
                            ></span>
                          </p>
                        </div>
                      </div>

                      <div className="poilcy-status d-flex  me-2 align-items-center">
                        <div
                          className=""
                          style={{ background: "#37C650" }}
                        ></div>
                        <span
                          dangerouslySetInnerHTML={{
                            __html: highlightText(
                              `V - ${policy?.version || ""}`,
                              searchVal
                            ),
                          }}
                        ></span>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between">
                      <div className="policy-details">
                        <p className="mb-0 fs-14 text-gray-light mb-2">
                          Policy Title
                        </p>
                        <h5
                          dangerouslySetInnerHTML={{
                            __html: highlightText(
                              ucFirst(policy?.title) || "",
                              searchVal
                            ),
                          }}
                        ></h5>
                      </div>
                      <div className="policy-details">
                        <p className="mb-0 fs-14 text-gray-light mb-2">
                          Category
                        </p>
                        <h5
                          dangerouslySetInnerHTML={{
                            __html: highlightText(
                              ucFirst(policy?.category) || "",
                              searchVal
                            ),
                          }}
                        ></h5>
                      </div>
                      <div className="d-flex align-items-center">
                        <button
                          type="button"
                          className="btn btn-sm primary-btn ms-3 mt-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            getAllPoliciesByID(policy?.id);
                          }}
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card w-100">
            <div className="card-body text-center">
              <p>No Data Available...</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AllPolicy;
