import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  logoPath,
  setCurrentOrganization,
  setDomain,
} from "../utils/UtilsGlobalData";
import { getApi } from "../services/apiService";
import "../styles/Stackflo.css";

const LandingPage = () => {
  const navigate = useNavigate();
  const [newDomain, setNewDomain] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDomainSearch = async (domain) => {
    if (!domain) {
      setSearchResults([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await getApi("search-domain", {
        headers: {
          Domain: domain,
        },
      });
      if (response?.data?.success) {
        setSearchResults(response?.data?.data?.domains || []);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error("Error searching domain:", err);
      setError("Unable to fetch domain data.");
    } finally {
      setLoading(false);
    }
  };

  const handleOrganizationDomainClick = async () => {
    const DomainName = newDomain || process.env.VITE_MAIN_DOMAIN;
    setError(null);
    try {
      const response = await getApi("organization-info", {
        headers: {
          Domain: DomainName,
        },
      });

      if (response?.data?.success) {
        const currentOrganization = response?.data?.data?.current_organization;
        setDomain(currentOrganization?.domain_name); 
        setCurrentOrganization(currentOrganization); 
        navigate("/login");
      } else {
        setError("Failed to fetch organization details.");
      }
    } catch (err) {
      console.error("Error fetching organization details:", err);
      setError("Failed to fetch organization details.");
    }
  };


  useEffect(() => {
    if (selectedDomain || !newDomain.trim()) {
      setSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      handleDomainSearch(newDomain);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [newDomain, selectedDomain]);

  const handleDomainSelect = (domainName) => {
    setNewDomain(domainName);
    setSearchResults([]); 
    setSelectedDomain(true); 
  };

  const handleInputChange = (value) => {
    setNewDomain(value);
    setSelectedDomain(false);
  };

  return (
    <section className="overflow-hidden">
      <div>
        <div className="row">
          <div className="col-lg-12 grid-content-domain position-relative">
            <div className="card--position">
              <div className="text-center">
                <img
                  src={logoPath()?.product_logo}
                  alt=" logo"
                  className="logo-image-svg"
                />
              </div>

              <div className="card form-card02">
                <p className="yourtTrust">
                  Your Trustworthy <br /> <span>Compliance Companion!</span>
                </p>
                <div className="auth-log">
                  <div className="d-flex flex-column">
                    <div className="input-wrap position-relative d-flex">
                      <input
                        type="text"
                        id="domain_name"
                        name="domain_name"
                        value={newDomain}
                        className={`form--input domain-name-input`}
                        placeholder=""
                        onChange={(e) => handleInputChange(e.target.value)}
                      />
                      <label htmlFor="domain_name" className="form-label">
                        Domain Name
                      </label>
                      <span
                        className="input-group-text domain-email"
                        id="basic-addon2"
                      >
                        .stackflo.sq1.security
                      </span>
                    </div>

                    {loading && <p>Loading...</p>}
                    {searchResults.length > 0 && !selectedDomain && (
                      <ul className="list-group">
                        {searchResults.map((domain) => (
                          <li
                            key={domain?.id}
                            onClick={() =>
                              handleDomainSelect(domain?.domain_name)
                            }
                            className="list-group-item list-group-item-action bg-info"
                          >
                            {domain?.domain_name}
                          </li>
                        ))}
                      </ul>
                    )}

                    {error && <p className="text-danger">{error}</p>}

                    <div>
                      <button
                        type="submit"
                        className="btn btn-auth py-2 mt-3"
                        onClick={() => handleOrganizationDomainClick()}
                      >
                        Go...
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <img
              src={logoPath()?.sq1_poweredby}
              className="powered-by-sq1"
              alt="Sq1-logo"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingPage;
