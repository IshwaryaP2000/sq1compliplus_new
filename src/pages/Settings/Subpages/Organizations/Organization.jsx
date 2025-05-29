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
import {
  createDebouncedSearch,
  fetchSearchResults,
  highlightText,
  LimitSelector,
} from "../../../../components/Search/useSearchAndSort";
import { BiUpArrowAlt, BiDownArrowAlt } from "react-icons/bi";
import OrganizationDelete from "../../../../components/Modal/OrganizationDelete";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Loader } from "../../../../components/Table/Loader";
import { EyeIcon } from "../../../../components/Icons/Icons";

const Organization = () => {
  usePageTitle("Organizations");

  const [isLoading, setIsLoading] = useState(false);
  const [count, setTotalCount] = useState([]);
  const [complianceTypes, setComplianceTypes] = useState([]); // New state for compliance types
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [sortColumn, setSortColumn] = useState("name");
  const [sortDirection, setSortDirection] = useState("desc");
  const [searchVal, setSearchVal] = useState("");
  const [limit, setLimit] = useState(10);
  const [filteredLength, setFilteredLength] = useState([]);
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
      setTotalCount(response?.data?.data?.meta?.total);
      setFilteredUsers(response?.data?.data?.data);
      setFilteredLength(response?.data?.data?.meta?.total);
      setPageIndex(response?.data?.data);
    } catch (err) {
      console.error("Error in fetchAllOrganizations:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch compliance types once when the component mounts
  const fetchComplianceTypes = async () => {
    try {
      const response = await getApi("compliance-types");
      setComplianceTypes(response.data.data || []);
    } catch (err) {
      console.error("Error fetching compliance types:", err);
    }
  };

  useEffect(() => {
    fetchAllOrganizations();
    fetchComplianceTypes(); // Fetch compliance types once
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
        // fetchSearchResults(
        //   "/user-organizations-list",
        //   params,
        //   setFilteredUsers,
        //   setIsLoading,
        //   setFilteredLength,
        //   setPageIndex
        // );
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

      <div className="tabledata-scroll mb-3">
        <table className="table users-table mb-0">
          <thead className="tablescrolling-thead-tr">
            <tr>
              <th scope="col">#</th>
              <th
                scope="col"
                onClick={() => {
                  handleSort("name");
                }}
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
              </th>
              <th
                scope="col"
                onClick={() => {
                  handleSort("domain_name");
                }}
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
              <th
                scope="col"
                onClick={() => {
                  handleSort("users_count");
                }}
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
              </th>
              <th scope="col" className="text-center">
                Status
              </th>
              <th scope="col" className="text-center">
                Action
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
              filteredUsers?.map((organization, index) => (
                <tr key={organization?.id || index}>
                  <th scope="row">
                    {(pageIndex?.meta?.current_page - 1) *
                      pageIndex?.meta?.per_page +
                      index +
                      1}
                  </th>
                  <td
                    dangerouslySetInnerHTML={{
                      __html: highlightText(
                        organization?.name || "",
                        searchVal
                      ),
                    }}
                  ></td>
                  <td
                    dangerouslySetInnerHTML={{
                      __html: highlightText(
                        organization?.domain_name || "",
                        searchVal
                      ),
                    }}
                  ></td>
                  <td
                    dangerouslySetInnerHTML={{
                      __html: highlightText(
                        organization?.email || "",
                        searchVal
                      ),
                    }}
                  ></td>
                  <td>
                    {canAccessUsers ? (
                      <button
                        className="badge user-active text-white"
                        onClick={() => handleUsersClick(organization?.id)}
                      >
                        {organization?.users_count || 0}
                      </button>
                    ) : (
                      <span className="badge bg-secondary text-white">
                        {organization?.users_count || 0}
                      </span>
                    )}
                  </td>
                  <td className="text-center">
                    <span
                      className={`badge badge-fixedwidth ${
                        organization.status === "active"
                          ? " user-active"
                          : organization.status === "invited"
                          ? " user-invit"
                          : "bg-secondary"
                      }`}
                    >
                      {ucFirst(organization?.status?.replace(/_/g, " ") || "")}
                    </span>
                  </td>
                  <td className="table-td-center">
                    <div className="users-crud d-flex">
                      <OrganizationEditModal
                        fetchAllOrganizations={fetchAllOrganizations}
                        organization={organization}
                      />
                      <OrganizationConfirmationModal
                        data={organization}
                        fetchAllOrganizations={fetchAllOrganizations}
                      />
                      <OrganizationMfaUnlockModal
                        data={organization}
                        organizationId={organization.id}
                      />
                      <AssignReadinessQuestionModal
                        organization={organization}
                        complianceTypes={complianceTypes}
                      />
                      <OrganizationDelete
                        dataId={organization.id}
                        title={title}
                        data={organization}
                        fetchAllOrganizations={fetchAllOrganizations}
                      />
                      <OverlayTrigger
                        overlay={
                          <Tooltip id="tooltip-disabled">view Answer</Tooltip>
                        }
                      >
                        <button
                          className="btn btn-sm py-0 my-1 tableborder-right"
                          onClick={() => handleShow(organization?.id)}
                        >
                          <EyeIcon />
                        </button>
                      </OverlayTrigger>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
                  No organizations found.
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
