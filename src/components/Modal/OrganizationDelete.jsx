import { useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { deleteApi } from "../../services/apiService";
import { BanIcon, TrashIcon, TriangleExclamationIcon } from "../Icons/Icons";
import DeleteModal from "./DeleteModal";

function OrganizationDelete({ dataId, title, data, fetchAllOrganizations }) {
  const [showDelete, setShowDelete] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

  const handleCloseDelete = () => {
    setShowDelete(false);
    setIdToDelete(null);
  };

  const handleShowDelete = (userId) => {
    setShowDelete(true);
    setIdToDelete(userId);
  };

  const handleDelete = async () => {
    try {
      if (!idToDelete) return;
      await deleteApi(`/organization-delete/${idToDelete}`);
      fetchAllOrganizations();
      handleCloseDelete();
    } catch (error) {
      console.error("Error deleting organization:", error);
    }
  };

  return (
    <>
      {data?.level !== 1 ? (
        <OverlayTrigger overlay={<Tooltip id="tooltip-delete">Delete</Tooltip>}>
          <button
            className="btn btn-sm tableborder-right"
            onClick={() => handleShowDelete(dataId)}
          >
            <TrashIcon />
          </button>
        </OverlayTrigger>
      ) : (
        <OverlayTrigger overlay={<Tooltip id="tooltip-banned">Delete</Tooltip>}>
          <span className="d-inline-block tableborder-right">
            <button className="btn btn-sm  py-1 mt-1 border-0 " disabled>
              <BanIcon />
            </button>
          </span>
        </OverlayTrigger>
      )}

      <Modal show={showDelete} onHide={handleCloseDelete} centered>
        <Modal.Body className="p-4">
          {/* <div className="text-center">
            <div className="mb-3">
              <div className="warning-icon-wrapper">
                <TriangleExclamationIcon />
              </div>
            </div>
            <h5 className="fw-bold mb-2 text-muted">Delete {title}</h5>
            <p className="mb-2">
              You're going to <span className="fw-bold">"Delete this" </span>
              {title}. Are you sure?
            </p>
          </div> */}
          <DeleteModal msg={title}/>
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

export default OrganizationDelete;
