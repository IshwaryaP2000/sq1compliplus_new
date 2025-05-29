import { createContext, useContext, useEffect, useState } from "react";
import { getApi } from "../services/apiService";
import {
  getAuthToken,
  getCurrentOrganization,
  getCurrentUser,
  setCurrentOrganization,
} from "../utils/UtilsGlobalData";

const OrganizationUserContext = createContext();

const OrganizationUserProvider = ({ children }) => {
  const [organization, setOrganization] = useState([]);
  const [authUser, setAuthUser] = useState([]);
  const [authUserError, setAuthUserError] = useState(null);
  const portal = localStorage.getItem("portal");
  const currentUser = getCurrentUser();

  const fetchOrganizationUser = async () => {
    try {
      const customUrl =
        portal === "vendor"
          ? getAuthToken()
            ? "current-vendor-organization"
            : "organization-info"
          : portal === "employee"
          ? getAuthToken()
            ? "employee/current-employee-organization"
            : "organization-info"
          : getAuthToken()
          ? "current-user-organization"
          : "organization-info";

      const response = await getApi(customUrl);
      setCurrentOrganization(response?.data?.data?.current_organization || []);
      setOrganization(getCurrentOrganization());
    } catch (responseErr) {
      console.error("Error fetching organization user:", error);
    }
  };

  var locationUrl = window.location.pathname;

  useEffect(() => {
    //if location is not root and user is verifiedMFA, fetch organization user
    if (locationUrl !== "/" && currentUser?.scope === "verifiedMFA") {
      fetchOrganizationUser();
    }
  }, [locationUrl]);

  return (
    <OrganizationUserContext.Provider
      value={{
        organization,
        setOrganization,
        authUser,
        setAuthUser,
        authUserError,
        setAuthUserError,
        fetchOrganizationUser,
      }}
    >
      {children}
    </OrganizationUserContext.Provider>
  );
};

export default OrganizationUserProvider;

export const useAuthOrganization = () => {
  return useContext(OrganizationUserContext);
};
