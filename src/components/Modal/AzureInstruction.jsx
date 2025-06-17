import { useState } from "react";
import Modal from "react-bootstrap/Modal";

function AzureInstruction() {
  const [show, setShow] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  const handleNext02 = () => {
    if (currentStep < stepsazur.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const stepsazur = [
    <div>
      <div className="row">
        <div className="col-md-6 multi-stepform">
          <h5>How to configure SSO authentication for your organization ?</h5>
          <p className="">
            <i className="fa-regular fa-circle-dot me-2"></i>the below mentioned
            steps to configure
          </p>
          <ul>
            <li>
              
              Sign into the Azure Active Directory portal using your Buisness
              account or Official account
            </li>
            <li>
              
              On successfull sign in you will find the below displayed image.
            </li>
            <li>Select Azure Active Directory</li>
          </ul>
        </div>
        <div className="col-md-6 multi-stepform">
          <img
            src="../images/azure-sso/AD_Home.png"
            alt="azure step 1"
            className="img-fluid mb-3"
          />
        </div>
      </div>
    </div>,
    <div>
      <div className="row">
        <div className="col-md-6 multi-stepform">
          <img
            src="../images/azure-sso/AD_AppReg_navigate.png"
            alt="google step 1"
            className="img-fluid mb-3"
          />
        </div>
        <div className="col-md-6 multi-stepform">
          <img
            src="../images/azure-sso/AD_AppReg_Home.png"
            alt="google step 1"
            className="img-fluid mb-3"
          />
        </div>
      </div>
    </div>,
    <div>
      <div className="row">
        <div className="col-md-6 multi-stepform">
          <p className="">Register an Application</p>
          <ul>
            <li>Enter a display name for your application.</li>
            <li>
              
              Select <b>Account is organizational directory</b> to make sure
              only the users in your organization can access the application
            </li>
            <li>
              
              Select <b>Web</b> as the platform under Redirect URI
            </li>
            <li>
              
              Enter the provided <b>http://192.168.6.4auth/sso</b> redirect URI
            </li>
            <li>
              
              Select <b>Register.</b>
            </li>
          </ul>
        </div>
        <div className="col-md-6 multi-stepform">
          <img
            src="../images/azure-sso/AD_Appregister.png"
            alt="azure step 1"
            className="img-fluid mb-3"
          />
        </div>
      </div>
    </div>,
    <div>
      <div className="row">
        <div className="col-md-6 multi-stepform">
          <p className="">
            <i className="fa-regular fa-circle-dot me-2"></i>Below you will find
            the application created
          </p>
          <ul>
            <li> Copy Directory (tenant) ID and paste into Tenant ID input</li>
            <li>
              
              Copy Application (client) ID and paste into Application ID input
            </li>
          </ul>
        </div>
        <div className="col-md-6 multi-stepform">
          <img
            src="../images/azure-sso/AD_AppHome.png"
            alt="azure step 1"
            className="img-fluid mb-3"
          />
        </div>
      </div>
    </div>,
    <div>
      <div className="row">
        <div className="col-md-6 multi-stepform">
          <p className="">Create Client secret</p>
          <ul>
            <li>
              Search and Select <b>Certificates & Secrets</b>
            </li>
            <li>
              
              Search and Select <b>Client secrets</b>
            </li>
            <li>
              
              Select <b>New client secret</b>
            </li>
            <li> Add description</li>
            <li>
              
              Select expires as <b>365 days (12 months)</b>
            </li>
          </ul>
        </div>
        <div className="col-md-6 multi-stepform">
          <img
            src="../images/azure-sso/AD_CS_Create.png"
            alt="azure step 1"
            className="img-fluid mb-3"
          />
        </div>
      </div>
    </div>,
    <div>
      <div className="row">
        <div className="col-md-6 multi-stepform">
          <p className="">Add client secret</p>
          <ul>
            <li> You will find a new secret created below</li>
            <li>
              
              Make sure to take a copy the value, since it will not be displayed
              for long time
            </li>
            <li> Enter the copied value into Client Secret</li>
          </ul>
        </div>
        <div className="col-md-6 multi-stepform">
          <img
            src="../images/azure-sso/AD_CS_Home.png"
            alt="azure step 1"
            className="img-fluid mb-3"
          />
        </div>
      </div>
    </div>,
    <div>
      <div className="row">
        <div className="col-md-6 multi-stepform">
          <img
            src="../images/azure-sso/AD_CS_Home.png"
            alt="azure step 1"
            className="img-fluid mb-3"
          />
        </div>
        <div className="col-md-6 multi-stepform"></div>
      </div>
    </div>,
  ];

  return (
    <>
      <i
        className="fa-solid fa-circle-info text-primary ms-2 align-content-center"
        onClick={handleShow}
      ></i>

      <Modal
        show={show}
        size="lg"
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Azure setup Step:{currentStep + 1}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{stepsazur[currentStep]}</Modal.Body>
        <Modal.Footer>
          <div className="d-flex justify-content-end mt-4">
            <button
              className={`btn btn-secondary mx-2 ${
                currentStep === 0 ? "disabled" : ""
              }`}
              onClick={handlePrev}
            >
              Prev
            </button>

            <button
              type="submit"
              className="btn btn-sm primary-btn w-auto"
              onClick={
                currentStep === stepsazur.length - 1
                  ? handleClose
                  : handleNext02
              }
            >
              {currentStep === stepsazur.length - 1 ? "Finish" : "Next"}
            </button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AzureInstruction;
