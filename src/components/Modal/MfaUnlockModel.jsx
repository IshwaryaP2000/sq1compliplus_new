import { useState } from "react";
import { Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import { postApi } from "../../services/apiService";
import { logout } from "../../utils/UtilsGlobalData";
import { useNavigate } from "react-router-dom";
import { BanIconNotallowed, QrcodeIcon } from "../Icons/Icons";

function MfaUnlockModel({ data }) {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleMfaAccept = async () => {
    const payload = { user_id: data?.id };
    try {
      await postApi(`mfa-regenerate`, payload);
      handleClose();
      logout();
      navigate("/login");
    } catch (err) {
      console.error("Error in mfa unlock:", err);
    }
  };

  return (
    <>
      {data?.status === "mfa_request" ? (
        <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">Mfa</Tooltip>}>
          <span className="d-inline-block">
            <button className="btn btn-sm py-0 my-1 mt-2" onClick={handleShow}>
              <QrcodeIcon />
            </button>
          </span>
        </OverlayTrigger>
      ) : (
        <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">Mfa</Tooltip>}>
          <span className="d-inline-block not-allowed">
            <button className="btn btn-sm py-0 my-1 mt-2 not-allowed">
              <BanIconNotallowed />
            </button>
          </span>
        </OverlayTrigger>
      )}

      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Unlock Mfa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <b>Reason :</b>
          {data?.mfa_request_content
            ? data.mfa_request_content
            : "No reason found"}
        </Modal.Body>
        <div className="border-0 text-center p-3">
          <button className="primary-btn" onClick={handleMfaAccept}>
            Proceed
          </button>
        </div>
      </Modal>
    </>
  );
}

export default MfaUnlockModel;
