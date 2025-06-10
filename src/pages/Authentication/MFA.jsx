import { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import { postApi } from "../../services/apiService";
import { Link, useNavigate } from "react-router-dom";
import Logout from "./Logout";
import { logout } from "../../utils/UtilsGlobalData";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { useAuthOrganization } from "../../Hooks/OrganizationUserProvider";
import { toast } from "react-toastify";
import usePageTitle from "../../utils/usePageTitle";
import { PoweroffIcon } from "../../components/Icons/Icons";
import { Logo } from "../../components/Logo/Logo";
import {
  getCurrentUser,
  logoPath,
  setAuthToken,
  setCurrentUser,
} from "../../utils/UtilsGlobalData";

const MFA = () => {
  usePageTitle("MFA-Verify");
  const { organization } = useAuthOrganization();
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const [otp, setOtp] = useState(Array(6).fill(""));
  const inputRefs = useRef([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showLogoutModalMfa, setShowLogoutModalMfa] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    inputRefs.current[0].focus();
  }, [inputRefs]);

  useEffect(() => {
    if (!organization) logout();
  }, [organization]);

  const handleLogoutClick = () => setShowLogoutModal(true);
  const handleLogoutClickMfa = () => setShowLogoutModalMfa(true);
  const handleCloseModal = () => setShowLogoutModal(false);
  const handleCloseModalMfa = () => setShowLogoutModalMfa(false);

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    Logout();
  };

  const handleInputChange_mfa = (e) => setInputValue(e.target.value);

  const handleSkip = async () => {
    try {
      const response = await postApi("/skip-otp");
      setAuthToken(response?.data?.data?.token);
      setCurrentUser(response?.data?.data?.current_organization?.user);

      if (
        organization?.light_logo === null &&
        getCurrentUser().user_role === "admin"
      ) {
        navigate("/organization/initial-setup");
      } else {
        navigate("/dashboard");
      }
    } catch {
      console.error("error");
    }
  };

  const handle_mfa_qr = async (e) => {
    e.preventDefault();
    const payload = {
      mfa_request_content: inputValue,
    };
    try {
      setIsLoading(true);
      await postApi(`mfa-request`, payload);
      setInputValue("");
      logout();
      navigate("/login");
    } catch (err) {
      console.error("Error in submitting data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (event, index) => {
    const value = event.target.value.replace(/[^0-9]/g, ""); // Ensure only numbers
    if (value.length === 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      // Focus the next input
      if (index < 5 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleBackspace = (event, index) => {
    if (event.key === "Backspace") {
      const newOtp = [...otp];

      // If the current input is not empty, clear it
      if (newOtp[index] !== "") {
        newOtp[index] = "";
        setOtp(newOtp);
      }
      // If the current input is empty, move to the previous input
      else if (index > 0) {
        const prevInput = inputRefs.current[index - 1];
        if (prevInput) {
          prevInput.focus();
          newOtp[index - 1] = ""; // Clear the previous input as well
          setOtp(newOtp);
        }
      }
    }
  };

  const formik = useFormik({
    initialValues: {},
    onSubmit: async (_, { setSubmitting }) => {
      try {
        const totp = otp.join("");
        if (totp.length !== 6) {
          toast.error("Please fill out all 6 digits.");
          return;
        }

        const response = await postApi("verify-totp", { totp });
        setAuthToken(response?.data?.data?.token);
        setCurrentUser(response?.data?.data?.current_organization?.user);

        if (
          organization?.light_logo === null &&
          getCurrentUser().user_role === "admin"
        ) {
          navigate("/organization/initial-setup");
        } else {
          navigate("/dashboard");
        }
      } catch (error) {
        console.error(
          error.response?.data?.data?.error || "TOTP failed. Try again."
        );
        setOtp(["", "", "", "", "", ""]);
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <section className="overflow-hidden">
      <div>
        <div className="row">
          <div className="col-lg-5 grid-content02 position-relative">
            <div className="card--position">
              <div className="text-center">
                {/* <img
                  src={logoPath()?.product_logo}
                  alt=" logo"
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
          <div className="col-lg-7 grid-content position-relative">
            <div className="bg-color-gradiend"></div>

            <div className="mfa-logout-btn">
              <OverlayTrigger
                overlay={<Tooltip id="tooltip-disabled">Logout</Tooltip>}
              >
                <span className="d-inline-block">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleLogoutClick();
                    }}
                  >
                    <PoweroffIcon />
                  </a>
                </span>
              </OverlayTrigger>
            </div>
            {showLogoutModal && (
              <div
                className="modal fade show"
                id="logoutModal"
                tabIndex="-1"
                aria-labelledby="logoutModalLabel"
                aria-hidden="true"
                style={{
                  display: "block",
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                }}
              >
                <div className="modal-dialog modal-dialog-centered modal-md">
                  <div className="modal-content">
                    <div className=" p-3">
                      <h5 className="modal-title text-center">
                        Are you sure you want to logout?
                      </h5>
                    </div>
                    <div className="modal-body text-center">
                      <button
                        className="btn btn-danger me-2"
                        onClick={handleLogoutConfirm}
                      >
                        Yes
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={handleCloseModal}
                      >
                        No
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="text-center">
              <img
                src={logoPath()?.client_logo}
                alt=" logo"
                className="logo-image-upload"
              />
              <div className="d-flex justify-content-center">
                <div className="card form-card w-75">
                  <h2 className="form-heading">Enter Verification Code</h2>
                  <form onSubmit={formik.handleSubmit}>
                    <div className="otp-input-fields">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <input
                          key={index}
                          ref={(el) => (inputRefs.current[index] = el)}
                          type="text"
                          maxLength="1"
                          autoFocus={index === 0} // Only autofocus the first input
                          className="otp-digit"
                          value={otp[index]}
                          onChange={(event) => handleInputChange(event, index)}
                          onKeyDown={(event) => handleBackspace(event, index)}
                        />
                      ))}
                    </div>

                    <button
                      type="submit"
                      className="btn btn-auth py-2 mb-3"
                      disabled={formik.isSubmitting}
                    >
                      {formik.isSubmitting ? "Verifying..." : "Verify"}
                    </button>
                  </form>

                  {import.meta.env.VITE_DEV_MODE === "on" ? (
                    <button
                      onClick={handleSkip}
                      className={
                        getCurrentUser()?.user_status === "registered"
                          ? "d-none"
                          : "btn btn-auth py-2 mb-3"
                      }
                    >
                      {formik.isSubmitting ? "Loading..." : "Skip"}
                    </button>
                  ) : (
                    ""
                  )}

                  {getCurrentUser().user_status === "registered" ? (
                    <div className="text-center">
                      If you do not have MFA Scan Code
                      <Link
                        className="mx-1 color-green"
                        to="/authentication/mfa-scan-qr-code"
                      >
                        Get here.
                      </Link>
                    </div>
                  ) : (
                    <div>
                      <p className="fs-18 gray-block  m-auto">
                        If you do not have MFA,
                        <Link
                          to="#"
                          className="mfa-link me-2"
                          onClick={handleLogoutClickMfa}
                        >
                          Click here
                        </Link>
                        to notify the administrator.
                      </p>
                    </div>
                  )}
                  {showLogoutModalMfa && (
                    <div
                      className="modal fade show"
                      id="exampleModal"
                      tabIndex="-1"
                      aria-labelledby="exampleModalLabel"
                      aria-hidden="true"
                      style={{
                        display: "block",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                      }}
                    >
                      <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                          <div className="modal-header">
                            <h5 className="modal-title">
                              Forgot Request MFA
                              <span className="text-danger">*</span>
                            </h5>
                            <button
                              type="button"
                              className="btn-close"
                              data-bs-dismiss="modal"
                              aria-label="Close"
                              onClick={handleCloseModalMfa}
                            ></button>
                          </div>
                          <div className="modal-body">
                            <form onSubmit={handle_mfa_qr}>
                              <div className="mb-3">
                                <textarea
                                  className="form-control"
                                  id="inputData"
                                  value={inputValue}
                                  onChange={handleInputChange_mfa}
                                  placeholder="Comments..."
                                />
                              </div>
                              <div className="text-center">
                                <button
                                  type="submit"
                                  className=" btn btn-auth w-50 "
                                >
                                  {isLoading ? "Requesting..." : "Request"}
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-color-gradiend-02"></div>
              <div>
                <img
                  src={logoPath()?.sq1_poweredby}
                  className="powered-by-sq1"
                  alt="Sq1-logo"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MFA;
