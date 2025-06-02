import React, { useMemo } from "react";
import { useState, useEffect } from "react";
import { getApi } from "../../../api/apiClient";
import ConfirmationModel from "../../../models/UserConfirmationModal";
import { Link } from "react-router-dom";
import EditQuestions from "../../../models/EditQuestions";
import Pagination from "../../../components/Pagination";
import Searchbar from "../../../components/Searchbar";
import { getCurrentUser, hasRole } from "../../../utils/UtilsGlobalData";
// import { useCallback } from "react";
import {
  createDebouncedSearch,
  fetchSearchResults,
  highlightText,
  LimitSelector,
} from "../../../components/useSearchAndSort";
import { BiUpArrowAlt, BiDownArrowAlt } from "react-icons/bi";
import usePageTitle from "../../includes/usePageTitle";

const ReadinessView = () => {
  usePageTitle("Readiness");
  const [data, setData] = useState("");
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [sortColumn, setSortColumn] = useState("type");
  const [sortDirection, setSortDirection] = useState("desc");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredLength, setFilteredLength] = useState([]);
  const [limit, setLimit] = useState(10);
  const [pageIndex, setPageIndex] = useState([]);
  const [expandedDescriptions, setExpandedDescriptions] = useState({}); // Changed to match your previous state name

  const currentUser = getCurrentUser();
  const DESCRIPTION_MAX_LENGTH = 50; // Changed to 50 to match your previous code
  const COLUMN_WIDTH = "200px";

  const GetQuestions = async (URI = "get-questions") => {
    try {
      setIsLoading(true);
      const response = await getApi(URI);
      setData(response?.data?.data);
      setFilteredUsers(response?.data?.data?.data);
      setFilteredLength(response?.data?.data?.meta?.total);
      setPageIndex(response?.data?.data);
    } catch {
      console.log("error getting a data");
    } finally {
      setIsLoading(false);
    }
  };

  const GetTypes = async () => {
    try {
      const response = await getApi("compliance-types");
      setType(response?.data || []);
    } catch (error) {}
  };

  const GetCategory = async () => {
    try {
      const response = await getApi("compliance-category");
      setCategory(response?.data || []);
    } catch (error) {}
  };

  useEffect(() => {
    GetQuestions();
    GetTypes();
    GetCategory();
  }, []);

  const handleSearch = (searchVal) => {
    setSearchVal(searchVal);
    debouncedFetchSearchResults({
      search: searchVal,
      sort_by: sortColumn || "",
      sort_direction: sortDirection,
      limit: limit,
    });
  };

  const handleSort = (columnName) => {
    const newSortDirection =
      sortColumn === columnName
        ? sortDirection === "asc"
          ? "desc"
          : "asc"
        : "asc";

    setSortDirection(newSortDirection);
    setSortColumn(columnName);

    debouncedFetchSearchResults({
      search: searchVal,
      sort_by: columnName,
      sort_direction: newSortDirection,
      limit: limit,
    });
  };

  // const debouncedFetchSearchResults = useCallback(
  //   createDebouncedSearch((params) => {
  //     fetchSearchResults(
  //       "/get-questions",
  //       params,
  //       setFilteredUsers,
  //       setIsLoading,
  //       setFilteredLength,
  //       setPageIndex
  //     );
  //   }, 300),
  //   []
  // );

  const debouncedFetchSearchResults = useMemo(
    () =>
      createDebouncedSearch((params) => {
        fetchSearchResults(
          "/get-questions",
          params,
          setFilteredUsers,
          setIsLoading,
          setFilteredLength,
          setPageIndex
        );
      }, 300),
    []
  );

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    debouncedFetchSearchResults({
      search: searchVal,
      sort_by: sortColumn || "",
      sort_direction: sortDirection,
      limit: newLimit,
    });
  };

  const truncateText = (text, maxLength) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const toggleDescription = (id) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const isSuperAdmin = currentUser && hasRole(["sq1_super_admin"]);

  return (
    <>
      <div className="d-flex justify-content-between mb-3 flex-wrap">
        <h5>
          Readiness{" "}
          {data?.meta?.total !== 0 ? (
            <span className="badge user-active text-white">
              {data?.meta?.total}
            </span>
          ) : (
            ""
          )}
        </h5>
        <div className="d-flex">
          <Searchbar onSearch={handleSearch} placeHolder={"Search"} />
          {isSuperAdmin && (
            <Link to={"/settings/add-question"}>
              <button type="button" className="ms-2 btn primary-btn btn">
                <i className="fa-solid fa-plus me-2"></i>
                Add questions
              </button>
            </Link>
          )}
        </div>
      </div>
      <div className="tabledata-scroll mb-3">
        <table className="table users-table mb-0">
          <thead className="tablescrolling-thead-tr">
            <tr>
              <th scope="col">#</th>
              <th scope="col" onClick={() => handleSort("type")}>
                Type
                <span
                  style={{
                    color: "rgba(48, 188, 71)",
                    cursor: "pointer",
                    fontSize: "20px",
                  }}
                >
                  {sortDirection === "asc" && sortColumn === "type" ? (
                    <BiUpArrowAlt />
                  ) : (
                    <BiDownArrowAlt />
                  )}
                </span>
              </th>
              <th scope="col" onClick={() => handleSort("category")}>
                Category
                <span
                  style={{
                    color: "rgba(48, 188, 71)",
                    cursor: "pointer",
                    fontSize: "20px",
                  }}
                >
                  {sortDirection === "asc" && sortColumn === "category" ? (
                    <BiUpArrowAlt />
                  ) : (
                    <BiDownArrowAlt />
                  )}
                </span>
              </th>
              <th scope="col" onClick={() => handleSort("question")}>
                Question
                <span
                  style={{
                    color: "rgba(48, 188, 71)",
                    cursor: "pointer",
                    fontSize: "20px",
                  }}
                >
                  {sortDirection === "asc" && sortColumn === "question" ? (
                    <BiUpArrowAlt />
                  ) : (
                    <BiDownArrowAlt />
                  )}
                </span>
              </th>
              <th scope="col" onClick={() => handleSort("description")}>
                Description
                <span
                  style={{
                    color: "rgba(48, 188, 71)",
                    cursor: "pointer",
                    fontSize: "20px",
                  }}
                >
                  {sortDirection === "asc" && sortColumn === "description" ? (
                    <BiUpArrowAlt />
                  ) : (
                    <BiDownArrowAlt />
                  )}
                </span>
              </th>
              <th scope="col" className="text-nowrap">
                Yes score
              </th>
              <th scope="col" className="text-nowrap">
                No score
              </th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody className="tablescrolling-tbody">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {Array.from({ length: 8 }).map((_, colIndex) => (
                    <td key={colIndex}>
                      <p className="placeholder-glow">
                        <span className="placeholder col-12 bg-secondary"></span>
                      </p>
                    </td>
                  ))}
                </tr>
              ))
            ) : filteredUsers?.length > 0 ? (
              filteredUsers?.map((readiness, index) => (
                <tr key={readiness?.id || index}>
                  <th scope="row">
                    {(pageIndex?.meta?.current_page - 1) *
                      pageIndex?.meta?.per_page +
                      index +
                      1}
                  </th>
                  <td
                    dangerouslySetInnerHTML={{
                      __html: highlightText(readiness?.type || "", searchVal),
                    }}
                  />
                  <td
                    dangerouslySetInnerHTML={{
                      __html: highlightText(
                        readiness?.category || "",
                        searchVal
                      ),
                    }}
                  />
                  <td
                    dangerouslySetInnerHTML={{
                      __html: highlightText(
                        readiness?.question || "",
                        searchVal
                      ),
                    }}
                  />
                  <td
                    style={{
                      maxWidth: COLUMN_WIDTH,
                      wordWrap: "break-word",
                      overflowWrap: "break-word",
                      whiteSpace: "normal",
                      verticalAlign: "top",
                    }}
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: expandedDescriptions[readiness?.id || index]
                          ? highlightText(
                              readiness?.description || "",
                              searchVal
                            )
                          : truncateText(
                              highlightText(
                                readiness?.description || "",
                                searchVal
                              ),
                              DESCRIPTION_MAX_LENGTH
                            ),
                      }}
                    />
                    {readiness?.description?.length >
                      DESCRIPTION_MAX_LENGTH && (
                      <button
                        className="btn btn-link p-0 mt-1 text-decoration-none"
                        onClick={() =>
                          toggleDescription(readiness?.id || index)
                        }
                        style={{ fontSize: "0.8rem" }}
                      >
                        {expandedDescriptions[readiness?.id || index]
                          ? "View Less"
                          : "View More"}
                      </button>
                    )}
                  </td>
                  <td>{readiness?.yes_score}</td>
                  <td>{readiness?.no_score}</td>
                  <td>
                    <div className="users-crud d-flex">
                      <EditQuestions
                        data={type}
                        category={category}
                        question={readiness}
                        GetQuestions={GetQuestions}
                      />
                      <ConfirmationModel
                        type={"readiness"}
                        readinessData={readiness}
                        GetQuestions={GetQuestions}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center">
                  No Users Available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="d-flex flex-row bd-highlight mb-3">
        <div className="bd-highlight pagennation-list">
          <LimitSelector
            onLimitChange={handleLimitChange}
            filteredLength={filteredLength}
          />
        </div>
        <div className="p-2 bd-highlight w-100">
          <Pagination
            dataFetchFunction={GetQuestions}
            dataPaginationLinks={pageIndex?.meta}
            filteredLength={filteredLength}
            search={searchVal}
            sort_by={sortColumn}
            sort_direction={sortDirection}
            limit={limit}
          />
        </div>
      </div>
    </>
  );
};

export default ReadinessView;
