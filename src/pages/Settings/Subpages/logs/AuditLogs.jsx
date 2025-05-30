import { useEffect, useState, useMemo } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Button from "react-bootstrap/Button";
import { FaEye } from "react-icons/fa";
import { getApi, postApi } from "../../../../services/apiService";
import FormattedDateTime from "../../../../utils/FormattedDateTime";
import { Icon } from "@iconify/react/dist/iconify.js";
import Badge from "react-bootstrap/Badge";
import AuditLogModal from "../../../../components/Modal/AuditLogModal";
import usePageTitle from "../../../../utils/usePageTitle";
import moment from "moment/moment";
import Pagination from "../../../../components/Pagination/Pagination";
import usePreserveQueryParams from "../../../../hooks/UsePreserveQueryParams";
import useQueryFilters from "../../../../hooks/UseQueryFilters";
import {
  LimitSelector,
  createDebouncedSearch,
  fetchSearchResults,
} from "../../../../components/Search/useSearchAndSort";
import {
  getBrowserIcon,
  getBrowserVersion,
  getOSIcon,
  getOSVersion,
} from "../../../../utils/BrowserUtils";

const AuditLogs = () => {
  usePageTitle("Audit Logs");
  const [isLoading, setIsLoading] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [organizations, SetOrganizations] = useState([]);
  const [users, SetUsers] = useState([]);
  const [vendors, SetVendors] = useState([]);
  const [filteredLength, setFilteredLength] = useState([]);
  const [pageIndex, setPageIndex] = useState([]);
  const [dateRange, setDateRange] = useState([new Date(), new Date()]); // set currect datee
  const [startDate, endDate] = dateRange;
  const [show, setShow] = useState(false);
  const [logDetails, setLogDetails] = useState(null);
  const [limit, setLimit] = useState(10);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const authuser = JSON.parse(localStorage.getItem("authUser"));
  const [filters, setFilters] = useQueryFilters([
    "org_id",
    "user_id",
    "vendor_id",
    "from_date",
    "to_date",
  ]);

  usePreserveQueryParams([
    "from_date",
    "to_date",
    "org_id",
    "user_id",
    "vendor_id",
  ]);

  const handleClose = () => {
    setShow(false);
    setLogDetails(null);
  };

  useEffect(() => {
    getOrganizationList();
  }, []);

  useEffect(() => {
    if (filters.from_date && filters.to_date) {
      const from = new Date(filters.from_date);
      const to = new Date(filters.to_date);
      setDateRange([from, to]);
    }
    fetchLogs(filters);
  }, [filters]);

  useEffect(() => {
    if (organizations.length > 0 && filters.org_id) {
      const matchedOrg = organizations.find(
        (org) => org.value == filters.org_id
      );
      if (matchedOrg) {
        setSelectedOrg(matchedOrg);
        fetchOrgUsers(matchedOrg);
      }
    }
  }, [organizations, filters.org_id]);

  const getOrganizationList = async (URI = "organization/list") => {
    try {
      setIsLoading(true);
      const response = await getApi(URI);
      const selectOrganization = response?.data?.data.map((org) => ({
        value: org.id,
        label: org.name,
      }));
      SetOrganizations(selectOrganization);
    } catch (error) {
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (update) => {
    setDateRange(update);
    const [start, end] = update;

    const newFilters = {
      ...filters,
      from_date: start ? moment(start).format("YYYY-MM-DD") : null,
      to_date: end ? moment(end).format("YYYY-MM-DD") : null,
    };

    setFilters(newFilters);

    if (start && end) {
      fetchLogs(newFilters); // Only fetch when both dates are selected
    }
  };

  const fetchOrgUsers = async (selectedOption) => {
    const org_id = selectedOption.value;
    setSelectedOrg(selectedOption);
    const response = await postApi("organization/users-list", { org_id });
    const users = response?.data?.data?.users.map((u) => ({
      value: u.id,
      label: u.email,
    }));
    const vendors = response?.data?.data?.vendors.map((v) => ({
      value: v.id,
      label: v.email,
    }));
    SetUsers(users);
    SetVendors(vendors);
    const newFilters = { ...filters, org_id };
    setFilters(newFilters);
    fetchLogs(newFilters);
  };

  const filterUsers = (selectedOption) => {
    setSelectedUser(selectedOption);

    if (selectedOption) {
      const user = selectedOption.value;
      const newFilters = { ...filters, user_id: user, vendor_id: null }; // Clear vendor if needed
      setFilters(newFilters);
      fetchLogs(newFilters);
    } else {
      const newFilters = { ...filters, user_id: null };
      setFilters(newFilters);
      fetchLogs(newFilters);
    }
  };

  const filterVendors = (selectedOption) => {
    const newFilters = {
      ...filters,
      vendor_id: selectedOption ? selectedOption.value : null, // Handle null/undefined selectedOption
      user_id: null, // Clear user_id when filtering by vendor
    };
    setSelectedVendor(selectedOption);
    setFilters(newFilters);

    fetchLogs(newFilters);
  };

  const buildQueryString = (params) =>
    Object.entries(params)
      .filter(([_, value]) => value)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");

  const fetchLogs = async (updatedFilters) => {
    const query = buildQueryString(updatedFilters);
    const logs = await getApi(`organization/audit-logs?${query}`);
    setFilteredUsers(logs?.data?.data?.data);
    setFilteredLength(logs?.data?.data?.meta?.total);
    setPageIndex(logs?.data?.data);
  };

  const customStyles = {
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#bcf7c6" // Selected option background
        : state.isFocused
        ? "#bcf7c6" // Hovered option background
        : provided.backgroundColor,
      color: state.isSelected ? "block" : "inherit",
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999, // Ensure dropdown appears above other elements
    }),
  };

  const BrowserAndOS = ({
    ipAddress,
    browser,
    browserVersion,
    os,
    osVersion,
  }) => {
    return (
      <div className="browser-os-info">
        <div className="browser-info">
          <div>
            <Icon
              icon="fluent-color:globe-shield-24"
              width="24"
              height="24"
              style={{ marginRight: "8px" }}
            />
            <Badge pill bg="info">
              {ipAddress}
            </Badge>
          </div>
        </div>

        <div className="browser-info">
          <div>
            <span style={{ marginRight: "8px" }}>
              {getBrowserIcon(browser)}
            </span>
            <span style={{ marginRight: "4px" }}>{browser}</span>
            {getBrowserVersion(browserVersion)}
          </div>
        </div>

        <div className="os-info">
          <div>
            <span style={{ marginRight: "8px" }}>{getOSIcon(os)}</span>
            <span style={{ marginRight: "4px" }}>{os}</span>
            {getOSVersion(osVersion)}
          </div>
        </div>
      </div>
    );
  };

  const getEventBadgeClass = (event) => {
    switch (event.toLowerCase()) {
      case "created":
        return "badge bg-success";
      case "updated":
        return "badge bg-warning text-dark";
      case "deleted":
        return "badge bg-danger";
      case "restored":
        return "badge bg-info text-dark";
      case "forced_deleted":
        return "badge bg-dark";
      default:
        return "badge bg-secondary";
    }
  };

  const resetFilters = () => {
    const clearedFilters = {
      org_id: null,
      user_id: null,
      vendor_id: null,
      from_date: null,
      to_date: null,
    };

    setFilters(clearedFilters);
    setDateRange([null, null]);
    SetUsers([]);
    SetVendors([]);
    setSelectedOrg(null);
    setSelectedUser(null);
    setSelectedVendor(null);
    fetchLogs(clearedFilters);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    debouncedFetchSearchResults({
      limit: newLimit,
    });
  };

  const debouncedFetchSearchResults = useMemo(
    () =>
      createDebouncedSearch((params) => {
        fetchSearchResults(
          "/organization/audit-logs",
          params,
          setFilteredUsers,
          setIsLoading,
          setFilteredLength,
          setPageIndex
        );
      }, 300),
    []
  );
  return (
    <>
      <div className=" mb-3  d-flex">
        <div>
          <h5 className="text-wrap-mode">
            {filteredUsers?.length === 1 ? "Audit Logs" : "Audits Logs"}
            {filteredUsers?.length > 0 && (
              <span className="badge user-active text-white m-2">
                {pageIndex?.meta?.total}
              </span>
            )}
          </h5>
        </div>
        <div className=" row width-fill justify-content-end">
          {authuser?.user_role === "sq1_super_admin" && (
            <div className="col-md-3">
              <Select
                options={organizations}
                styles={customStyles}
                menuPlacement="auto"
                placeholder="Select Organization"
                onChange={fetchOrgUsers}
                value={selectedOrg}
              />
            </div>
          )}

          {/* hide Select users when sq1_user login */}
          {authuser?.user_role !== "sq1_user" && (
            <div className="col-md-3">
              <Select
                options={users}
                styles={customStyles}
                menuPlacement="auto"
                placeholder="Select User"
                onChange={filterUsers}
                isClearable
                value={selectedUser}
              />
            </div>
          )}

          {/* hide Select vendors when sq1_user login */}
          {authuser?.user_role !== "sq1_user" && (
            <div className="col-md-3">
              <Select
                options={vendors}
                styles={customStyles}
                menuPlacement="auto"
                placeholder="Select Vendor"
                onChange={filterVendors}
                isClearable
                value={selectedVendor}
              />
            </div>
          )}

          <div className="col-md-3">
            <DatePicker
              selected={startDate}
              onChange={handleDateChange}
              startDate={startDate}
              endDate={endDate}
              selectsRange
              isClearable
              placeholderText="Select a date range"
              className="form-control"
              onKeyDown={(e) => {
                e.preventDefault();
              }}
            />
          </div>
          <div className="col-md-2">
            <Button
              className="w-100"
              variant="outline-secondary"
              onClick={resetFilters}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </div>

      <div>
        <div className="tabledata-scroll mb-3">
          <table className="table users-table mb-0">
            <thead className="tablescrolling-thead-tr">
              <tr>
                <th scope="col">#</th>
                <th scope="col">Entity</th>
                <th scope="col">Email</th>
                <th scope="col">Message</th>
                <th scope="col">IP Address, Browser & OS</th>
                <th scope="col">Created At</th>
                <th scope="col">Event</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody className="tablescrolling-tbody">
              {isLoading ? (
                // Array.from({ length: 6 }).map((_, rowIndex) => (
                //   <tr key={rowIndex}>
                //     {Array.from({ length: 8 }).map((_, colIndex) => (
                //       <td key={colIndex}>
                //         <p className="placeholder-glow">
                //           <span className="placeholder col-12 bg-secondary"></span>
                //         </p>
                //       </td>
                //     ))}
                //   </tr>
                // ))
                <Loader rows={6} cols={8} />
              ) : filteredUsers?.length > 0 ? (
                filteredUsers.map((data, index) => (
                  <tr key={index}>
                    <th scope="row">
                      {(pageIndex?.meta?.current_page - 1) *
                        pageIndex?.meta?.per_page +
                        index +
                        1}
                    </th>
                    <td>{data?.model_name}</td>
                    <td>{data?.user?.email}</td>
                    <td>
                      <p className="logs-message">{data?.message}</p>
                    </td>
                    <td>
                      <BrowserAndOS
                        ipAddress={data.ip_address}
                        browser={data.browser}
                        browserVersion={data.browser_version}
                        os={data.os}
                        osVersion={data.os_version}
                      />
                    </td>
                    <td>
                      <FormattedDateTime isoString={data?.created_at} />
                    </td>
                    <td>
                      <span className={getEventBadgeClass(data?.event)}>
                        {data?.event.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <Button
                        variant="btn btn-sm"
                        style={{
                          backgroundColor: "#37c6501a",
                          border: "1px solid #37c650",
                        }}
                        onClick={(e) => {
                          setLogDetails(data);
                          setShow(true);
                        }}
                      >
                        <FaEye color="#37c650" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center">
                    No Users Available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <div className="d-flex flex-row bd-highlight mb-3 ">
          <div className=" bd-highlight pagennation-list">
            <LimitSelector
              onLimitChange={handleLimitChange}
              filteredLength={filteredLength}
            />
          </div>
          <div className="p-2 bd-highlight w-100">
            <Pagination
              dataFetchFunction={fetchLogs}
              dataPaginationLinks={pageIndex?.meta}
              filteredLength={filteredLength}
              limit={limit}
            />
          </div>
        </div>
        <AuditLogModal
          show={show}
          handleClose={handleClose}
          logDetails={logDetails}
        />
      </div>
    </>
  );
};

export default AuditLogs;
