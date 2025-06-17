import { Outlet } from "react-router-dom";
import EmployeeNavbar from "./EmployeeNavbar";

const EmployeeLayout = () => {
  return (
    <div className="">
      <div>
        <EmployeeNavbar />
        <div className=" p-3">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default EmployeeLayout;
