import { NavLink, useLocation } from "react-router-dom";
import { getCurrentUser, hasRole } from "../utils/UtilsGlobalData";

// Define your full menu structure
export const menus = {
  policy: [
    {
      path: "/policy/all",
      label: "Policy",
      icon: "fas fa-shield-alt",
      dropdown: [
        { path: "/policy/all", label: "All Policies" },
        { path: "/policy/active", label: "Active Policies" },
        { path: "/policy/waiting", label: "Policies waiting" },
        { path: "/policy/approval", label: "Pending Approval" },
        { path: "/policy/my-policy", label: "My Policies" },
      ],
    },
    { path: "/policy/employees", label: "Employees", icon: "fas fa-users" },
  ],
  compliance: [
    { path: "/compliance/hipaa", label: "HIPAA", icon: "fas fa-shield-alt" },
    { path: "/compliance/iso", label: "ISO", icon: "fas fa-certificate" },
    { path: "/compliance/soc", label: "SOC", icon: "fas fa-clipboard-check" },
  ],
  logs: [
    {
      path: "/logs/activity-logs",
      label: "Activity Logs",
      icon: "fas fa-certificate",
    },
    {
      path: "/logs/audit-logs",
      label: "Audit Logs",
      icon: "fas fa-shield-alt",
    },
  ],
  settings: [
    {
      path: "/settings/users",
      label: "Users",
      icon: "fas fa-users",
      rolesAllowed: ["sq1_super_admin", "sq1_admin", "admin", "sq1_user"],
    },
    {
      path: "/settings/organizations",
      label: "Organizations",
      icon: "fa-solid fa-sitemap",
      rolesAllowed: ["sq1_super_admin", "sq1_admin"],
    },
    {
      path: "/settings/readiness-answers",
      label: "Readiness",
      icon: "fas fa-tasks",
      dropdown: [
        { path: "/settings/readiness-answers", label: "View Answers" },
        { path: "/settings/readiness", label: "Questions" },
      ],
      rolesAllowed: ["sq1_super_admin", "sq1_admin", "admin"],
    },
    {
      path: "/settings/controls",
      label: "Compliance",
      icon: "fa-solid fa-shield-halved",
      dropdown: [
        { path: "/settings/controls", label: "Controls" },
        { path: "/settings/compli-integration", label: "Integration" },
      ],
      rolesAllowed: ["sq1_super_admin", "sq1_admin", "admin"],
    },
    {
      path: "/settings/question",
      label: "Vendor",
      icon: "fa-solid fa-box",
      dropdown: [
        { path: "/settings/question", label: "Questions" },
        {
          path: "/settings/add-pre-approved-vendor",
          label: "Pre-Approved Vendors",
        },
      ],
      rolesAllowed: ["sq1_admin", "admin"],
    },
    {
      path: "/settings/policy-template",
      label: "Policy",
      icon: "fa-solid fa-building-shield",
      dropdown: [
        { path: "/settings/policy-template", label: "Policy Template" },
        { path: "/settings/admin-policy", label: "Admin Policy" },
        { path: "/settings/approval-process", label: "Approval Process" },
      ],
      rolesAllowed: ["admin"],
    },
    {
      path: "/settings/sso-setup",
      label: "SSO Setup",
      icon: "fa-solid fa-screwdriver-wrench",
      rolesAllowed: ["sq1_super_admin", "sq1_admin", "admin"],
    },
    {
      path: "/settings/activity-logs",
      label: "Logs",
      icon: "fa-solid fa-book",
      dropdown: [
        { path: "/settings/activity-logs", label: "Activity Logs" },
        { path: "/settings/audit-logs", label: "Audit Logs" },
      ],
      rolesAllowed: ["sq1_super_admin", "sq1_admin", "admin", "sq1_user"],
    },
    {
      path: "/settings/organization-info",
      label: "Info",
      icon: "fa-solid fa-circle-info",
      rolesAllowed: ["sq1_super_admin", "sq1_admin", "admin"],
    },
  ],
  employee: [
    {
      path: "/employee/all-policy",
      label: "All Policy",
      icon: "fas fa-shield-alt",
    },
    {
      path: "/employee/accepted-policy",
      label: "Accepted Policy",
      icon: "fas fa-users",
    },
  ],
};

const Subnavbar = () => {
  const location = useLocation();
  const currentUser = getCurrentUser();

  const currentRoute = location.pathname.startsWith("/compliance")
    ? "compliance"
    : location.pathname.startsWith("/settings")
    ? "settings"
    : location.pathname.startsWith("/policy") ||
      location.pathname.startsWith("/employees")
    ? "policy"
    : location.pathname.startsWith("/employee")
    ? "employee"
    : location.pathname.startsWith("/logs")
    ? "logs"
    : location.pathname.startsWith("/organizations")
    ? "settings"
    : null;

  const menuItems = menus[currentRoute] || [];

  const filteredMenuItems = menuItems.filter((item) => {
    if (!item.rolesAllowed) return true;
    if (!currentUser || !currentUser.user_role) return false;

    const parentAllowed = hasRole(item.rolesAllowed);
    const dropdownAllowed = item.dropdown?.some((sub) =>
      hasRole(sub.rolesAllowed)
    );
    return parentAllowed || dropdownAllowed;
  });

  const isMainItemActive = (item) => {
    if (location.pathname === item.path) return true;
    if (item.dropdown) {
      return item.dropdown.some((sub) =>
        location.pathname.startsWith(sub.path)
      );
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <div className="subnavbar-menu">
      <ul
        className="mb-0 px-0 d-flex flex-wrap"
        style={{ alignItems: "center" }}
      >
        {filteredMenuItems.map((item) => (
          <li
            key={item.path}
            className={`menu-item ${isMainItemActive(item) ? "active" : ""}`}
          >
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                isMainItemActive(item) ? "active navlink-item" : "navlink-item"
              }
            >
              <i className={item.icon} style={{ marginRight: "8px" }}></i>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Subnavbar;
