import { useState, useEffect, useMemo, useRef } from "react";
import { getApi } from "../../../../services/apiService";
import { Link } from "react-router-dom";
import usePageTitle from "../../../../utils/usePageTitle";
import Pagination from "../../../../components/Pagination/Pagination";
import Searchbar from "../../../../components/Search/Searchbar";
import ConfirmationModel from "../../../../components/Modal/UserConfirmationModal";
import UserEditModel from "../../../../components/Modal/UserEditModal";
import UserInviteModel from "../../../../components/Modal/UserInviteModal";
import MfaUnlockModel from "../../../../components/Modal/MfaUnlockModel";
import { getCurrentUser, ucFirst } from "../../../../utils/UtilsGlobalData";
import { BiUpArrowAlt, BiDownArrowAlt } from "react-icons/bi";
import { Badge } from "../../../../components/Badge/Badge";
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

const User = () => {
  const menuRef = useRef();
  usePageTitle("Users");

  const [allUsers, setAllUsers] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [sortColumn, setSortColumn] = useState("name");
  const [sortDirection, setSortDirection] = useState("desc");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredLength, setFilteredLength] = useState(0);
  const [limit, setLimit] = useState(10);
  const [pageIndex, setPageIndex] = useState([]);
  const currentUser = getCurrentUser();
  const authuser = JSON.parse(localStorage.getItem("authUser"));
  const canInviteUser = !["sq1_user", "user"].includes(currentUser?.user_role);
  const canAccessOrganizations = ["sq1_super_admin", "sq1_admin"].includes(
    currentUser?.user_role
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchAllUser = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const URI = `user-list?${query}`;
    try {
      setIsLoading(true);
      const response = await getApi(URI);
      setAllUsers(response?.data?.data);
      setFilteredUsers(response?.data?.data?.data || []);
      setFilteredLength(response?.data?.data?.meta?.total || 0);
      setPageIndex(response?.data?.data || []);
    } catch (error) {
      console.error("Error fetching users", error);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserRole = async () => {
    try {
      const response = await getApi("get-roles");
      const roles = response?.data?.data?.map((role) => role.name) || [];
      setUserRoles(roles);
    } catch (error) {
      console.error("Error fetching roles", error);
    }
  };

  useEffect(() => {
    fetchAllUser();
    fetchUserRole();
  }, []);

  const debouncedFetchSearchResults = useMemo(
    () =>
      createDebouncedSearch((params) => {
        fetchAllUser(params);
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
        accessorKey: "name",
        header: () => (
          <div
            onClick={() => {
              setSortColumn("name");
              setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
              debouncedFetchSearchResults({
                search: searchVal,
                sort_by: "name",
                sort_direction: sortDirection === "asc" ? "desc" : "asc",
                limit: limit,
              });
            }}
            className="header-cell"
          >
            Name
            <span className="sort-icon">
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
            onClick={() => {
              setSortColumn("email");
              setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
              debouncedFetchSearchResults({
                search: searchVal,
                sort_by: "email",
                sort_direction: sortDirection === "asc" ? "desc" : "asc",
                limit: limit,
              });
            }}
            className="header-cell"
          >
            Email
            <span className="sort-icon">
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
            onClick={() => {
              setSortColumn("role");
              setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
              debouncedFetchSearchResults({
                search: searchVal,
                sort_by: "role",
                sort_direction: sortDirection === "asc" ? "desc" : "asc",
                limit: limit,
              });
            }}
            className="header-cell"
          >
            Role
            <span className="sort-icon">
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
            className="Capitalize"
            dangerouslySetInnerHTML={{
              __html: highlightText(
                getValue()?.replace(/_/g, " ") || "",
                searchVal
              ),
            }}
          />
        ),
      },
      ...(currentUser?.user_role !== "admin" &&
      currentUser?.user_role !== "user"
        ? [
            {
              accessorKey: "organization_count",
              header: "Organization",
              cell: ({ getValue, row }) =>
                canAccessOrganizations ? (
                  <Link
                    to={`/settings/user-organization/${row.original.id}`}
                    className="badge user-active text-white text-decoration-none"
                  >
                    {getValue()}
                  </Link>
                ) : (
                  <span className="badge user-active text-white text-decoration-none">
                    {getValue()}
                  </span>
                ),
              enableSorting: false,
            },
          ]
        : []),
      {
        accessorKey: "status",
        header: () => <div className="text-center">Status</div>,
        cell: ({ getValue }) => (
          <span
            className={`badge badge-fixedwidth ${
              getValue() === "active"
                ? "user-active"
                : getValue() === "invited"
                ? "user-invit"
                : "bg-secondary"
            }`}
          >
            {ucFirst(getValue()?.replace(/_/g, " ") || "")}
          </span>
        ),
        enableSorting: false,
      },
      ...(authuser?.user_role !== "sq1_user"
        ? [
            {
              accessorKey: "actions",
              header: () => <div className="text-center">Action</div>,
              cell: ({ row }) =>
                row.original.level != 1 &&
                authuser?.email != row.original.email ? (
                  <div className="users-crud d-flex justify-content-center">
                    <UserEditModel
                      data={row.original}
                      fetchAllUser={fetchAllUser}
                      userRolesGet={userRoles}
                    />
                    <ConfirmationModel
                      type={"User"}
                      data={row.original}
                      fetchAllUser={fetchAllUser}
                    />
                    <MfaUnlockModel data={row.original} />
                  </div>
                ) : (
                  <div className="table-td-center"></div>
                ),
              enableSorting: false,
            },
          ]
        : []),
    ],
    [
      searchVal,
      sortColumn,
      sortDirection,
      pageIndex,
      canAccessOrganizations,
      authuser,
      userRoles,
      limit,
    ]
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
        <h5>
          {allUsers?.data?.length === 1 ? "User" : "Users"}
          {allUsers?.data?.length > 0 && (
            <Badge className="badge user-active text-white" marginClass="ms-1">
              {allUsers?.meta?.total || 0}
            </Badge>
          )}
        </h5>
        <div className="d-flex">
          <Searchbar onSearch={handleSearch} placeHolder={"Search"} />
          {canInviteUser && (
            <UserInviteModel data={userRoles} fetchAllUser={fetchAllUser} />
          )}
        </div>
      </div>
      <TanstackTable
        table={table}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No Users Available"
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
            dataFetchFunction={fetchAllUser}
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

export default User;