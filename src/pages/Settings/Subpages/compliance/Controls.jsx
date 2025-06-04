import { useMemo } from "react";
import { useState, useEffect } from "react";
import { getApi } from "../../../../services/apiService";
import ConfirmationModel from "../../../../components/Modal/UserConfirmationModal";
import { Link } from "react-router-dom";
import EditQuestions from "../../../../components/Modal/EditQuestions";
import Pagination from "../../../../components/Pagination/Pagination";
import Searchbar from "../../../../components/Search/Searchbar";
import {
  createDebouncedSearch,
  fetchSearchResults,
  highlightText,
  LimitSelector,
} from "../../../../components/Search/useSearchAndSort";
import { BiUpArrowAlt, BiDownArrowAlt } from "react-icons/bi";
import usePageTitle from "../../../../utils/usePageTitle";
import { PlusIcon } from "../../../../components/Icons/Icons";

const Controls = () => {
  usePageTitle("Controls");
  const [data, setData] = useState("");
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [sortColumn, setSortColumn] = useState("type");
  const [sortDirection, setSortDirection] = useState("desc");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [limit, setLimit] = useState(10);
  const [filteredLength, setFilteredLength] = useState([]);
  const [pageIndex, setPageIndex] = useState([]);

  const GetQuestions = async (URI = "get-questions") => {
    try {
      setIsLoading(true);
      const response = await getApi(URI);
      setData(response?.data?.data);
      setFilteredUsers(response?.data?.data?.data);
      setFilteredLength(response?.data?.data?.meta?.total);
      setPageIndex(response?.data?.data);
    } catch {
      console.error("error getting a data");
    } finally {
      setIsLoading(false);
    }
  };

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

  const GetTypes = async () => {
    try {
      const response = await getApi("compliance-types");
      setType(response?.data || []);
    } catch (error) { console.error("error getting types", error); }
  };

  const GetCategory = async () => {
    try {
      const response = await getApi("compliance-category");
      setCategory(response?.data || []);
    } catch (error) { console.error("error getting category", error); }
  };

  useEffect(() => {
    GetQuestions();
    GetTypes();
    GetCategory();
  }, []);

  return (
    <>
      <div className="d-flex justify-content-between mb-3 flex-wrap">
        <h5>
          Controls
          {data?.meta?.total > 0 && (
            <span className="badge user-active text-white ms-1">
              {data?.meta?.total}
            </span>
          )}
        </h5>
        <div className="d-flex">
          <Searchbar onSearch={handleSearch} placeHolder={"Search"} />
          <Link to={"/settings/add-question"}>
            <button type="button" className="btn primary-btn ms-2">
              <PlusIcon />
              Add Controls
            </button>
          </Link>
        </div>
      </div>
      <div className="tabledata-scroll mb-3">
        <table className="table users-table mb-0">
          <thead className="tablescrolling-thead-tr">
            <tr>
              <th scope="col">#</th>
              <th
                scope="col"
                onClick={() => {
                  handleSort("type");
                }}
              >
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
              <th
                scope="col"
                onClick={() => {
                  handleSort("category");
                }}
              >
                category
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
              <th
                scope="col"
                onClick={() => {
                  handleSort("question");
                }}
              >
                Controls
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
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody className="tablescrolling-tbody">
            {isLoading ? (
              Array.from({ length: 7 }).map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {Array.from({ length: 5 }).map((_, colIndex) => (
                    <td key={colIndex}>
                      <p className="placeholder-glow">
                        <span className="placeholder col-12 bg-secondary"></span>
                      </p>
                    </td>
                  ))}
                </tr>
              ))
            ) : // data?.data?.length > 0 ? (
              //   data?.data?.map((readiness, index) => (
              filteredUsers?.length > 0 ? (
                filteredUsers?.map((readiness, index) => (
                  <tr key={readiness?.id || index}>
                    {/* <th scope="row">{index + 1}</th> */}
                    {/* <td>{readiness?.type}</td>
                  <td>{readiness?.category}</td>
                  <td>{readiness?.question}</td> */}
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
                    ></td>
                    <td
                      dangerouslySetInnerHTML={{
                        __html: highlightText(
                          readiness?.category || "",
                          searchVal
                        ),
                      }}
                    ></td>
                    <td
                      dangerouslySetInnerHTML={{
                        __html: highlightText(
                          readiness?.question || "",
                          searchVal
                        ),
                      }}
                    ></td>
                    <td>
                      <div className="users-crud d-flex">
                        <EditQuestions
                          data={type}
                          category={category}
                          question={readiness}
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
      {/* <div className="float-end me-5 pe-3">
        <Pagination
          dataFetchFunction={GetQuestions}
          dataPaginationLinks={data?.meta}
        />
      </div> */}
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
            // dataPaginationLinks={data?.meta}
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

export default Controls;
