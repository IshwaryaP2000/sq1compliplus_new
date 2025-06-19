import { useState, useRef, useEffect } from "react";
import Dropdown from "react-bootstrap/Dropdown";
import { Link, useNavigate } from "react-router-dom";
import Subnavbar from "../../../layout/Subnavbar";
import { postApi } from "../../../services/apiService";
import { CircleuserIcon, SignoutIcon } from "../../../components/Icons/Icons";

const EmployeeNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");

  // Close the notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    // Load initial value from localStorage
    const authUser = JSON.parse(localStorage.getItem("authUser") || "{}");
    setUserName(authUser?.name || "");

    // Listen for profile updates
    const handleProfileUpdate = () => {
      const updatedUser = JSON.parse(localStorage.getItem("authUser") || "{}");
      setUserName(updatedUser?.name || "");
    };

    window.addEventListener("profileUpdate", handleProfileUpdate);

    return () => {
      window.removeEventListener("profileUpdate", handleProfileUpdate);
    };
  }, []);

  const logout = async () => {
    try {
      await postApi("/employee/logout");
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
      localStorage.removeItem("portal");
      localStorage.removeItem("employee_status");
      navigate("/employee/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div style={{ position: "sticky", top: "0", zIndex: " +999" }}>
      <ul className="navbar-nav bg-white ">
        <li className="align-content-center vendor-navbarheight">
          <div className=" d-flex justify-content-between px-5">
            <div className="d-flex align-items-center mb-2">
              <Link to={"/employee/all-policy"}>
                <img src="/images/stackflo-icon.svg" alt="Logo" />
              </Link>
              <div>
                <Subnavbar />
              </div>
            </div>

            <div className="d-flex align-items-center">
              <div>
                <Dropdown className="vendor-profiledropdown">
                  <Dropdown.Toggle
                    variant="success"
                    id="dropdown-basic"
                    className="btn-auth d-flex align-items-center user-profile-button"
                  >
                    <CircleuserIcon />
                    <div className="user-profile-dropdown ms-2">{userName}</div>
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item href="/employee/profile">
                      Profile
                      <i className="fa-solid fa-user ms-2"></i>
                    </Dropdown.Item>
                    <Dropdown.Item onClick={logout}>
                      Logout <SignoutIcon className="ms-2" />
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default EmployeeNavbar;
