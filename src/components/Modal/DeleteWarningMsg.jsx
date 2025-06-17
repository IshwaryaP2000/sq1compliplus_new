import { OverlayTrigger, Tooltip } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { TrashIcon } from "../Icons/Icons";
import { TriangleExclamationIcon } from "../Icons/Icons";

function WarningMsg({
  handleShowDelete,
  dataId,
  handleCloseDelete,
  showDelete,
  handleDelete,
}) {
  return (
    <>
      <OverlayTrigger overlay={<Tooltip id="tooltip-delete">Delete</Tooltip>}>
        <button
          className="btn btn-sm px-lg-3 py-0  "
          onClick={() => handleShowDelete(dataId)}
        >
          <TrashIcon className="text-danger" />
        </button>
      </OverlayTrigger>

      <Modal show={showDelete} onHide={handleCloseDelete} centered>
        <Modal.Body className="p-4">
          <div className="text-center">
            <div className="mb-3">
              <div className="warning-icon-wrapper">
                <TriangleExclamationIcon />
              </div>
            </div>
            <h5 className="fw-bold mb-2 text-muted">Delete Pre-approved</h5>
            <p className="mb-2">
              You're going to <span className="fw-bold">"Delete this"</span>
              Pre-approved vendor. Are you sure?
            </p>
          </div>
        </Modal.Body>
        <div className="d-flex justify-content-center mb-3 gap-4">
          <Button
            onClick={handleCloseDelete}
            className="bg-light border-1 text-dark px-4"
            style={{ borderColor: "#cccc" }}
          >
            No, Keep it
          </Button>
          <Button variant="danger" onClick={handleDelete} className="px-4">
            Yes, Delete!
          </Button>
        </div>
      </Modal>
    </>
  );
}

export default WarningMsg;
