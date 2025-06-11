import React, { useEffect, useState } from "react";
import { getApi } from "../../api/apiClient";
import { Link } from "react-router-dom";

function Dashboard() {
  const [data, setData] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const GetDetail = async () => {
    try {
      setIsLoading(true);
      const response = await getApi("/vendor/get-questions");
      setData(response?.data?.data);
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    GetDetail();
  }, []);
  return (
    <>
      <div className="d-flex justify-content-between mb-3 flex-wrap">
        {/* <Searchbar /> */}
        <h5 className="fw-bold mb-0 ms-2 mt-3">Dashboard</h5>
      </div>
      <div className="custom-table tabledata-scroll mb-3">
        <table className="table users-table mb-0">
          <thead className="tablescrolling-thead-tr">
            <tr>
              <th scope="col">#</th>
              <th scope="col" className="text-center">
                Data Access Level
              </th>
              <th scope="col" className="text-center">
                Total Questions
              </th>
              <th scope="col" className="text-center">
                In Completed Questions
              </th>
              <th scope="col" className="text-center">
                Not Answered Questions
              </th>
              <th scope="col" className="text-center">
                Answered Questions
              </th>
              <th scope="col" className="text-center">
                Accept Questions
              </th>
              <th scope="col" className="text-center">
                Reset Questions
              </th>
              <th scope="col" className="text-center">
                NC Questions
              </th>
              {/* <th scope="col">Assigned On</th> */}
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
              <tr>
                <td colSpan="11" className="text-center">
                  Loading...
                </td>
              </tr>
            ) : data ? (
              <tr>
                <th scope="row">1</th>
                <td className="text-center">{data?.data_access}</td>
                <td className="text-center">{data?.question_count}</td>

                <td className="text-center">
                  {data?.incomplete_question_count}
                </td>
                <td className="text-center">
                  {data?.not_answered_question_count}
                </td>
                <td className="text-center">{data?.answer_count}</td>
                <td className="text-center">{data?.accept_question_count}</td>

                <td className="text-center">{data?.reset_question_count}</td>
                <td className="text-center">{data?.nc_question_count}</td>
                {/* <td className="Capitalize">{data?.vendor_start_date}</td> */}
                <td className="text-center">
                  <span
                    className={`badge badge-fixedwidth Capitalize ${
                      data.assessment_status === "active"
                        ? "user-active"
                        : data.assessment_status === "invited in-progress"
                        ? " bg-invite-badge"
                        : data.assessment_status === "in-progress"
                        ? "bg-inprocess-badge "
                        : "bg-success-badge"
                    }`}
                  >
                    {" "}
                    {data?.assessment_status?.replace("-", " ")}
                  </span>
                </td>

                <td className="text-center">
                  <Link
                    to={
                      data?.assessment_status === "completed"
                        ? ""
                        : "/vendor-portal/assessment-view"
                    } // Empty string for disabled link
                    style={{
                      textDecoration: "none",
                      color:
                        data?.assessment_status === "completed"
                          ? "gray"
                          : "green", // Dynamic color
                      pointerEvents:
                        data?.assessment_status === "completed"
                          ? "none"
                          : "auto", // Disables pointer events
                    }}
                    onClick={(e) => {
                      if (data?.assessment_status === "completed") {
                        e.preventDefault(); // Prevent navigation if completed
                      }
                    }}
                  >
                    <button
                      className="btn primary-btn px-4"
                      disabled={data?.assessment_status === "completed"}
                      style={{
                        backgroundColor:
                          data?.assessment_status === "completed"
                            ? "lightgray"
                            : "primary-btn",
                        cursor:
                          data?.assessment_status === "completed"
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      {data?.assessment_status === "in-progress"
                        ? "Continue"
                        : data?.assessment_status === "completed"
                        ? "Completed"
                        : data?.assessment_status === "invited"
                        ? "Start"
                        : "Start"}
                    </button>
                  </Link>
                </td>
              </tr>
            ) : (
              <tr>
                <td colSpan="11" className="text-center">
                  No Data Available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="float-end me-5 pe-3"></div>
    </>
  );
}

export default Dashboard;
