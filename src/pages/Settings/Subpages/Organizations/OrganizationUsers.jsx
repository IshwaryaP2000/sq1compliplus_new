import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Button from "react-bootstrap/Button";
import { BiUpArrowAlt, BiDownArrowAlt } from "react-icons/bi";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { getApi, postApi } from "../../api/apiClient";
import { ucFirst } from "../../utils/UtilsGlobalData";
import Pagination from "../../components/Pagination";
import AssignUserModal from "../../models/AssignUsermodal";
import EditRoleModal from "../../models/EditRoleModal";
import { getCurrentUser } from "../../utils/UtilsGlobalData";
import Searchbar from "../../components/Searchbar";
import usePageTitle from "../includes/usePageTitle";
import {
  PenToSquareIcon,
  PlusIcon,
  TriangleExclamationIcon,
} from "../../../../components/Icons/Icons";
import {
  createDebouncedSearch,
  fetchSearchResults,
  highlightText,
  LimitSelector,
} from "../../components/useSearchAndSort";

const NewUser = () => {
  usePageTitle("Organization Users");
  const { id: organizationId } = useParams(); // Get the organization ID from the route
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState("new_user");
  const [email, setEmail] = useState(""); // New user's email
  const [selectedUser, setSelectedUser] = useState(""); // Selected existing user
  const [existingUsers, setExistingUsers] = useState([]); // List of existing users
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null); // Stores the user being deleted
  const [setIsSuccessModalOpen] = useState(false); // Success modal state
  const [setIsErrorModalOpen] = useState(false); // Error modal state
  const [emailError, setEmailError] = useState(""); // Email error state for new users
  const [userError, setUserError] = useState(""); // User error state for existing users
  const [roleError, setRoleError] = useState(""); // Role error state
  const [orgName, setOrgName] = useState("");
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false); // Modal visibility state
  const [selectedUserForRole, setSelectedUserForRole] = useState(null); // User whose role is being edited
  const [organizationRoles, setOrganizationRoles] = useState([]); // Available roles from API
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
      setSelectedUserForRole(user); // Store the user whose role is being edited
      setSelectedRole(user.role); // Set the current role of the user being edited
      setIsRoleModalOpen(true); // Open the modal
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
    URI = `organization-users?id=${organizationId}`
  ) => {
    try {
      setIsLoading(true);
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
    // Reset error states before validation
    setEmailError("");
    setUserError("");
    setRoleError("");

    // Validation checks for required fields
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

    // Prepare payload for API call
    const payload = {
      org_id: organizationId,
      role: selectedRole.toLowerCase(),
      user_type: userType,
      email: userType === "new_user" ? email : selectedUser,
    };

    try {
      const response = await postApi("assign-user", payload);
      if (response?.status === 200 && response?.data?.success) {
        // Handle success response
        if (response.data.message === "User already assigned") {
          setIsErrorModalOpen(true);
        } else {
          setIsSuccessModalOpen(true);
          fetchUsers();
          toggleAssignUserModal();
        }
      } else {
        // Handle other error cases
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
    fetchExistingUsers(); // Fetch existing users when the component mounts
  }, []);

  const debouncedFetchSearchResults = useMemo(
    () =>
      createDebouncedSearch((params) => {
        fetchSearchResults(
          "/organization-users",
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
              <PlusIcon />
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
      <div className="tabledata-scroll mb-3">
        <table className="table users-table mb-0">
          <thead className="tablescrolling-thead-tr">
            <tr>
              <th scope="col">S.No</th>
              <th
                scope="col"
                onClick={() => {
                  handleSort("name");
                }}
              >
                Name
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
              </th>
              <th
                scope="col"
                onClick={() => {
                  handleSort("email");
                }}
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
              </th>
              <th scope="col">Role</th>
              <th scope="col">Status</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody className="tablescrolling-tbody">
            {isLoading ? (
              Array.from({ length: 7 }).map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {Array.from({ length: 6 }).map((_, colIndex) => (
                    <td key={colIndex}>
                      <p className="placeholder-glow">
                        <span className="placeholder col-12 bg-secondary"></span>
                      </p>
                    </td>
                  ))}
                </tr>
              ))
            ) : filteredUsers?.length > 0 ? (
              filteredUsers?.map((user, index) => (
                <tr key={index}>
                  <th scope="row">
                    {(pageIndex?.meta?.current_page - 1) *
                      pageIndex?.meta?.per_page +
                      index +
                      1}
                  </th>
                  <td
                    dangerouslySetInnerHTML={{
                      __html: highlightText(user?.name || "", searchVal),
                    }}
                  ></td>
                  <td
                    dangerouslySetInnerHTML={{
                      __html: highlightText(user?.email || "", searchVal),
                    }}
                  ></td>
                  <td className="d-flex ">
                    <OverlayTrigger
                      overlay={<Tooltip id="tooltip-disabled">Edit</Tooltip>}
                    >
                      <div className="users-crud me-2">
                        <button
                          type="button"
                          className="btn btn-sm py-0 my-1"
                          onClick={() => openRoleModal(user)}
                          title="Edit Role"
                        >
                          <PenToSquareIcon />
                        </button>
                      </div>
                    </OverlayTrigger>
                    {formatRole(user.role)}
                  </td>
                  <td>
                    <span
                      className={`badge badge-fixedwidth ${
                        user.status === "active"
                          ? " user-active"
                          : user.status === "invited"
                          ? " user-invit"
                          : "bg-secondary"
                      }`}
                    >
                      {ucFirst(user.status)}
                    </span>
                  </td>
                  <td>
                    <OverlayTrigger
                      overlay={<Tooltip id="tooltip-disabled">Remove</Tooltip>}
                    >
                      <div className="users-crud">
                        <button
                          className="btn btn-sm py-0 my-1"
                          onClick={() => openDeleteModal(user)}
                        >
                          <i className="fa-solid fa-xmark text-danger"></i>
                        </button>
                      </div>
                    </OverlayTrigger>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <EditRoleModal
          show={isRoleModalOpen}
          handleClose={() => setIsRoleModalOpen(false)}
          selectedRole={selectedRole}
          handleRoleChange={(e) => setSelectedRole(e.target.value)}
          organizationRoles={organizationRoles}
          handleUpdateRole={handleUpdateRole}
        />
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
              <div className="modal-body text-center">
                <div className="text-center">
                  <div className="mb-3">
                    <div className="warning-icon-wrapper">
                      <TriangleExclamationIcon />
                    </div>
                  </div>
                  <h5 className="fw-bold mb-2 text-muted">Discard the user?</h5>
                  <p className="mb-2">
                    You're going to
                    <span className="fw-bold">"Discard this" </span>
                    user?. Are you sure?
                  </p>
                </div>
              </div>
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
