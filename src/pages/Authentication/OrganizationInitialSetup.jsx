import OrganizationInfo from "../../components/Organization/OrganizationInfo";
import { getCurrentOrganization, logoPath } from "../../utils/UtilsGlobalData";
import { useNavigate } from "react-router-dom";
import usePageTitle from "../../utils/usePageTitle";
import Logo from "../../components/Logo/Logo";

const OrganizationInitialSetup = () => {
  usePageTitle("Setup Organization");
  const navigate = useNavigate();
  const organization = getCurrentOrganization();

  return (
    <section className="overflow-hidden">
      <div>
        <div className="row">
          {/* Left Section */}
          <div className="col-lg-5 grid-content02 position-relative">
            <div className="card--position">
              <div className="text-center">
                {/* <img
                  src={logoPath()?.product_logo}
                  alt="Stackflo Logo"
                  className="logo-image-svg"
                /> */}
                <Logo />
              </div>
              <div className="card form-card02">
                <p className="yourtTrust">
                  Your Trustworthy <br /> <span>Compliance Companion!</span>
                </p>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="col-lg-7 grid-content position-relative">
            <div className="bg-color-gradiend"></div>
            <div className="text-center">
              <img
                src={logoPath()?.client_logo}
                alt="Logo"
                className="logo-image-upload"
              />
            </div>
            <div className="d-flex justify-content-center">
              <div className="card form-card-022 w-75">
                <h2 className="form-heading mb-3 fs-22">Organization Info</h2>
                <p className="gray-block fs-16 text-center mb-3">
                  Please Register your account
                </p>

                {/* Organization Information Section */}
                <div className="auth-log">
                  <OrganizationInfo organization={organization} />

                  <button
                    type="button"
                    className="btn skip-btn float-end"
                    onClick={() => navigate("/dashboard")}
                  >
                    Skip
                    <img src="../images/vector-left.svg" alt="Vector Icon" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-color-gradiend-02"></div>
            <div>
              <img
                src={logoPath()?.sq1_poweredby}
                className="powered-by-sq1"
                alt="Powered by SQ1 Logo"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OrganizationInitialSetup;
