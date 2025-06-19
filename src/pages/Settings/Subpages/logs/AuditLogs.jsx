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
import usePreserveQueryParams from "../../../../Hooks/UsePreserveQueryParams";
import useQueryFilters from "../../../../Hooks/UseQueryFilters";
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
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import TanstackTable from "../../../../components/DataTable/TanstackTable"

const AuditLogs = () => {
  usePageTitle("Audit Logs");
  const [isLoading, setIsLoading] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [organizations, SetOrganizations] = useState([]);
  const [users, SetUsers] = useState([]);
  const [vendors, SetVendors] = useState([]);
  const [filteredLength, setFilteredLength] = useState([]);
  const [pageIndex, setPageIndex] = useState([]);
  const [dateRange, setDateRange] = useState([new Date(), new Date()]);
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
      console.error("Error fetching organizations:", error);
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
      fetchLogs(newFilters);
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
      const newFilters = { ...filters, user_id: user, vendor_id: null };
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
      vendor_id: selectedOption ? selectedOption.value : null,
      user_id: null,
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
        ? "#bcf7c6"
        : state.isFocused
        ? "#bcf7c6"
        : provided.backgroundColor,
      color: state.isSelected ? "block" : "inherit",
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
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
        accessorKey: "model_name",
        header: "Entity",
        cell: ({ getValue }) => getValue(),
      },
      {
        accessorKey: "user.email",
        header: "Email",
        cell: ({ getValue }) => getValue(),
      },
      {
        accessorKey: "message",
        header: "Message",
        cell: ({ getValue }) => (
          <p className="logs-message">{getValue()}</p>
        ),
      },
      {
        accessorKey: "browser_os",
        header: "IP Address, Browser & OS",
        cell: ({ row }) => (
          <BrowserAndOS
            ipAddress={row.original.ip_address}
            browser={row.original.browser}
            browserVersion={row.original.browser_version}
            os={row.original.os}
            osVersion={row.original.os_version}
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: "created_at",
        header: "Created At",
        cell: ({ getValue }) => <FormattedDateTime isoString={getValue()} />,
      },
      {
        accessorKey: "event",
        header: "Event",
        cell: ({ getValue }) => (
          <span className={getEventBadgeClass(getValue())}>
            {getValue()?.toUpperCase()}
          </span>
        ),
      },
      {
        accessorKey: "action",
        header: "Action",
        cell: ({ row }) => (
          <Button
            variant="btn btn-sm"
            style={{
              backgroundColor: "#37c6501a",
              border: "1px solid #37c650",
            }}
            onClick={() => {
              setLogDetails(row.original);
              setShow(true);
            }}
          >
            <FaEye color="#37c650" />
          </Button>
        ),
        enableSorting: false,
      },
    ],
    [pageIndex]
  );

  const table = useReactTable({
    data: filteredUsers || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  return (
    <>
      <div className="mb-3 d-flex">
        <div>
          <h5 className="text-wrap-mode">
            {filteredUsers?.length === 1 ? "Audit Log" : "Audit Logs"}
            {filteredUsers?.length > 0 && (
              <Badge className="user-active text-white m-2">
                {pageIndex?.meta?.total}
              </Badge>
            )}
          </h5>
        </div>
        <div className="row width-fill justify-content-end">
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

      <TanstackTable
        table={table}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No Users Available"
        className="table users-table mb-0"
      />

      <div>
        <div className="d-flex flex-row bd-highlight mb-3">
          <div className="bd-highlight pagennation-list">
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