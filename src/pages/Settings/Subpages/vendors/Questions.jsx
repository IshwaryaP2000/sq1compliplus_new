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

import { PlusIcon, UploadIcon } from "../../../../components/Icons/Icons";
import { Loader } from "../../../../components/Table/Loader";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import TanstackTable from "../../../../components/DataTable/TanstackTable";


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

  const columns = useMemo(
    () => [
      {
        accessorKey: "index",
        header: "#",
        cell: ({ row }) =>
          (pageIndex?.meta?.current_page - 1) * pageIndex?.meta?.per_page +
          row.index +
          1,
        enableSorting: false,
      },
      {
        accessorKey: "assessment_type",
        header: () => (
          <div
            onClick={() => handleSort("assessment_type_id")}
            className="header-cell"
            style={{ cursor: "pointer" }}
          >
            Assessment Type
            <span
              style={{
                color: "rgba(48, 188, 71)",
                fontSize: "20px",
              }}
            >
              {sortDirection === "asc" && sortColumn === "assessment_type_id" ? (
                <BiUpArrowAlt />
              ) : (
                <BiDownArrowAlt />
              )}
            </span>
          </div>
        ),
        cell: ({ getValue }) => (
          <span
            dangerouslySetInnerHTML={{
              __html: highlightText(getValue() || "", searchVal),
            }}
          />
        ),
      },
      {
        accessorKey: "controls",
        header: () => (
          <div
            onClick={() => handleSort("controls")}
            className="header-cell"
            style={{ cursor: "pointer" }}
          >
            Question
            <span
              style={{
                color: "rgba(48, 188, 71)",
                fontSize: "20px",
              }}
            >
              {sortDirection === "asc" && sortColumn === "controls" ? (
                <BiUpArrowAlt />
              ) : (
                <BiDownArrowAlt />
              )}
            </span>
          </div>
        ),
        cell: ({ getValue }) => (
          <span
            className="text-wrap-td td-width-250"
            dangerouslySetInnerHTML={{
              __html: highlightText(getValue() || "", searchVal),
            }}
          />
        ),
      },
      {
        accessorKey: "risk_score_yes",
        header: () => <div className="text-center">Risk Score Yes</div>,
        cell: ({ getValue }) => (
          <span className="badge user-active text-white text-center">
            {getValue()}
          </span>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "risk_score_no",
        header: () => <div className="text-center">Risk Score No</div>,
        cell: ({ getValue }) => (
          <span className="badge user-active text-white text-center">
            {getValue()}
          </span>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "evidence_required",
        header: () => (
          <div
            onClick={() => handleSort("evidence_required")}
            className="header-cell"
            style={{ cursor: "pointer" }}
          >
            Attachment Required
            <span
              style={{
                color: "rgba(48, 188, 71)",
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
          </div>
        ),
        cell: ({ getValue }) => (
          <span
            className="Capitalize"
            dangerouslySetInnerHTML={{
              __html: highlightText(
                (getValue() || "").replace(/_/g, " "),
                searchVal
              ),
            }}
          />
        ),
      },
      {
        accessorKey: "data_access",
        header: () => (
          <div
            onClick={() => handleSort("data_access")}
            className="header-cell text-center"
            style={{ cursor: "pointer" }}
          >
            Data Access
            <span
              style={{
                color: "rgba(48, 188, 71)",
                fontSize: "20px",
              }}
            >
              {sortDirection === "asc" && sortColumn === "data_access" ? (
                <BiUpArrowAlt />
              ) : (
                <BiDownArrowAlt />
              )}
            </span>
          </div>
        ),
        cell: ({ getValue }) => (
          <span
            className={`badge badge-fixedwidth text-center ${
              getValue() === "Low"
                ? "user-active"
                : getValue() === "High"
                ? "bg-danger"
                : "bg-secondary"
            }`}
            dangerouslySetInnerHTML={{
              __html: highlightText(getValue() || "", searchVal),
            }}
          />
        ),
      },
    ],
    [searchVal, sortColumn, sortDirection, pageIndex]
  );

  const table = useReactTable({
    data: filteredUsers || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting: true,
    manualPagination: true,
    state: {
      sorting: [
        {
          id: sortColumn,
          desc: sortDirection === "desc",
        },
      ],
    },
  });

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
            <UploadIcon className="ms-2" />
          </button>
          <button
            onClick={() => navigate("/settings/add-questions")}
            className="btn primary-btn mx-1"
          >
            <PlusIcon className="me-2" />
            Add Question
          </button>
        </div>
      </div>
      <TanstackTable
        table={table}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No Data Available..."
        className="table users-table mb-0"
      />
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
    </div>
  );
};

export default Questions;