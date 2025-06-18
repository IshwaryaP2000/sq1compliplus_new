import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BiUpArrowAlt, BiDownArrowAlt } from "react-icons/bi";
import { getApi } from "../../../../services/apiService";
import ConfirmationModel from "../../../../components/Modal/UserConfirmationModal";
import EditQuestions from "../../../../components/Modal/EditQuestions";
import Pagination from "../../../../components/Pagination/Pagination";
import Searchbar from "../../../../components/Search/Searchbar";
import usePageTitle from "../../../../utils/usePageTitle";
import { PlusIcon } from "../../../../components/Icons/Icons";
import {
  createDebouncedSearch,
  fetchSearchResults,
  highlightText,
  LimitSelector,
} from "../../../../components/Search/useSearchAndSort";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import TanstackTable from "../../../../components/DataTable/TanstackTable";

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
  const [filteredLength, setFilteredLength] = useState(0);
  const [pageIndex, setPageIndex] = useState([]);

  const GetQuestions = async (URI = "get-questions") => {
    try {
      setIsLoading(true);
      const response = await getApi(URI);
      setData(response?.data?.data);
      setFilteredUsers(response?.data?.data?.data || []);
      setFilteredLength(response?.data?.data?.meta?.total || 0);
      setPageIndex(response?.data?.data || []);
    } catch (err) {
      console.error("error getting a data", err);
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
    } catch (error) {
      console.error("error getting types", error);
    }
  };

  const GetCategory = async () => {
    try {
      const response = await getApi("compliance-category");
      setCategory(response?.data || []);
    } catch (error) {
      console.error("error getting category", error);
    }
  };

  useEffect(() => {
    GetQuestions();
    GetTypes();
    GetCategory();
  }, []);

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
        accessorKey: "type",
        header: () => (
          <div
            onClick={() => {
              const newSortDirection =
                sortColumn === "type"
                  ? sortDirection === "asc"
                    ? "desc"
                    : "asc"
                  : "asc";
              setSortColumn("type");
              setSortDirection(newSortDirection);
              debouncedFetchSearchResults({
                search: searchVal,
                sort_by: "type",
                sort_direction: newSortDirection,
                limit: limit,
              });
            }}
            className="header-cell"
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
        accessorKey: "category",
        header: () => (
          <div
            onClick={() => {
              const newSortDirection =
                sortColumn === "category"
                  ? sortDirection === "asc"
                    ? "desc"
                    : "asc"
                  : "asc";
              setSortColumn("category");
              setSortDirection(newSortDirection);
              debouncedFetchSearchResults({
                search: searchVal,
                sort_by: "category",
                sort_direction: newSortDirection,
                limit: limit,
              });
            }}
            className="header-cell"
          >
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
        accessorKey: "question",
        header: () => (
          <div
            onClick={() => {
              const newSortDirection =
                sortColumn === "question"
                  ? sortDirection === "asc"
                    ? "desc"
                    : "asc"
                  : "asc";
              setSortColumn("question");
              setSortDirection(newSortDirection);
              debouncedFetchSearchResults({
                search: searchVal,
                sort_by: "question",
                sort_direction: newSortDirection,
                limit: limit,
              });
            }}
            className="header-cell"
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
        accessorKey: "actions",
        header: "Action",
        cell: ({ row }) => (
          <div className="users-crud d-flex">
            <EditQuestions
              data={type}
              category={category}
              question={row.original}
            />
            <ConfirmationModel
              type={"readiness"}
              readinessData={row.original}
              GetQuestions={GetQuestions}
            />
          </div>
        ),
        enableSorting: false,
      },
    ],
    [searchVal, sortColumn, sortDirection, pageIndex, type, category, limit]
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
              <PlusIcon className="me-2" />
              Add Controls
            </button>
          </Link>
        </div>
      </div>
      <TanstackTable
        table={table}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No Users Available"
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
    </>
  );
};

export default Controls;