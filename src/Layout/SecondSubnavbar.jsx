import { NavLink, useLocation } from "react-router-dom";
import { menus } from "./Subnavbar";

const SecondSubnavbar = () => {
  const location = useLocation();
  const allMenuItems = Object.values(menus).flat();
  const activeDropdown = allMenuItems.find((item) => {
    if (!item.dropdown) return false;
    return item.dropdown.some((sub) => location.pathname.startsWith(sub.path));
  });

  if (!activeDropdown) return null;

  return (
    <div className="subnavbar-menu">
      <ul
        className="mb-0 px-0 d-flex flex-wrap"
        style={{ alignItems: "center" }}
      >
        {activeDropdown.dropdown.map((subItem) => (
          <li key={subItem.path} className="menu-item ">
            <NavLink
              to={subItem.path}
              className={({ isActive }) =>
                isActive ? "active navlink-item" : "navlink-item"
              }
            >
              {subItem.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SecondSubnavbar;
