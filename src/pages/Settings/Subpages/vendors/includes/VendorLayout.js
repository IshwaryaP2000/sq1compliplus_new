import { Outlet } from "react-router-dom";
import Vendornavbar from "./Vendornavbar";

const VendorLayout = () => {
  return (
    <>
      {/* <div className="main-containent"> */}
      {/* <Sidenavbar /> */}
      <div className="">
        <div>
          {/* <Navbar /> */}
          <Vendornavbar />
          <div className=" p-3">
            <Outlet />
          </div>
        </div>
      </div>
      {/* </div> */}
    </>
  );
};

export default VendorLayout;
