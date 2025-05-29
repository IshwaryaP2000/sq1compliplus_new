import { useEffect, useState } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import usePageTitle from "../../../utils/usePageTitle";
import { getApi } from "../../../services/apiService";
import {
  getBrowserIcon,
  getBrowserVersion,
  getOSIcon,
  getOSVersion,
} from "../../../utils/BrowserUtils";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Badge, Button } from "react-bootstrap";

const ActivityLogs = () => {
  usePageTitle("Activity Logs");
  const [activityLog, setActivityLog] = useState();
  const [dateRange, setDateRange] = useState([null, null]);

  const [startDate, endDate] = dateRange;

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
      zIndex: 9999, // Ensure dropdown appears above other element
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
    const res = await getApi(`organization/activity-logs`);
    setActivityLog(res?.data?.data?.logs?.data);
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

  return (
    <>
      <div className="d-flex  mb-3 width-fill justify-content-end">
        <h5 className="text-wrap-mode">
          {activityLog?.length === 1 ? "Activity Log" : "Activity Logs"}
          {activityLog?.length > 0 && (
            <span className="badge user-active text-white m-2">
              {activityLog?.length}
            </span>
          )}
        </h5>
     
        <div className=" row width-fill justify-content-end">
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

      <div>
        <div className="tabledata-scroll mb-3">
          <table className="table users-table mb-0">
            <thead className="tablescrolling-thead-tr">
              <tr>
                <th scope="col">#</th>
                <th scope="col">Email</th>
                <th scope="col">Type</th>
                <th scope="col">Page</th>
                <th scope="col">Duration</th>
                <th scope="col">Entered At</th>
                <th scope="col">Left At</th>
                <th scope="col">IP Address, Browser & OS</th>
              </tr>
            </thead>

            <tbody className="tablescrolling-tbody">
              {activityLog &&
                activityLog.map((data, index) => (
                  <tr key={index}>
                    <th scope="row">1</th>
                    <td>{data?.userable?.email}</td>
                    <td>{data?.userable_type}</td>
                    <td>
                      <Button
                        className="btn btn-sm fw-bold"
                        style={{
                          backgroundColor: "#37c6501a",
                          border: "1px solid #37c650",
                          color: "black",
                        }}
                      >
                        {data?.page}
                      </Button>
                    </td>
                    <td>{data?.duration_human}</td>
                    <td>{data?.entered_at}</td>
                    <td>{data?.left_at}</td>
                    <td>
                      <BrowserAndOS
                        ipAddress={data.ip_address}
                        browser={data.browser}
                        browserVersion={data.browser_version}
                        os={data.os}
                        osVersion={data.os_version}
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default ActivityLogs;
