import { Outlet } from "react-router-dom";
import Vendornavbar from "./Vendornavbar";

const VendorLayout = () => {
  return (
    <>
      <div className="">
        <div>
          <Vendornavbar />
          <div className=" p-3">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
};

export default VendorLayout;
