import { useEffect, useState } from "react";
import { getApi } from "../../services/apiService";
import { useAuthOrganization } from "../../Hooks/OrganizationUserProvider";
import { useNavigate } from "react-router-dom";
import {
  setCurrentOrganization,
  setCurrentUser,
  setDomain,
  ucFirst,
} from "../../utils/UtilsGlobalData";
import { CircleuserIcon } from "../Icons/Icons";

const ListAllOrganizations = () => {
  const navigate = useNavigate();
  const { organization, setOrganization, setAuthUser } = useAuthOrganization();
  const [allOrganizations, setAllOrganizations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllOrganizations = async () => {
    try {
      setIsLoading(true);
      const response = await getApi("user-organizations-list");
      setAllOrganizations(response?.data?.data?.data || []);
      setError(null);
    } catch (err) {
      setError("Failed to fetch organizations. Please try again later.");
      console.error("Error in fetchAllOrganizations:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrganizations();
  }, []);

  const handleOrganizationClick = async (listOrganization) => {
    try {
      const response = await getApi("current-user-organization", {
        headers: {
          Domain: listOrganization?.domain_name,
        },
      });

      if (response?.data?.success) {
        const currentOrganization = response?.data?.data?.current_organization;
        setDomain(currentOrganization?.domain_name); // Set domain globally
        setCurrentUser(currentOrganization?.user); // Set current user globally
        setAuthUser(currentOrganization?.user); // Update user context
        setCurrentOrganization(currentOrganization); // Set current organization globally
        setOrganization(currentOrganization); // Update organization context
        navigate("/");
      }
    } catch (err) {
      console.error("Error fetching organization details:", err);
      setError("Failed to switch organization. Please try again.");
    }
  };

  return (
    <>
      {isLoading ? (
        <div className="text-center">
          <span
            className="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          ></span>
          Loading organizations...
        </div>
      ) : error ? (
        <p className="text-danger">{error}</p>
      ) : (
        <ul className="list-unstyled ">
          {allOrganizations.map((listOrganization) => (
            <li
              key={listOrganization?.id}
              className={` ${
                listOrganization?.name === organization?.name
                  ? "dropdown-item   mb-2 active-orgina text-center rounded-3 userorg-dropdown "
                  : "dropdown-item   mb-2  text-center rounded-3 userorg-dropdown"
              }`}
              role="button"
              onClick={() => handleOrganizationClick(listOrganization)}
            >
              <div className="d-flex">
                <div className="align-content-center ">
                  <CircleuserIcon className="align-content-center me-2 fs-3 text-lightgreen" />
                </div>
                <div className="d-grid fs-18 fw-bold text-start ms-2 text-white">
                  <span className="org-contenttext">
                    {listOrganization?.name}
                  </span>
                  <span
                    className="fw-medium fs-14 px-0 text-start  org-contenttext"
                    style={{ color: "#969696" }}
                  >
                    {ucFirst(listOrganization?.user_role?.replaceAll("_", " "))}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default ListAllOrganizations;
