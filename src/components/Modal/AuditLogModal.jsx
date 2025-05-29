import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { JSONTree } from "react-json-tree";
import { TbFileDatabase } from "react-icons/tb";

function AuditLogModal({ show, handleClose, logDetails }) {
  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton className="fw-bold">
        <Modal.Title>
          <TbFileDatabase /> Audit Log Details
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <>
          <div className="row">
            <div className="col-6">
              <label>Old Values</label>
              {logDetails?.old_values ? (
                <JSONTree
                  data={logDetails?.old_values}
                  theme="monokai"
                  hideRoot={true}
                  invertTheme={false}
                />
              ) : (
                <></>
              )}
            </div>
            <div className="col-6">
              <label>New Values</label>
              {logDetails?.new_values ? (
                <JSONTree
                  data={logDetails?.new_values}
                  theme="monokai"
                  hideRoot={true}
                  invertTheme={false}
                />
              ) : (
                <></>
              )}
            </div>
          </div>
        </>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" className="sm" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default AuditLogModal;
