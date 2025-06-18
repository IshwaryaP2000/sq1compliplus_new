import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Button from "react-bootstrap/Button";
import { BiUpArrowAlt, BiDownArrowAlt } from "react-icons/bi";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { getApi, postApi } from "../../../../services/apiService";
import { ucFirst } from "../../../../utils/UtilsGlobalData";
import Pagination from "../../../../components/Pagination/Pagination";
import AssignUserModal from "../../../../components/Modal/AssignUsermodal";
import EditRoleModal from "../../../../components/Modal/EditRoleModal";
import { getCurrentUser } from "../../../../utils/UtilsGlobalData";
import Searchbar from "../../../../components/Search/Searchbar";
import usePageTitle from "../../../../utils/usePageTitle";
import {
  PenToSquareIcon,
  PlusIcon,
  TriangleExclamationIcon,
  XmarkIcon,
} from "../../../../components/Icons/Icons";
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
import DeleteModal from "../../../../components/Modal/DeleteModal";

const NewUser = () => {
  usePageTitle("Organization Users");
  const { id: organizationId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState("new_user");
  const [email, setEmail] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [existingUsers, setExistingUsers] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [setIsSuccessModalOpen] = useState(false);
  const [setIsErrorModalOpen] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [userError, setUserError] = useState("");
  const [roleError, setRoleError] = useState("");
  const [orgName, setOrgName] = useState("");
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedUserForRole, setSelectedUserForRole] = useState(null);
  const [organizationRoles, setOrganizationRoles] = useState([]);
  const [searchVal, setSearchVal] = useState("");
  const [sortColumn, setSortColumn] = useState("name");
  const [sortDirection, setSortDirection] = useState("desc");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredLength, setFilteredLength] = useState([]);
  const [limit, setLimit] = useState(10);
  const [pageIndex, setPageIndex] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [showAssignUserModal, setShowAssignUserModal] = useState(false);
  const currentUser = getCurrentUser();
  const isSuperAdmin = currentUser?.user_role === "sq1_super_admin";
  const roles = ["Admin", "User"];
  const toggleAssignUserModal = () =>
    setShowAssignUserModal(!showAssignUserModal);

  const formatRole = (role) => {
    if (!role) return "";
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const openRoleModal = async (user) => {
    try {
      const response = await getApi(
        `get-organization-roles?id=${organizationId}`
      );
      setOrganizationRoles(
        response?.data?.map((role) => ({
          id: role.id,
          name: role.name,
          description: role.description,
        })) || []
      );
      setSelectedUserForRole(user);
      setSelectedRole(user.role);
      setIsRoleModalOpen(true);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedUserForRole || selectedUserForRole.role === selectedRole) {
      return;
    }
    const roleId = organizationRoles.find(
      (role) => role.name === selectedRole
    )?.id;
    if (!roleId) {
      console.error("Invalid role selected. Role ID not found.");
      return;
    }
    const payload = {
      org_id: organizationId,
      user_id: selectedUserForRole.id,
      role_id: roleId,
    };

    try {
      const response = await postApi("update-role", payload);
      if (response?.status === 200 && response?.data?.success) {
        fetchUsers();
        setIsRoleModalOpen(false);
      } else {
        console.error("Failed to update role:", response?.data?.message);
        alert(response?.data?.message || "Failed to update role.");
      }
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  const fetchUsers = async (
    params = { id: organizationId }
  ) => {
    try {
      setIsLoading(true);
      const query = new URLSearchParams(params).toString();
      const URI = `organization-users?${query}`;
      const response = await getApi(URI);
      setOrgName(response?.data?.data);
      setFilteredUsers(response?.data?.data?.data);
      setFilteredLength(response?.data?.data?.meta?.total);
      setPageIndex(response?.data?.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExistingUsers = async () => {
    try {
      const response = await getApi("get-assign-users");
      setExistingUsers(response?.data?.data || []);
    } catch (error) {
      console.error("Error fetching existing users:", error);
    }
  };

  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async () => {
    setEmailError("");
    setUserError("");
    setRoleError("");

    if (!selectedRole) {
      setRoleError("Role is required.");
      return;
    }

    if (userType === "new_user" && !email) {
      setEmailError("Email is required for new users.");
      return;
    }

    if (userType === "existing_user" && !selectedUser) {
      setUserError("Please select an existing user.");
      return;
    }

    const payload = {
      org_id: organizationId,
      role: selectedRole.toLowerCase(),
      user_type: userType,
      email: userType === "new_user" ? email : selectedUser,
    };

    try {
      const response = await postApi("assign-user", payload);
      if (response?.status === 200 && response?.data?.success) {
        if (response.data.message === "User already assigned") {
          setIsErrorModalOpen(true);
        } else {
          setIsSuccessModalOpen(true);
          fetchUsers();
          toggleAssignUserModal();
        }
      }
    } catch (error) {
      console.error("Error assigning user:", error);
    }
  };

  const handleRemoveUser = async () => {
    try {
      const payload = {
        id: userToDelete?.id,
        org_id: organizationId,
        type: "user",
      };

      const response = await postApi("user-delete", payload);
      if (response?.status === 200) {
        setIsDeleteModalOpen(false);
        fetchUsers();
      } else {
        alert("Failed to remove user. Please try again.");
      }
    } catch (error) {
      console.error("Error removing user:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [organizationId]);

  useEffect(() => {
    fetchExistingUsers();
  }, []);

  const debouncedFetchSearchResults = useMemo(
    () =>
      createDebouncedSearch((params) => {
        fetchUsers(params);
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
      id: organizationId,
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
      id: organizationId,
    });
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    debouncedFetchSearchResults({
      search: searchVal,
      sort_by: sortColumn || "",
      sort_direction: sortDirection,
      limit: newLimit,
      id: organizationId,
    });
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "index",
        header: "S.No",
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
            Name
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
        header: "Role",
        cell: ({ row }) => (
          <div className="d-flex">
            <OverlayTrigger
              overlay={<Tooltip id="tooltip-disabled">Edit</Tooltip>}
            >
              <div className="users-crud me-2">
                <button
                  type="button"
                  className="btn btn-sm py-0 my-1"
                  onClick={() => openRoleModal(row.original)}
                  title="Edit Role"
                >
                  <PenToSquareIcon />
                </button>
              </div>
            </OverlayTrigger>
            {formatRole(row.original.role)}
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "status",
        header: "Status",
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
            {ucFirst(getValue())}
          </span>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "action",
        header: "Action",
        cell: ({ row }) => (
          <OverlayTrigger
            overlay={<Tooltip id="tooltip-disabled">Remove</Tooltip>}
          >
            <div className="users-crud">
              <button
                className="btn btn-sm py-0 my-1"
                onClick={() => openDeleteModal(row.original)}
              >
                <XmarkIcon className="text-danger" />
              </button>
            </div>
          </OverlayTrigger>
        ),
        enableSorting: false,
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
    <div className="d-flex flex-column">
      <div className="d-flex justify-content-between mb-3 flex-wrap">
        <h5>
          {orgName?.organization_name}
          <span className="badge user-active text-white ms-2">
            {orgName?.meta?.total}
          </span>
        </h5>
        {isSuperAdmin && (
          <div className="d-flex">
            <Searchbar onSearch={handleSearch} placeHolder={"Search"} />
            <button
              className="ms-2 primary-btn btn btn-sm"
              onClick={toggleAssignUserModal}
            >
              <PlusIcon className="me-2" />
              Assign User
            </button>
            <AssignUserModal
              show={showAssignUserModal}
              handleClose={toggleAssignUserModal}
              userType={userType}
              handleUserTypeChange={(e) => setUserType(e.target.value)}
              email={email}
              setEmail={setEmail}
              emailError={emailError}
              existingUsers={existingUsers}
              selectedUser={selectedUser}
              setSelectedUser={setSelectedUser}
              userError={userError}
              selectedRole={selectedRole}
              setSelectedRole={setSelectedRole}
              roleError={roleError}
              roles={roles}
              handleFormSubmit={handleFormSubmit}
            />
          </div>
        )}
      </div>
      <TanstackTable
        table={table}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No users found."
        className="table users-table mb-0"
      />
      <EditRoleModal
        show={isRoleModalOpen}
        handleClose={() => setIsRoleModalOpen(false)}
        selectedRole={selectedRole}
        handleRoleChange={(e) => setSelectedRole(e.target.value)}
        organizationRoles={organizationRoles}
        handleUpdateRole={handleUpdateRole}
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
            dataFetchFunction={fetchUsers}
            filteredLength={filteredLength}
            id={organizationId}
            dataPaginationLinks={pageIndex?.meta}
            search={searchVal}
            sort_by={sortColumn}
            sort_direction={sortDirection}
            limit={limit}
          />
        </div>
      </div>
      {isDeleteModalOpen && (
        <div
          className="modal fade show"
          id="delete"
          tabIndex="-1"
          aria-labelledby="deleteModalLabel"
          aria-hidden="true"
          style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-md">
            <div className="modal-content p-3">
              <DeleteModal msg="user" />
              <div className="d-flex justify-content-center mb-3 gap-4">
                <Button
                  type="button"
                  className="bg-light border-1 text-dark px-4"
                  style={{ borderColor: "#cccc" }}
                  data-bs-dismiss="modal"
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  No, Keep it
                </Button>
                <Button
                  type="button"
                  className="btn btn-danger"
                  data-bs-dismiss="modal"
                  onClick={handleRemoveUser}
                >
                  Remove
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewUser;