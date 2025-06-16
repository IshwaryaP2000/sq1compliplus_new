import { Outlet } from "react-router-dom";
import Vendornavbar from "./Vendornavbar";

const VendorLayout = () => {
  alert("Vendor Layout Loaded");
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
