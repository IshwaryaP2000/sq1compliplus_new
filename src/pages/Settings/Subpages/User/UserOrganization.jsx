import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { BiUpArrowAlt, BiDownArrowAlt } from "react-icons/bi";
import { getApi } from "../../../../services/apiService";
import usePageTitle from "../../../../utils/usePageTitle";
import Pagination from "../../../../components/Pagination/Pagination";
import Searchbar from "../../../../components/Search/Searchbar";
import ConfirmationModel from "../../../../components/Modal/UserConfirmationModal";
import AssignOrganizationModel from "../../../../components/Modal/AssignOrganizationModel";
import { getCurrentUser, ucFirst } from "../../../../utils/UtilsGlobalData";
import {
  createDebouncedSearch,
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

function UserOrganization() {
  usePageTitle("User-Organizations");
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { id: userId } = useParams();
  const [user_name, setUserName] = useState("");
  const currentUser = getCurrentUser();
  const isSuperAdmin = currentUser?.user_role === "sq1_super_admin";
  const [searchVal, setSearchVal] = useState("");
  const [sortColumn, setSortColumn] = useState("Name");
  const [sortDirection, setSortDirection] = useState("desc");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [limit, setLimit] = useState(10);
  const [filteredLength, setFilteredLength] = useState([]);
  const [pageIndex, setPageIndex] = useState([]);

  const getUserOrg = async (params = { id: userId }) => {
    try {
      setIsLoading(true);
      const query = new URLSearchParams(params).toString();
      const URI = `user-organizations?${query}`;
      const response = await getApi(URI);
      setUserName(response.data.data.user_name);
      setData(response?.data?.data?.data);
      setFilteredUsers(response?.data?.data?.data);
      setFilteredLength(response?.data?.data?.meta?.total);
      setPageIndex(response?.data?.data);
    } catch (err) {
      console.error("Error fetching user organizations:", err);
      setIsLoading(false);
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
      id: userId,
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
      id: userId,
    });
  };

  const debouncedFetchSearchResults = useMemo(
    () =>
      createDebouncedSearch((params) => {
        getUserOrg(params);
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
      id: userId,
    });
  };

  useEffect(() => {
    getUserOrg();
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
        accessorKey: "name",
        header: () => (
          <div
            onClick={() => handleSort("name")}
            className="header-cell"
            style={{ cursor: "pointer" }}
          >
            Organization Name
            <span
              style={{
                color: "rgba(48, 188, 71)",
                fontSize: "20px",
              }}
            >
              {sortDirection === "asc" && sortColumn === "name" ? (
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
        accessorKey: "email",
        header: () => (
          <div
            onClick={() => handleSort("email")}
            className="header-cell"
            style={{ cursor: "pointer" }}
          >
            Email
            <span
              style={{
                color: "rgba(48, 188, 71)",
                fontSize: "20px",
              }}
            >
              {sortDirection === "asc" && sortColumn === "email" ? (
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
        accessorKey: "role",
        header: () => (
          <div
            onClick={() => handleSort("role")}
            className="header-cell text-center"
            style={{ cursor: "pointer" }}
          >
            Role
            <span
              style={{
                color: "rgba(48, 188, 71)",
                fontSize: "20px",
              }}
            >
              {sortDirection === "asc" && sortColumn === "role" ? (
                <BiUpArrowAlt />
              ) : (
                <BiDownArrowAlt />
              )}
            </span>
          </div>
        ),
        cell: ({ getValue }) => (
          <span
            className="Capitalize text-center"
            dangerouslySetInnerHTML={{
              __html: highlightText(
                ucFirst(getValue()?.replace(/_/g, " ") || ""),
                searchVal
              ),
            }}
          />
        ),
      },
      {
        accessorKey: "action",
        header: () => <div className="text-center">Action</div>,
        cell: ({ row }) => (
          <div className="table-td-center">
            <ConfirmationModel
              type={"UserOrganization"}
              data={data}
              userId={userId}
              orgId={row.original}
              getUserOrg={getUserOrg}
            />
          </div>
        ),
        enableSorting: false,
      },
    ],
    [searchVal, sortColumn, sortDirection, pageIndex, data, userId]
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
      <div className="d-flex justify-content-between mb-3">
        <h5>
          {user_name} Organizations
          {data.length > 0 && (
            <span className="badge user-active text-white">{data.length}</span>
          )}
        </h5>
        {isSuperAdmin && (
          <div className="d-flex">
            <Searchbar onSearch={handleSearch} placeHolder={"Search"} />
            <AssignOrganizationModel userId={userId} getUserOrg={getUserOrg} />
          </div>
        )}
      </div>
      <TanstackTable
        table={table}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No data found."
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
            dataFetchFunction={getUserOrg}
            filteredLength={filteredLength}
            id={userId}
            dataPaginationLinks={pageIndex?.meta}
            search={searchVal}
            sort_by={sortColumn}
            sort_direction={sortDirection}
            limit={limit}
          />
        </div>
      </div>
    </>
  );
}

export default UserOrganization;