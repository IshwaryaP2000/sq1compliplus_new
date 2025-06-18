import { useEffect, useState, useMemo } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Badge, Button } from "react-bootstrap";
import usePageTitle from "../../../../utils/usePageTitle";
import { getApi } from "../../../../services/apiService";
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
import TanstackTable from "../../../../components/DataTable/TanstackTable";

const ActivityLogs = () => {
  usePageTitle("Activity Logs");
  const [activityLog, setActivityLog] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [isLoading, setIsLoading] = useState(false);

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

  const selectOrganization = [
    { value: "chocolate", label: "Chocolate" },
    { value: "strawberry", label: "Strawberry" },
    { value: "vanilla", label: "Vanilla" },
  ];
  const selectUsers = [
    { value: "chocolate", label: "Chocolate" },
    { value: "strawberry", label: "Strawberry" },
    { value: "vanilla", label: "Vanilla" },
  ];

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const res = await getApi(`organization/activity-logs`);
      setActivityLog(res?.data?.data?.logs?.data || []);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

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

  const columns = useMemo(
    () => [
      {
        accessorKey: "index",
        header: "#",
        cell: ({ row }) => row.index + 1,
        enableSorting: false,
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => row.original?.userable?.email || "",
        enableSorting: false,
      },
      {
        accessorKey: "userable_type",
        header: "Type",
        cell: ({ getValue }) => getValue() || "",
        enableSorting: false,
      },
      {
        accessorKey: "page",
        header: "Page",
        cell: ({ getValue }) => (
          <Button
            className="btn btn-sm fw-bold"
            style={{
              backgroundColor: "#37c6501a",
              border: "1px solid #37c650",
              color: "black",
            }}
          >
            {getValue() || ""}
          </Button>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "duration_human",
        header: "Duration",
        cell: ({ getValue }) => getValue() || "",
        enableSorting: false,
      },
      {
        accessorKey: "entered_at",
        header: "Entered At",
        cell: ({ getValue }) => getValue() || "",
        enableSorting: false,
      },
      {
        accessorKey: "left_at",
        header: "Left At",
        cell: ({ getValue }) => getValue() || "",
        enableSorting: false,
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
    ],
    []
  );

  const table = useReactTable({
    data: activityLog || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <div className="d-flex mb-3 width-fill justify-content-end">
        <h5 className="text-wrap-mode">
          {activityLog?.length === 1 ? "Activity Log" : "Activity Logs"}
          {activityLog?.length > 0 && (
            <span className="badge user-active text-white m-2">
              {activityLog?.length}
            </span>
          )}
        </h5>

        <div className="row width-fill justify-content-end">
          <div className="col-md-3">
            <Select
              options={selectOrganization}
              styles={customStyles}
              menuPlacement="auto"
              placeholder="Select Organization"
            />
          </div>
          <div className="col-md-3">
            <Select
              options={selectUsers}
              styles={customStyles}
              menuPlacement="auto"
              placeholder="Select User"
            />
          </div>
          <div className="col-md-3">
            <DatePicker
              selected={startDate}
              onChange={(update) => setDateRange(update)}
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
        </div>
      </div>

      <TanstackTable
        table={table}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No activity logs available"
        className="table users-table mb-0"
      />
    </>
  );
};

export default ActivityLogs;