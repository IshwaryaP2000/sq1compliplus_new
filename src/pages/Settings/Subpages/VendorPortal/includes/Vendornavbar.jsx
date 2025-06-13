import { useState, useRef, useEffect } from "react";
import Dropdown from "react-bootstrap/Dropdown";
import { Link, NavLink, useNavigate, useParams } from "react-router-dom";
import { postApi } from "../../../api/apiClient";

const Vendornavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const user_name = localStorage.getItem("authUser");
  const user = user_name?.type;
  const name = JSON.parse(user_name) || "";
  const location = useParams();

  const toggleNotifications = () => {
    setIsOpen((prev) => !prev);
  };

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

  const logout = async () => {
    try {
      await postApi("/vendor/logout");
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
      localStorage.removeItem("portal");
      navigate("/vendor-portal/login");
    } catch (error) {}
  };

  return (
    <div style={{ position: "sticky", top: "0", zIndex: " +999" }}>
      <ul className="navbar-nav bg-white ">
        <li className="align-content-center vendor-navbarheight">
          <div className=" d-flex justify-content-between px-5">
            <div className="d-flex">
              <Link to={"/vendor-portal/dashboard"}>
                <img src="/images/stackflo-icon.svg" alt="Logo" />
              </Link>
              {location["*"] !== "dashboard" && (
                <div className="ms-3 vendor-navbar mt-1">
                  <NavLink
                    to={"/vendor-portal/dashboard"}
                    className={({ isActive }) =>
                      isActive ? "active navlink-item" : "navlink-item"
                    }
                  >
                    Dashboard
                  </NavLink>
                  <NavLink
                    to={"/vendor-portal/assessment-view"}
                    className={
                      location["*"] === "assessment-view"
                        ? "vendorbtn-submit-active"
                        : "navlink-item"
                    }
                  >
                    Assement View
                  </NavLink>
                  {user != "vendor_user" ? (
                    <NavLink
                      to={"/vendor-portal/users"}
                      className={
                        location["*"] === "users"
                          ? "vendorbtn-submit-active"
                          : "navlink-item"
                      }
                    >
                      Users
                    </NavLink>
                  ) : (
                    ""
                  )}
                </div>
              )}
            </div>

            <div className="d-flex">
              <div className="align-content-center  vendor-bellnotification">
                <div
                  className="position-relative inline-block me-4"
                  ref={containerRef}
                >
                  <div
                    className="position-relative"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent immediate closing when clicking the bell
                      toggleNotifications();
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <i className="fa-solid fa-bell fs-3 text-lightgreen "></i>
                    <span className="position-absolute translate-middle badge rounded-pill budge-notification"></span>
                  </div>
                  {isOpen && (
                    <div className="position-absolute notification-count rounded-3">
                      <ul className="p-2 list-items-style">
                        <li className="my-2">
                          <div className="d-flex">
                            <div className="align-content-center me-3">
                              <p className="notif-name fs-14 mb-0">AV</p>
                            </div>
                            <div>Test</div>
                            <div className="align-content-center ms-3"></div>
                          </div>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <Dropdown className="vendor-profiledropdown">
                  <Dropdown.Toggle
                    variant="success"
                    id="dropdown-basic"
                    className="btn-auth d-flex align-items-center user-profile-button"
                  >
                    <i className="fa-regular fa-circle-user "></i>
                    <div className="user-profile-dropdown ms-2">
                      {name?.name}
                    </div>
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item href="/vendor-portal/profile">
                      <i className="fa-solid fa-user me-2"></i>
                      <span>Profile</span>
                    </Dropdown.Item>
                    <Dropdown.Item onClick={logout}>
                      <i className="fa fa-sign-out me-2"></i>
                      <span>Logout</span>
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

export default Vendornavbar;
