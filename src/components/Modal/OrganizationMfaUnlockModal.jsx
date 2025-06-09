import { useState } from "react";
import { Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import { postApi } from "../../services/apiService";
import { BanIcon, QrcodeIcon } from "../Icons/Icons";

function OrganizationMfaUnlockModal({ data, organizationId }) {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleMfaAccept = async () => {
    const payload = { organization_id: organizationId };
    try {
      await postApi(`mfa-regenerate`, payload);
      handleClose();
    } catch (err) {
      console.error("Error in handleMfaAccept:", err);
    }
  };

  return (
    <>
      {data?.status === "mfa_request" ? (
        <OverlayTrigger
          overlay={<Tooltip id="tooltip-disabled">Mfa Qr Generate</Tooltip>}
        >
          <span className="d-inline-block ">
            <button
              className="btn btn-sm py-1 mt-1 tableborder-right"
              onClick={handleShow}
            >
              <QrcodeIcon />
            </button>
          </span>
        </OverlayTrigger>
      ) : (
        <OverlayTrigger
          overlay={<Tooltip id="tooltip-banned">Mfa Qr Generate</Tooltip>}
        >
          <span className="d-inline-block tableborder-right">
            <button className="btn btn-sm  py-1 mt-1 border-0 " disabled>
              <BanIcon />
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
          <Modal.Title>Unlock MFA</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <b>Reason:</b> {data.mfa_request_content || "No reason found"}
        </Modal.Body>
        <div className="border-0 text-center p-3">
          <button className="btn btn-primary" onClick={handleMfaAccept}>
            Proceed
          </button>
        </div>
      </Modal>
    </>
  );
}

export default OrganizationMfaUnlockModal;
