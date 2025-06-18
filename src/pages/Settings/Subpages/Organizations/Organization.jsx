import { useEffect, useMemo, useState } from "react";
import { getApi } from "../../../../services/apiService";
import { useNavigate } from "react-router-dom";
import { ucFirst, getCurrentUser } from "../../../../utils/UtilsGlobalData";
import usePageTitle from "../../../../utils/usePageTitle";
import Pagination from "../../../../components/Pagination/Pagination";
import Searchbar from "../../../../components/Search/Searchbar";
import OrganizationInviteModal from "../../../../components/Modal/OrganizationInviteModal";
import OrganizationEditModal from "../../../../components/Modal/OrganizationEditModal";
import OrganizationConfirmationModal from "../../../../components/Modal/OrgnanizationConfirmationModal";
import OrganizationMfaUnlockModal from "../../../../components/Modal/OrganizationMfaUnlockModal";
import AssignReadinessQuestionModal from "../../../../components/Modal/AssignReadinessQuestionModal";
import { BiUpArrowAlt, BiDownArrowAlt } from "react-icons/bi";
import OrganizationDelete from "../../../../components/Modal/OrganizationDelete";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { EyeIcon } from "../../../../components/Icons/Icons";
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

const Organization = () => {
  usePageTitle("Organizations");
  const [isLoading, setIsLoading] = useState(false);
  const [count, setTotalCount] = useState(0);
  const [complianceTypes, setComplianceTypes] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [sortColumn, setSortColumn] = useState("name");
  const [sortDirection, setSortDirection] = useState("desc");
  const [searchVal, setSearchVal] = useState("");
  const [limit, setLimit] = useState(10);
  const [filteredLength, setFilteredLength] = useState(0);
  const [pageIndex, setPageIndex] = useState([]);
  const [title, setTitle] = useState("Organization");
  const currentUser = getCurrentUser();
  const navigate = useNavigate();

  const fetchAllOrganizations = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const URI = `user-organizations-list?${query}`;
    try {
      setIsLoading(true);
      const response = await getApi(URI);
      setTotalCount(response?.data?.data?.meta?.total || 0);
      setFilteredUsers(response?.data?.data?.data || []);
      setFilteredLength(response?.data?.data?.meta?.total || 0);
      setPageIndex(response?.data?.data || []);
    } catch (err) {
      console.error("Error in fetchAllOrganizations:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComplianceTypes = async () => {
    try {
      const response = await getApi("compliance-types");
      setComplianceTypes(response.data.data || []);
    } catch (err) {
      console.error("Error fetching compliance types:", err);
    }
  };
 

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);



  useEffect(() => {
    fetchAllOrganizations();
    fetchComplianceTypes();
  }, []);

  const canInviteOrganization = ![
    "sq1_admin",
    "sq1_user",
    "user",
    "admin",
  ].includes(currentUser?.user_role);

  const canAccessUsers = ["sq1_super_admin", "sq1_admin"].includes(
    currentUser?.user_role
  );

  const handleUsersClick = async (organizationId) => {
    try {
      setIsLoading(true);
      const response = await getApi(`organization-users?id=${organizationId}`);
      const usersData = response?.data || [];
      navigate(`/settings/organization/users/${organizationId}`, {
        state: { users: usersData },
      });
    } catch (err) {
      console.error("Error fetching users for organization:", err);
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
        fetchAllOrganizations(params);
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

  const handleShow = async (id) => {
    navigate(`/organizations/readiness/answers/${id}`);
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
              const newSortDirection =
                sortColumn === "name"
                  ? sortDirection === "asc"
                    ? "desc"
                    : "asc"
                  : "asc";
              setSortColumn("name");
              setSortDirection(newSortDirection);
              debouncedFetchSearchResults({
                search: searchVal,
                sort_by: "name",
                sort_direction: newSortDirection,
                limit: limit,
              });
            }}
            className="header-cell"
          >
            Organization Name
            <span
              style={{
                color: "rgba(48, 188, 71)",
                cursor: "pointer",
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
        accessorKey: "domain_name",
        header: () => (
          <div
            onClick={() => {
              const newSortDirection =
                sortColumn === "domain_name"
                  ? sortDirection === "asc"
                    ? "desc"
                    : "asc"
                  : "asc";
              setSortColumn("domain_name");
              setSortDirection(newSortDirection);
              debouncedFetchSearchResults({
                search: searchVal,
                sort_by: "domain_name",
                sort_direction: newSortDirection,
                limit: limit,
              });
            }}
            className="header-cell"
          >
            Domain
            <span
              style={{
                color: "rgba(48, 188, 71)",
                cursor: "pointer",
                fontSize: "20px",
              }}
            >
              {sortDirection === "asc" && sortColumn === "domain_name" ? (
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
              const newSortDirection =
                sortColumn === "email"
                  ? sortDirection === "asc"
                    ? "desc"
                    : "asc"
                  : "asc";
              setSortColumn("email");
              setSortDirection(newSortDirection);
              debouncedFetchSearchResults({
                search: searchVal,
                sort_by: "email",
                sort_direction: newSortDirection,
                limit: limit,
              });
            }}
            className="header-cell"
          >
            Email
            <span
              style={{
                color: "rgba(48, 188, 71)",
                cursor: "pointer",
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
        accessorKey: "users_count",
        header: () => (
          <div
            onClick={() => {
              const newSortDirection =
                sortColumn === "users_count"
                  ? sortDirection === "asc"
                    ? "desc"
                    : "asc"
                  : "asc";
              setSortColumn("users_count");
              setSortDirection(newSortDirection);
              debouncedFetchSearchResults({
                search: searchVal,
                sort_by: "users_count",
                sort_direction: newSortDirection,
                limit: limit,
              });
            }}
            className="header-cell"
          >
            Users
            <span
              style={{
                color: "rgba(48, 188, 71)",
                cursor: "pointer",
                fontSize: "20px",
              }}
            >
              {sortDirection === "asc" && sortColumn === "users_count" ? (
                <BiUpArrowAlt />
              ) : (
                <BiDownArrowAlt />
              )}
            </span>
          </div>
        ),
        cell: ({ getValue, row }) =>
          canAccessUsers ? (
            <button
              className="badge user-active text-white"
              onClick={() => handleUsersClick(row.original.id)}
            >
              {getValue() || 0}
            </button>
          ) : (
            <span className="badge bg-secondary text-white">
              {getValue() || 0}
            </span>
          ),
      },
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
      {
        accessorKey: "actions",
        header: () => <div className="text-center">Action</div>,
        cell: ({ row }) => (
          <div className="users-crud d-flex justify-content-center">
            <OrganizationEditModal
              fetchAllOrganizations={fetchAllOrganizations}
              organization={row.original}
            />
            <OrganizationConfirmationModal
              data={row.original}
              fetchAllOrganizations={fetchAllOrganizations}
            />
            <OrganizationMfaUnlockModal
              data={row.original}
              organizationId={row.original.id}
            />
            <AssignReadinessQuestionModal
              organization={row.original}
              complianceTypes={complianceTypes}
            />
            <OrganizationDelete
              dataId={row.original.id}
              title={title}
              data={row.original}
              fetchAllOrganizations={fetchAllOrganizations}
            />
            <OverlayTrigger
              overlay={<Tooltip id="tooltip-disabled">view Answer</Tooltip>}
            >
              <button
                className="btn btn-sm py-0 my-1 tableborder-right"
                onClick={() => handleShow(row.original.id)}
              >
                <EyeIcon />
              </button>
            </OverlayTrigger>
          </div>
        ),
        enableSorting: false,
      },
    ],
    [
      searchVal,
      sortColumn,
      sortDirection,
      pageIndex,
      canAccessUsers,
      complianceTypes,
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
    <>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
        <h5>
          Organizations
          {count > 0 && (
            <span className="badge user-active text-white m-1">{count}</span>
          )}
        </h5>
        <div className="d-flex">
          <Searchbar onSearch={handleSearch} placeHolder={"Search"} />
          {canInviteOrganization && (
            <OrganizationInviteModal
              fetchAllOrganizations={fetchAllOrganizations}
            />
          )}
        </div>
      </div>

      <TanstackTable
        table={table}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No organizations found."
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
            dataFetchFunction={fetchAllOrganizations}
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

export default Organization;