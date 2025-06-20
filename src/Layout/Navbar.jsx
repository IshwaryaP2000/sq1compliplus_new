import { useState, useEffect, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import Pusher from "pusher-js";
import { toast } from "react-toastify";
import Logout from "../pages/Authentication/Logout";
import { useAuthOrganization } from "../Hooks/OrganizationUserProvider";
import ListAllOrganizations from "../components/Organization/ListAllOrganizations";
import Subnavbar from "./Subnavbar";
import { BellIcon, CircleuserIcon, SignoutIcon } from "../components/Icons/Icons";
import {
  getCurrentUser,
  logout,
  ucFirst,
  logoPath,
} from "../utils/UtilsGlobalData";

const Navbar = () => {
  const domain = localStorage.getItem("domain_name");
  const { organization } = useAuthOrganization();
  const [logoPaths, setLogoPath] = useState("");
  const [showOrganizations, setShowOrganizations] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);

  // pusher start
  useEffect(() => {
    // Replace 'YOUR_PUSHER_APP_KEY' with your actual Pusher API Key
    const pusher = new Pusher("00df1c7f01abf8ed53b6", {
      cluster: "ap2", // Replace with your cluster (e.g., 'eu', 'ap1')
      encrypted: true, // Recommended for security
    });

    const channel = pusher.subscribe("notifications");
    channel.bind("new-notification", (data) => {
      if (domain === data?.domain_name) {
        toast.warning(data.message);
      }
    });
    return () => {
      pusher.unsubscribe("notifications");
    };
  }, []);

  // pusher end

  useEffect(() => {
    if (organization?.dark_logo_url) {
      setLogoPath(`${organization.dark_logo_url}`);
    }
  }, [organization]);

  useEffect(() => {
    if (!organization) logout();
  }, [organization]);

  // Toggle Handlers
  const toggleNotifications = () => setIsOpen((prev) => !prev);
  const toggleOrganizationList = () => setShowOrganizations((prev) => !prev);
  const closeNotification = () => setIsOpen(false);
  const closeDropDown = () => setShowOrganizations(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowOrganizations(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header>
      <div className="d-flex">
        <div>
          <Subnavbar />
        </div>
        <nav className="navbar bg-white custom-header-navbar">
          <div className="container-fluid">
            <div className="justify-content-end d-flex w-100">
              <ul className="navbar-nav d-flex flex-row align-items-center">
                <li>
                  <img
                    src={!logoPaths ? logoPath()?.client_logo : logoPaths}
                    alt=" logo"
                    className="client-logoupload  mx-4"
                  />
                </li>
                <li className="align-content-center">
                  <div
                    className="position-relative inline-block me-2"
                    ref={containerRef}
                  >
                    <div
                      className=" position-relative bell-notification-menu"
                      onClick={toggleNotifications}
                      style={{ cursor: "pointer" }}
                    >
                      <BellIcon />
                    </div>
                    {isOpen && (
                      <div className="position-absolute notification-count bg-white">
                        <div className="justify-content-between d-flex align-items-center p-3  notification-header ">
                          <span className="fw-bold">Notifications</span>
                        </div>

                        <ul className="dropdown-menu show w-100 switch-org-menu p-0 org-notifications">
                          <li className="dropdown-item p-1 main-dropdownlist tabledata-scroll p-2">
                            <div className="d-flex notification-list-org p-2">
                              <div className="align-content-start me-2 ">
                                <p className="notif-name fs-18">AV</p>
                              </div>
                              <div>
                                <p className="fs-16  mb-1 text-gray-light text-wrap">
                                  <span className="fw-bold text-black">
                                    Jessica Taylor :
                                  </span>
                                  New vendor questionnaire submitted for review
                                </p>

                                <p className="fs-14 text-gray-light mb-0">
                                  0 min
                                </p>
                              </div>
                              <div className="align-content-center "></div>
                            </div>
                          </li>

                          <li className="justify-content-end d-flex  align-items-center px-3 py-1 notification-footer ">
                            <Link
                              to="/notification"
                              className="btn primary-btn w-auto fs-14"
                              onClick={() => {
                                closeNotification();
                              }}
                            >
                              View All
                            </Link>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </li>

                {/* User Dropdown */}
                <li className="nav-item dropdown" ref={dropdownRef}>
                  <div
                    className="d-flex  switch-orgination "
                    onClick={(e) => {
                      e.preventDefault();
                      toggleOrganizationList();
                    }}
                  >
                    <div className="align-content-center ">
                      <CircleuserIcon className="align-content-center me-2 fs-3 text-lightgreen" />
                    </div>

                    <a
                      className="nav-link dropdown-toggle py-0 org-dropdown ms-2"
                      role="button"
                    >
                      <span className=" fw-bold fs-18 org-contenttext">
                        {getCurrentUser()?.name || "User"}
                      </span>

                      <span
                        className="badge dropdown-simble-d-none fs-14 fw-medium px-0 text-start  org-contenttext"
                        style={{ color: "#969696" }}
                      >
                        {ucFirst(
                          getCurrentUser()?.user_role?.replaceAll("_", " ")
                        )}
                      </span>
                    </a>
                  </div>
                  {showOrganizations && (
                    <ul className="dropdown-menu show w-100 switch-org-menu p-0">
                      <li className="dropdown-item p-1 main-dropdownlist tabledata-scroll">
                        <ListAllOrganizations
                          onError={(error) => setFetchError(error)}
                        />
                      </li>
                      {fetchError && (
                        <li className="dropdown-item text-danger">
                          {fetchError}
                        </li>
                      )}

                      <li>
                        <div className="d-flex p-2">
                          <NavLink
                            className="dropdown-item logout-btn text-center profile-navlink me-2"
                            to="/settings/profile/change-password"
                            onClick={() => {
                              closeDropDown();
                            }}
                          >
                            <i className="fa-regular fa-user me-2"></i>
                            Profile
                          </NavLink>
                          <a
                            className="dropdown-item  cursor-pointer fw-bold logout-btn text-center logout-navlink"
                            onClick={(e) => {
                              e.preventDefault();
                              Logout();
                            }}
                          >
                            Logout
                            <SignoutIcon className="ms-2" />
                          </a>
                        </div>
                      </li>
                    </ul>
                  )}
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
