import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidenavbar from "./Sidenavbar";
import Chatbot from "../components/Chatbot/Chatbot";
import SecondSubnavbar from "./SecondSubnavbar";

const Layout = () => {
  return (
    <div className="main-containent">
      <Chatbot />
      <Sidenavbar />
      <div className="main-layout">
        <div>
          <Navbar />
          <SecondSubnavbar />
          <div className="p-4 main-content-scrolling">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
