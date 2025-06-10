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

  const getUserOrg = async (URI = `user-organizations?id=${userId}`) => {
    try {
      setIsLoading(true);
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

  return (
    <>
      <div className="d-flex justify-content-between mb-3">
        <h5>
          {user_name} Organizations{" "}
          {data.length > 0 && (
            <span className="badge user-active text-white ">{data.length}</span>
          )}
        </h5>
        {isSuperAdmin && (
          <div className="d-flex">
            <Searchbar onSearch={handleSearch} placeHolder={"Search"} />
            <AssignOrganizationModel userId={userId} getUserOrg={getUserOrg} />
          </div>
        )}
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
                className="text-center"
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
              <th scope="col" className="text-center">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="tablescrolling-tbody">
            {isLoading ? (
              // Array.from({ length: 7 }).map((_, rowIndex) => (
              //   <tr key={rowIndex}>
              //     {Array.from({ length: 5 }).map((_, colIndex) => (
              //       <td key={colIndex}>
              //         <p className="placeholder-glow">
              //           <span className="placeholder col-12 bg-secondary"></span>
              //         </p>
              //       </td>
              //     ))}
              //   </tr>
              // ))
              <Loader rows={7} cols={5} />
            ) : filteredUsers?.length > 0 ? (
              filteredUsers?.map((org, index) => (
                <tr key={index}>
                  <th scope="row">
                    {(pageIndex?.meta?.current_page - 1) *
                      pageIndex?.meta?.per_page +
                      index +
                      1}
                  </th>
                  <td
                    dangerouslySetInnerHTML={{
                      __html: highlightText(org?.name || "", searchVal),
                    }}
                  ></td>
                  <td
                    dangerouslySetInnerHTML={{
                      __html: highlightText(org?.email || "", searchVal),
                    }}
                  ></td>
                  <td
                    className="Capitalize text-center"
                    dangerouslySetInnerHTML={{
                      __html: highlightText(
                        ucFirst(org?.role?.replace(/_/g, " ") || ""),
                        searchVal
                      ),
                    }}
                  ></td>
                  <td className="table-td-center">
                    <ConfirmationModel
                      type={"UserOrganization"}
                      data={data}
                      userId={userId}
                      orgId={org}
                      getUserOrg={getUserOrg}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  No data found.
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
