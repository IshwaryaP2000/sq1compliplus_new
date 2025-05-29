import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { hasRole } from "../utils/UtilsGlobalData";
import { TasksIcon } from "../components/Icons/Icons";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true); // Default state: collapsed
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation(); // Add this to get current location

  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed); // Toggle collapse state
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Custom isActive function to check if path starts with the given path
  const isPathActive = (path) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div
      className={`layout has-sidebar fixed-sidebar fixed-header ${
        isCollapsed ? "collapsed" : ""
      }`}
    >
      <button className="hamburger-menu d-none" onClick={toggleMobileMenu}>
        <i className="fa-solid fa-bars"></i>
      </button>

      <aside
        id="sidebar"
        className={`sidebar break-point-sm has-bg-image ${
          isCollapsed ? "collapsed" : ""
        } ${isMobileMenuOpen ? "mobile-open" : ""}`}
      >
        <button
          id="btn-collapse"
          className="sidebar-collapser"
          onClick={handleCollapse}
        >
          <i
            className={`fa-solid ${
              isCollapsed ? "fa-angle-right" : "fa-angle-left"
            }`}
            style={{ fontSize: "12px" }}
          ></i>
        </button>

        <div className="sidebar-layout">
          <div className="sidebar-header">
            <div className="pro-sidebar-logo d-flex ms-1">
              <div>
                <img src="/images/stackflo-icon.svg" alt="Logo" />
              </div>
              <h5 className="mb-0 ms-3">
                <img src="/images/stackflo-text.svg" alt="Logo" />
              </h5>
            </div>
          </div>
          <div className="sidebar-content">
            <nav className="menu open-current-submenu">
              <ul className="mt-2">
                {hasRole([
                  "sq1_super_admin",
                  "sq1_admin",
                  "sq1_user",
                  "admin",
                  "user",
                ]) && (
                  <li className="menu-item menu-item02 my-2">
                    <NavLink
                      to="/dashboard"
                      className={isPathActive("/dashboard") ? "active" : ""}
                      onClick={closeMobileMenu}
                    >
                      <span className="menu-icon">
                        <img
                          src="/images/sidenavbar-img/dashboard.svg"
                          alt="Logo"
                          className="svg-filter"
                        />
                      </span>
                      <span className="menu-title">Dashboard</span>
                      <span className="menu-title-closed">Dashboard</span>
                    </NavLink>
                  </li>
                )}
                {/* Conditionally render Readiness based on user role */}
                {hasRole(["admin", "user"]) && (
                  <li className="menu-item menu-item02 my-2">
                    <NavLink
                      to="/readiness"
                      className={isPathActive("/readiness") ? "active" : ""}
                      onClick={closeMobileMenu}
                    >
                      <span className="menu-icon">
                        <TasksIcon />
                      </span>
                      <span className="menu-title">Readiness</span>
                      <span className="menu-title-closed">Readiness</span>
                    </NavLink>
                  </li>
                )}
                {/* Conditionally render Compliance based on user role */}
                {hasRole(["admin", "user"]) && (
                  <li className="menu-item menu-item02 my-2">
                    <NavLink
                      to="/compliance/hipaa"
                      className={isPathActive("/compliance") ? "active" : ""}
                      onClick={closeMobileMenu}
                    >
                      <span className="menu-icon">
                        <img
                          src="/images/sidenavbar-img/compliance.svg"
                          alt="Logo"
                          className="svg-filter"
                        />
                      </span>
                      <span className="menu-title">Compliance</span>
                      <span className="menu-title-closed">Compliance</span>
                    </NavLink>
                  </li>
                )}
                {/* Conditionally render Assets based on user role */}
                {hasRole(["admin", "user"]) && (
                  <li className="menu-item menu-item02 my-2">
                    <NavLink
                      to="/assets"
                      className={isPathActive("/assets") ? "active" : ""}
                      onClick={closeMobileMenu}
                    >
                      <span className="menu-icon">
                        {/* <i className="fa-solid fa-clipboard"></i> */}
                        <img
                          src="/images/sidenavbar-img/assets.svg"
                          alt="Logo"
                          className="svg-filter"
                        />
                      </span>
                      <span className="menu-title">Assets</span>
                      <span className="menu-title-closed">Assets</span>
                    </NavLink>
                  </li>
                )}
                {/* Conditionally render Vendor based on user role */}
                {hasRole(["admin", "user"]) && (
                  <li className="menu-item menu-item02 my-2">
                    <NavLink
                      to="/vendors"
                      className={isPathActive("/vendors") ? "active" : ""}
                      onClick={closeMobileMenu}
                    >
                      <span className="menu-icon">
                        <img
                          src="/images/sidenavbar-img/vendor.svg"
                          alt="Logo"
                          className="svg-filter"
                        />
                      </span>
                      <span className="menu-title">Vendor</span>
                      <span className="menu-title-closed">Vendor</span>
                    </NavLink>
                  </li>
                )}
                {hasRole(["admin", "user"]) && (
                  <li className="menu-item menu-item02 my-2">
                    <NavLink
                      to="/policy/all"
                      className={isPathActive("/policy") ? "active" : ""}
                      onClick={closeMobileMenu}
                    >
                      <span className="menu-icon">
                        <img
                          src="/images/sidenavbar-img/policy.svg"
                          alt="Logo"
                          className="svg-filter"
                        />
                      </span>
                      <span className="menu-title">Policy</span>
                      <span className="menu-title-closed">Policy</span>
                    </NavLink>
                  </li>
                )}
                {/* Conditionally render Settings based on user role */}
                {hasRole([
                  "sq1_super_admin",
                  "sq1_admin",
                  "sq1_user",
                  "admin",
                  "user",
                ]) && (
                  <li className="menu-item menu-item02 setting-submenu my-2">
                    <NavLink
                      to="/settings/users"
                      className={isPathActive("/settings") ? "active" : ""}
                      onClick={closeMobileMenu}
                    >
                      <span className="menu-icon">
                        <img
                          src="/images/sidenavbar-img/settings.svg"
                          alt="Logo"
                          className="svg-filter"
                        />
                      </span>
                      <span className="menu-title">Settings</span>
                      <span className="menu-title-closed">Settings</span>
                    </NavLink>
                  </li>
                )}
              </ul>
            </nav>
          </div>
        </div>
      </aside>
      {isMobileMenuOpen && (
        <div className="overlay-sidenav" onClick={toggleMobileMenu}></div>
      )}
      <div className="layout">
        <main className="content"></main>
        <div className="overlay"></div>
      </div>
    </div>
  );
};

export default Sidebar;
