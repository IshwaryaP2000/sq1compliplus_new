import React from "react";
import { Link, useNavigate } from "react-router-dom";
const VendorDashbord = () => {
  const navigate = useNavigate();
  return (
    <div>
      <div className="tabledata-scroll mb-3">
        <table className="table users-table mb-0">
          <thead className="tablescrolling-thead-tr">
            <tr>
              <th scope="col">#</th>
              <th scope="col">Data Access Level</th>
              <th scope="col">Total Questions</th>
              <th scope="col">In Completed Questions</th>
              <th scope="col">Not Answered Questions</th>
              <th scope="col">Accept Question</th>
              <th scope="col">Reset Question</th>
              <th scope="col">NC Question</th>
              <th scope="col">Assigned On</th>
              <th scope="col">Completed On</th>
              <th scope="col">Status</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody className="tablescrolling-tbody">
            <tr>
              <th scope="row">1</th>
              <td></td>
              <td>3</td>
              <td>2</td>
              <td>0</td>
              <td>
                <Link
                  to={"#"}
                  className="badge user-active text-white text-decoration-none"
                >
                  0
                </Link>
              </td>
              <td>
                <Link
                  to={"#"}
                  className="badge user-active text-white text-decoration-none"
                >
                  0
                </Link>
              </td>
              <td>
                <Link
                  to={"#"}
                  className="badge user-active text-white text-decoration-none"
                >
                  0
                </Link>
              </td>
              <td>2025-Feb-10</td>
              <td>2025-02-18 11:18:46</td>
              <td>In-progress</td>
              <td>
                <button
                  className="btn primary-btn"
                  onClick={() => navigate("../assessment-view")}
                >
                  Continue
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VendorDashbord;
