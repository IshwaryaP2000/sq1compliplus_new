import { useState } from "react";
import Modal from "react-bootstrap/Modal";
import { CircleinfoIcon } from "../Icons/Icons";

function GoogleInstruction() {
  const [show, setShow] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  const handleNext02 = () => {
    if (currentStep < stepsgoogle.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const stepsgoogle = [
    <div>
      <div className="row">
        <div className="col-md-6 multi-stepform">
          <p className="">
            NOTE : If you have an existing Google app you can skip this
          </p>
          <ul>
            <li>
              To work our Google social login we need to create Google App and
              get the credentials.
            </li>
            <li> To register log in into the Google Developers Console</li>
            <li>
              As you can see there is a pop-up box. Just check the
              <b>Terms of service</b> then click<b> Agree and Continue.</b>
            </li>
          </ul>
        </div>
        <div className="col-md-6 multi-stepform">
          <img
            src="../images/google-sso/google_1 (1).png"
            alt="google step 1"
            className="img-fluid mb-3"
          />
        </div>
      </div>
    </div>,
    <div>
      <div className="row">
        <div className="col-md-6 multi-stepform">
          <img
            src="../images/google-sso/google_2.png"
            alt="google step 1"
            className="img-fluid mb-3"
          />
          <p className="">
            NOTE : If you have an existing Project you can skip this
          </p>
          <ul>
            <li>
              Click the <b>Create Project</b> to continue.
            </li>
          </ul>
        </div>
        <div className="col-md-6 multi-stepform">
          <img
            src="../images/google-sso/google_3.png"
            alt="google step 1"
            className="img-fluid mb-3"
          />
          <p className="">
            NOTE : If you have an existing Project you can skip this
          </p>
          <ul>
            <li>
              You can now input your project name and organization (you can set
              it as No organization) then click <b>CREATE.</b>
            </li>
          </ul>
        </div>
      </div>
    </div>,
    <div>
      <div className="row">
        <div className="col-md-6 multi-stepform">
          <img
            src="../images/google-sso/google_5.png"
            alt="google step 1"
            className="img-fluid mb-3"
          />
          <ul>
            <li>
              Click the <b>Credentials</b> after creating the project or the
              selected project.
            </li>
            <li>
              Click <b>+ CREATE CREDENTIALS</b> button.
            </li>
            <li>
              Click<b> OAuth client ID.</b>
            </li>
          </ul>
        </div>
        <div className="col-md-6 multi-stepform">
          <img
            src="../images/google-sso/google_6.png"
            alt="google step 1"
            className="img-fluid mb-3"
          />
          <ul>
            <li>
              Click the <b>CONFIGURE CONSENT SCREEN.</b>
            </li>
          </ul>
        </div>
      </div>
    </div>,
    <div>
      <div className="row">
        <div className="col-md-6 multi-stepform">
          <img
            src="../images/google-sso/google_7.png"
            alt="google step 1"
            className="img-fluid mb-3"
          />
          <ul>
            <li>
              If your account is new you need to finish the OAuth consent screen
              and provide the important details they ask for.
            </li>
            <li>
              You can now add the <b>App Name</b> that shoulb be displayed for
              Users while signing in and a Contact email
            </li>
            <li>
              Now you can add <b>App logo</b> if you wish
            </li>
            <li>
              Finally you should add <b>Developer contact information</b> email
              for google to notify you on any changes
            </li>
          </ul>
        </div>
        <div className="col-md-6 multi-stepform">
          <img
            src="../images/google-sso/google_8.png"
            alt="google step 1"
            className="img-fluid mb-3"
          />
          <ul>
            <li>
              Once the consent is finished then we will go back to the
              Credentials.
            </li>
          </ul>
        </div>
      </div>
    </div>,
    <div>
      <div className="row">
        <div className="col-md-6 multi-stepform">
          <img
            src="../images/google-sso/google_10.png"
            alt="google step 1"
            className="img-fluid mb-3"
          />
          <p>Create OAuth Client ID</p>
          <ul>
            <li>
              Click +<b>CREATE CREDENTIALS</b> button.
            </li>
            <li>
              Click <b>OAuth client ID</b> button.
            </li>
          </ul>
        </div>
        <div className="col-md-6 multi-stepform">
          <img
            src="../images/google-sso/google_11.png"
            alt="google step 1"
            className="img-fluid mb-3"
          />
          <ul>
            <li>
              You can see below there is an option for <b>Application type</b>
              then you need to select <b>Web application.</b> Then set the name
              of your project/product name.
            </li>
            <li>
              You can now enter the mentioned URI <b>http://192.168.6.4</b> in{" "}
              <b>Authorized Javascript origins</b>
            </li>
            <li>
              You can now enter the mentioned URI
              <b>http://192.168.6.4/sso/callback</b> in
              <b>Authorized redirect URI's</b>
            </li>
            <li>
              Click <b>CREATE</b>
            </li>
          </ul>
        </div>
      </div>
    </div>,
    <div>
      <div className="row">
        <div className="col-md-6 multi-stepform">
          <img
            src="../images/google-sso/google_12.png"
            alt="google step 1"
            className="img-fluid mb-3"
          />
        </div>
        <div className="col-md-6 multi-stepform">
          <ul>
            <li>
              On upon successfull creation a pop-up box will be displayed with
              your project credentials.
            </li>
            <li>
              Click <b>DOWNLOAD JSON</b> to have a copy of your credentials
            </li>
            <li>
              Input <b>client_id</b> and <b>client_secret</b> from that file
              into the application
            </li>
            <li>You will find a new secret created below</li>
            <li>
              Make sure to take a copy the value, since it will not be displayed
              for long time
            </li>
            <li>Enter the copied value into Client Secret </li>
          </ul>
        </div>
      </div>
    </div>,
    <div>
      <div className="row">
        <div className="col-md-6 multi-stepform">
          <img
            src="../images/google-sso/google_1.png"
            alt="google step 1"
            className="img-fluid mb-3"
          />
        </div>
        <div className="col-md-6 multi-stepform"></div>
      </div>
    </div>,
  ];

  return (
    <>
      <CircleinfoIcon
        className="text-primary ms-2 align-content-center"
        onClick={handleShow}
      />

      <Modal
        show={show}
        size="lg"
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Google setup Step:{currentStep + 1}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{stepsgoogle[currentStep]}</Modal.Body>
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
                currentStep === stepsgoogle.length - 1
                  ? handleClose
                  : handleNext02
              }
            >
              {currentStep === stepsgoogle.length - 1 ? "Finish" : "Next"}
            </button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default GoogleInstruction;
