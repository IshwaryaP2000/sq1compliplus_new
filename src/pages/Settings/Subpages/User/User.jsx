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
import {
  createDebouncedSearch,
  highlightText,
  LimitSelector,
} from "../../../../components/Search/useSearchAndSort";
import { Badge } from "../../../../components/Badge/Badge";
import { Loader } from "../../../../components/Table/Loader";

const User = () => {
  const menuRef = useRef();
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  usePageTitle("Users");
  const [allUsers, setAllUsers] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [sortColumn, setSortColumn] = useState("name");
  const [sortDirection, setSortDirection] = useState("desc");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredLength, setFilteredLength] = useState([]);
  const [limit, setLimit] = useState(10);
  const [pageIndex, setPageIndex] = useState([]);
  const currentUser = getCurrentUser();
  const authuser = JSON.parse(localStorage.getItem("authUser"));

  const fetchAllUser = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const URI = `user-list?${query}`;    
    try {
      setIsLoading(true);
      const response = await getApi(URI);
      setAllUsers(response?.data?.data);
      setFilteredUsers(response?.data?.data?.data); //filtered searchlist
      setFilteredLength(response?.data?.data?.meta?.total); //get total length for limit and pagination
      setPageIndex(response?.data?.data); //state for get meta links and total
    } catch (error) {
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
    } catch (error) {}
  };

  useEffect(() => {
    fetchAllUser();
  }, []);
  useEffect(() => {
    fetchUserRole();
  }, []);

  const canInviteUser = !["sq1_user", "user"].includes(currentUser?.user_role);
  const canAccessOrganizations = ["sq1_super_admin", "sq1_admin"].includes(
    currentUser?.user_role
  );

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div>
      <div className="d-flex justify-content-between mb-3 flex-wrap">
        <h5>
          {allUsers?.data?.length === 1 ? "User" : "Users"}
          {allUsers?.data?.length > 0 && (
            <Badge className="badge user-active text-white" marginClass="ms-1">
              {allUsers?.meta?.total ?? 0}
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
      <div>
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
                <th
                  scope="col"
                  onClick={() => {
                    handleSort("role");
                  }}
                >
                  Role
                  <span
                    style={{
                      color: "rgba(48, 188, 71)",
                      cursor: "pointer",
                      fontSize: "20px",
                    }}
                  >
                    {sortDirection === "asc" && sortColumn === "role" ? (
                      <BiUpArrowAlt />
                    ) : (
                      <BiDownArrowAlt />
                    )}
                  </span>
                </th>
                {currentUser?.user_role !== "admin" &&
                currentUser?.user_role !== "user" ? (
                  <th scope="col">Organization</th>
                ) : (
                  ""
                )}

                <th scope="col" className="text-center">
                  Status
                </th>

                {authuser?.user_role !== "sq1_user" ? (
                  <th scope="col" className="text-center">
                    Action
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody className="tablescrolling-tbody">
              {isLoading ? (
                // Array.from({ length: 6 }).map((_, rowIndex) => (
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
                <Loader rows={6} cols={7} />
              ) : filteredUsers?.length > 0 ? (
                filteredUsers?.map((users, index) => (
                  <tr key={users?.id || index}>
                    <th scope="row">
                      {(pageIndex?.meta?.current_page - 1) *
                        pageIndex?.meta?.per_page +
                        index +
                        1}
                    </th>
                    <td
                      dangerouslySetInnerHTML={{
                        __html: highlightText(users?.name || "", searchVal),
                      }}
                    ></td>
                    <td
                      dangerouslySetInnerHTML={{
                        __html: highlightText(users?.email || "", searchVal),
                      }}
                    ></td>
                    <td
                      className="Capitalize"
                      dangerouslySetInnerHTML={{
                        __html: highlightText(
                          users?.role.replace(/_/g, " "),
                          searchVal
                        ),
                      }}
                    ></td>
                    {currentUser?.user_role !== "admin" &&
                    currentUser?.user_role !== "user" ? (
                      <td>
                        {canAccessOrganizations ? (
                          <Link
                            to={`/settings/user-organization/${users?.id}`}
                            className="badge user-active text-white text-decoration-none"
                          >
                            {users?.organization_count}
                          </Link>
                        ) : (
                          <span className="badge user-active text-white text-decoration-none">
                            {users?.organization_count}
                          </span>
                        )}
                      </td>
                    ) : (
                      ""
                    )}
                    <td className="text-center">
                      <span
                        className={`badge badge-fixedwidth ${
                          users.status === "active"
                            ? " user-active"
                            : users.status === "invited"
                            ? " user-invit"
                            : "bg-secondary"
                        }`}
                      >
                        {ucFirst(users?.status.replace(/_/g, " ") || "")}
                      </span>
                    </td>
                    {authuser?.user_role !== "sq1_user" ? (
                      <>
                        {users?.level != 1 && authuser?.email != users.email ? (
                          <td className="table-td-center">
                            <div className="users-crud d-flex">
                              <UserEditModel
                                data={users}
                                fetchAllUser={fetchAllUser}
                                userRolesGet={userRoles}
                              />
                              <ConfirmationModel
                                type={"User"}
                                data={users}
                                fetchAllUser={fetchAllUser}
                              />
                              <MfaUnlockModel data={users} />
                            </div>
                          </td>
                        ) : (
                          <td className="table-td-center"></td>
                        )}
                      </>
                    ) : null}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">
                    No Users Available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
