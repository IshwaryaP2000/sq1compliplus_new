// set the current authtoken
import { getApi } from "../services/apiService";

export const setAuthToken = (token) => {
  localStorage.setItem("authToken", token);
  return true;
};

// get the current token
export const getAuthToken = () => {
  const authToken = localStorage.getItem("authToken");
  if (authToken !== null && authToken !== undefined) {
    return authToken;
  } else {
    return false;
  }
};

// set the current authtoken
export const removeAuthToken = () => {
  localStorage.removeItem("authToken");
  return true;
};

// set the current domain
export const setDomain = (domain_name) => {
  localStorage.setItem("domain_name", domain_name);
  return true;
};

// set the current domain
export const getDomain = () => {
  if (localStorage.getItem("domain_name")) {
    return localStorage.getItem("domain_name");
  }
};

// set the current user from localStorage
export const setCurrentUser = (userData) => {
  localStorage.setItem("authUser", JSON.stringify(userData));
  return true;
};

// get the current user from localStorage
export const getCurrentUser = () => {
  const userDetails = localStorage.getItem("authUser");
  if (userDetails) {
    const parsedUserDetails = JSON.parse(userDetails);
    return parsedUserDetails;
  }
  return false;
};

// set the current user from localStorage
export const removeCurrentUser = () => {
  localStorage.removeItem("authUser");
  return true;
};

// get the current user's organization, currentUser() is null
export const setCurrentOrganization = (organization) => {
  localStorage.removeItem("organization");
  localStorage.setItem("organization", JSON.stringify(organization));
  return true;
};

// get the current user's organization, currentUser() is null
export const getCurrentOrganization = () => {
  const organizationDetails = localStorage.getItem("organization");
  const parsedOrganizationDetails = JSON.parse(organizationDetails);
  return parsedOrganizationDetails;
};

// get the current user logo
export const logoPath = () => {
  const logo = {};
  logo["client_logo"] = getCurrentOrganization()?.dark_logo_url
    ? getCurrentOrganization()?.dark_logo_url
    : "../images/logo.svg"
    ? `${import.meta.env.PUBLIC_URL}/images/logo.svg`
    : null;
  logo["sq1_logo"] = import.meta.env.VITE_SQ1_LOGO;
  logo["sq1_poweredby"] = import.meta.env.VITE_SQ1POWERED_LOGO;
  logo["product_logo"] = import.meta.env.VITE_PRODUCT_LOGO;
  logo["product_logo_text"] = import.meta.env.VITE_PRODUCT_LOGO_TEXT;
  logo["product_logo_icon"] = import.meta.env.VITE_PRODUCT_LOGO_ICON;
  return logo;
};

// get the first letter Caps
export const ucFirst = (string) => {
  if (string && string.length) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
};

export const logout = () => {
  removeCurrentUser();
  removeAuthToken();
  const orgInfo = async () => {
    try {
      const response = await getApi("organization-info");
      setCurrentOrganization(response?.data?.data?.current_organization);
    } catch {}
  };
  return true;
};

export const hasRole = (requiredRoles = []) => {
  const user = getCurrentUser();
  if (!user || !user?.user_role) return false;
  return requiredRoles?.includes(user?.user_role) ?? false;
};

// Uses to remove the modal backdrop.
export const dismissModalBackdrop = () => {
  const modalBackdrops = document.getElementsByClassName("modal-backdrop");
  const backdropElements = Array.from(modalBackdrops);
  backdropElements.forEach((elm) => {
    elm.classList.remove("show");
    elm.style.display = "none";
  });
};

export const formatDate = (dateString) => {
  const date = new Date(dateString); // Parse the input date string
  const year = date.getFullYear(); // Extract the year
  const month = date.toLocaleString("en-US", { month: "short" });
  const day = date.getDate();
  return `${year} ${month} ${String(day).padStart(2, "0")}`;
};
