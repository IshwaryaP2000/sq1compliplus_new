import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Offcanvas from "react-bootstrap/Offcanvas";
import Accordion from "react-bootstrap/Accordion";
import { end } from "@popperjs/core";
import { getApi } from "../../services/apiService";
import { getCurrentUser, logoPath } from "../../utils/UtilsGlobalData";
import usePageTitle from "../../utils/usePageTitle";
import { Logo } from "../../components/Logo/Logo";

const MFAQr = () => {
  usePageTitle("MFA QR");
  const [qrImg, setQrImg] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const svgDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(qrImg)}`;

  useEffect(() => {
    const fetchQRCode = async () => {
      try {
        const response = await getApi("qrcode");
        setQrImg(response?.data?.data?.qr_image);
        setQrCode(response?.data?.data?.qr_code);
      } catch (err) {
        console.error("Error fetching QR code:", err);
      }
    };

    if (
      getCurrentUser()?.user_status === "registered" ||
      getCurrentUser()?.user_status === "mfa_accepted"
    ) {
      fetchQRCode();
    }
  }, []);

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
            <div className="text-center">
              <img
                src={logoPath()?.client_logo}
                alt=" logo"
                className="logo-image-upload"
              />
            </div>
            <div className="d-flex justify-content-center">
              <div className="card form-card w-75">
                <p className="authenticator-p text-center mb-3">
                  Open up your google authenticator or microsoft authenticator
                  mobile app and scan the following QR code
                </p>

                <p className="help-link-cont mb-2">
                  <Link
                    to="#"
                    className="text-decoration-none  help-link-cont"
                    onClick={handleShow}
                  >
                    Need Help?
                  </Link>
                </p>

                <div className="text-center">
                  {qrImg ? (
                    <img src={svgDataUrl} className="mb-2" alt="Organization" />
                  ) : (
                    <p>Loading...</p>
                  )}
                </div>
                <p className="fs-18 text-center mb-4">
                  If your 2FA mobile app does not support QR code then enter in
                  the following number:
                  <span className="mfq-name-span"> {qrCode} </span>
                </p>

                <Link
                  className="btn btn-auth py-2 mb-3"
                  to="/authentication/mfa-verify"
                >
                  Next
                </Link>
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
      <Offcanvas show={show} onHide={handleClose} placement={end}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Configure Mobile App</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Accordion>
            <Accordion.Item eventKey="0">
              <Accordion.Header>
                Microsoft Authenticator Configuration
              </Accordion.Header>
              <Accordion.Body>
                <>
                  <div>
                    <p>
                      Complete the following steps to configure your mobile app
                    </p>
                    <ol>
                      <li>
                        Install the Microsoft authenticator app for Windows
                        Phone, Android or iOS.
                      </li>
                      <li>
                        In the app, add an account and choose "Work or school
                        account".
                      </li>
                      <li>Scan the image below.</li>
                    </ol>

                    <div className="text-center">
                      {qrImg ? (
                        <img
                          src={svgDataUrl}
                          className="mb-2"
                          alt="Organization"
                        />
                      ) : (
                        <p>Loading...</p>
                      )}
                    </div>

                    <p>
                      If you are unable to scan the image, enter the following
                      information in your app.
                    </p>
                    <p>
                      Code: <span className="mfq-name-span">{qrCode}</span>
                    </p>
                    <p>If the app displays a six-digit code, you are done!</p>
                    <img
                      src="../images/mfa-guide-1.png"
                      alt="google step 1"
                      className="img-fluid mb-3"
                    />
                  </div>
                </>
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="1">
              <Accordion.Header>
                Google Authenticator Configuration
              </Accordion.Header>
              <Accordion.Body>
                <>
                  <div>
                    <p>
                      Complete the following steps to configure your mobile app
                    </p>
                    <ol>
                      <li>
                        Install the Google authenticator app for Windows Phone,
                        Android or iOS.
                      </li>
                      <li>
                        In the app, tap the "Plus Button" and select "Scan a
                        Barcode"
                      </li>
                      <li>Scan the image below.</li>
                    </ol>

                    <div className="text-center">
                      {qrImg ? (
                        <img
                          src={svgDataUrl}
                          className="mb-2"
                          alt="Organization"
                        />
                      ) : (
                        <p>Loading...</p>
                      )}
                    </div>

                    <p>
                      If you are unable to scan the image, enter the following
                      information in your app.
                    </p>
                    <p>
                      Code: <span className="mfq-name-span">{qrCode}</span>
                    </p>
                    <p>If the app displays a six-digit code, you are done!</p>
                    <img
                      src="../images/mfa-guide-2.png"
                      alt="google step 1"
                      className="img-fluid mb-3"
                    />
                  </div>
                </>
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="2">
              <Accordion.Header>Download App</Accordion.Header>
              <Accordion.Body>
                <p>Get the link via message to download the mobile app.</p>
                <p>
                  Open <strong>playstore</strong> or <strong>Appstore</strong>
                  in your moblie and search google Authenticator or Microsoft
                  Authenticator.
                </p>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </Offcanvas.Body>
      </Offcanvas>
    </section>
  );
};

export default MFAQr;
