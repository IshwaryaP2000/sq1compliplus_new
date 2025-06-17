import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { BiUpArrowAlt, BiDownArrowAlt } from "react-icons/bi";
import { getApi } from "../../../../services/apiService";
import Pagination from "../../../../components/Pagination/Pagination";
import Searchbar from "../../../../components/Search/Searchbar";
import {
  createDebouncedSearch,
  fetchSearchResults,
  highlightText,
  LimitSelector,
} from "../../../../components/Search/useSearchAndSort";
import { PlusIcon } from "../../../../components/Icons/Icons";
import { Loader } from "../../../../components/Table/Loader";

const Questions = () => {
  const navigate = useNavigate();
  const [data, setData] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [sortColumn, setSortColumn] = useState("assessment_type");
  const [sortDirection, setSortDirection] = useState("desc");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [limit, setLimit] = useState(10);
  const [filteredLength, setFilteredLength] = useState([]);
  const [pageIndex, setPageIndex] = useState([]);

  const GetQuestions = async (URI = "/vendor/list-questions") => {
    try {
      setIsLoading(true);
      const response = await getApi(URI);
      setData(response?.data?.data);
      setFilteredUsers(response?.data?.data?.data);
      setFilteredLength(response?.data?.data?.meta?.total);
      setPageIndex(response?.data?.data);
    } catch (err) {
      console.error("Error fetching questions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    GetQuestions();
  }, []);

  const debouncedFetchSearchResults = useMemo(
    () =>
      createDebouncedSearch((params) => {
        fetchSearchResults(
          "/vendor/list-questions",
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

    const newSortColumn = columnName;
    setSortDirection(newSortDirection);
    setSortColumn(newSortColumn);

    debouncedFetchSearchResults({
      search: searchVal,
      sort_by: newSortColumn,
      sort_direction: newSortDirection,
      limit: limit,
    });
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    debouncedFetchSearchResults({
      search: searchVal,
      sort_by: sortColumn || "",
      sort_direction: sortDirection,
      limit: newLimit,
    });
  };

  return (
    <div>
      <div className="d-flex justify-content-between mb-3 flex-wrap">
        <h5 className="mb-0 d-flex align-items-end">
          Questions
          {data?.meta?.total !== 0 ? (
            <span className="badge user-active text-white ms-1">
              {data?.meta?.total}
            </span>
          ) : (
            ""
          )}
        </h5>
        <div className="d-flex">
          <Searchbar onSearch={handleSearch} placeHolder={"Search"} />
          <button
            onClick={() => navigate("/settings/upload-question")}
            className="btn primary-btn mx-1 ms-2"
          >
            Bulk Upload
            <i className="fa-solid fa-upload ms-2"></i>
          </button>
          <button
            onClick={() => navigate("/settings/add-questions")}
            className="btn primary-btn mx-1"
          >
            <PlusIcon />
            Add Question
          </button>
        </div>
      </div>
      <div>
        <div className="custom-table tabledata-scroll mb-3">
          <table className=" table users-table mb-0">
            <thead className="tablescrolling-thead-tr">
              <tr>
                <th scope="col">#</th>
                <th
                  scope="col"
                  onClick={() => {
                    handleSort("assessment_type_id");
                  }}
                >
                  Assessment Type
                  <span
                    style={{
                      color: "rgba(48, 188, 71)",
                      cursor: "pointer",
                      fontSize: "20px",
                    }}
                  >
                    {sortDirection === "asc" &&
                    sortColumn === "assessment_type_id" ? (
                      <BiUpArrowAlt />
                    ) : (
                      <BiDownArrowAlt />
                    )}
                  </span>
                </th>
                <th
                  scope="col"
                  onClick={() => {
                    handleSort("controls");
                  }}
                >
                  Question
                  <span
                    style={{
                      color: "rgba(48, 188, 71)",
                      cursor: "pointer",
                      fontSize: "20px",
                    }}
                  >
                    {sortDirection === "asc" && sortColumn === "controls" ? (
                      <BiUpArrowAlt />
                    ) : (
                      <BiDownArrowAlt />
                    )}
                  </span>
                </th>
                <th scope="col" className="text-center">
                  Risk Score Yes
                </th>
                <th scope="col" className="text-center">
                  Risk Score No
                </th>
                <th
                  scope="col"
                  className=""
                  onClick={() => {
                    handleSort("evidence_required");
                  }}
                >
                  Attachment Required
                  <span
                    style={{
                      color: "rgba(48, 188, 71)",
                      cursor: "pointer",
                      fontSize: "20px",
                    }}
                  >
                    {sortDirection === "asc" &&
                    sortColumn === "evidence_required" ? (
                      <BiUpArrowAlt />
                    ) : (
                      <BiDownArrowAlt />
                    )}
                  </span>
                </th>
                <th
                  scope="col"
                  className="text-center"
                  onClick={() => {
                    handleSort("data_access");
                  }}
                >
                  Data Access
                  <span
                    style={{
                      color: "rgba(48, 188, 71)",
                      cursor: "pointer",
                      fontSize: "20px",
                    }}
                  >
                    {sortDirection === "asc" && sortColumn === "data_access" ? (
                      <BiUpArrowAlt />
                    ) : (
                      <BiDownArrowAlt />
                    )}
                  </span>
                </th>
              </tr>
            </thead>

            <tbody className="tablescrolling-tbody">
              {isLoading ? (
                // Array.from({ length: 7 }).map((_, rowIndex) => (
                //   <tr key={rowIndex}>
                //     {Array.from({ length: 7 }).map((_, colIndex) => (
                //       <td key={colIndex}>
                //         <p className="placeholder-glow">
                //           <span className="placeholder col-12 bg-secondary"></span>
                //         </p>
                //       </td>
                //     ))}
                //   </tr>
                // ))
                <Loader rows={7} cols={7} />
              ) : filteredUsers?.length > 0 ? (
                filteredUsers?.map((questions, index) => (
                  <tr key={questions?.id || index}>
                    <th scope="row">
                      {(pageIndex?.meta?.current_page - 1) *
                        pageIndex?.meta?.per_page +
                        index +
                        1}
                    </th>
                    <td
                      dangerouslySetInnerHTML={{
                        __html: highlightText(
                          questions?.assessment_type || "",
                          searchVal
                        ),
                      }}
                    ></td>
                    <td
                      className="text-wrap-td td-width-250"
                      dangerouslySetInnerHTML={{
                        __html: highlightText(
                          questions?.controls || "",
                          searchVal
                        ),
                      }}
                    ></td>
                    <td className="text-center">
                      <span className="badge user-active text-white">
                        {questions?.risk_score_yes}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="badge user-active text-white">
                        {questions?.risk_score_no}
                      </span>
                    </td>

                    <td
                      className=" Capitalize"
                      dangerouslySetInnerHTML={{
                        __html: highlightText(
                          (questions?.evidence_required || "").replace(
                            /_/g,
                            " "
                          ), // Replace underscores with spaces
                          searchVal
                        ),
                      }}
                    ></td>
                    <td className="text-center">
                      <span
                        className={`badge badge-fixedwidth ${
                          questions?.data_access === "Low"
                            ? " user-active"
                            : questions?.data_access === "High"
                            ? "bg-danger"
                            : "bg-secondary"
                        }`}
                        dangerouslySetInnerHTML={{
                          __html: highlightText(
                            questions?.data_access || "",
                            searchVal
                          ),
                        }}
                      ></span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">
                    No Data Available...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
      </div>
    </div>
  );
};

export default Questions;
