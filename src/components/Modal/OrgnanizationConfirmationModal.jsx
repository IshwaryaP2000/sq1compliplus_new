import { useState } from "react";
import { Button, Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import { postApi, getApi } from "../../services/apiService";
import ButtonWithLoader from "../Button/ButtonLoader";
import { BanIcon, RepeatIcon } from "../Icons/Icons";
import EnableDisableModal from "./EnableDisableModal";

function OrganizationConfirmationModal({ data, fetchAllOrganizations }) {
  const [isLoading, setIsLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [actionType, setActionType] = useState(null);
  const handleClose = () => setShow(false);

  const handleShow = (action) => {
    setActionType(action);
    setShow(true);
  };

  const resendOrgInfo = async (id) => {
    try {
      setIsLoading(true);
      const payload = {
        organization_id: id,
      };
      await postApi(`organization-resent`, payload);
      fetchAllOrganizations();
    } catch (err) {
      console.error("Error in resendOrgInfo:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const actionUser = async (orgId, orgStatus) => {
    try {
      setIsLoading(true);
      const newStatus = orgStatus === "active" ? "inactive" : "active";
      await getApi(
        `organization-change-status?status=${newStatus}&id=${orgId}`
      );
      fetchAllOrganizations();
    } catch (err) {
      console.error("Error in actionUser:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div>
        {data?.level !== 1 ? (
          <OverlayTrigger
            overlay={
              <Tooltip id="tooltip-disabled">
                {data?.status === "active" ? "Enable" : "Disable"}
              </Tooltip>
            }
          >
            <button
              onClick={() => handleShow("action")}
              className="btn btn-sm tableborder-right my-1 "
            >
              <i
                className={
                  data?.status === "active"
                    ? "fa-solid fa-users-slash text-danger"
                    : "fa-solid fa-users text-success"
                }
              ></i>
            </button>
          </OverlayTrigger>
        ) : (
          <OverlayTrigger
            overlay={<Tooltip id="tooltip-banned">Enable/Disable</Tooltip>}
          >
            <span className="d-inline-block tableborder-right">
              <button className="btn btn-sm  py-1 mt-1 border-0 " disabled>
                <BanIcon />
              </button>
            </span>
          </OverlayTrigger>
        )}

        {data?.status === "invited" || data?.status === "resent_invited" ? (
          <OverlayTrigger
            overlay={<Tooltip id="tooltip-disabled">Resend Invite</Tooltip>}
          >
            <span className="d-inline-block">
              <button
                className="btn btn-sm py-0 my-1 tableborder-right"
                onClick={() => handleShow("resend")}
                disabled={false}
              >
                <RepeatIcon />
              </button>
            </span>
          </OverlayTrigger>
        ) : (
          <OverlayTrigger
            overlay={<Tooltip id="tooltip-banned">Resend</Tooltip>}
          >
            <span className="d-inline-block tableborder-right">
              <button className="btn btn-sm  py-1 mt-1 border-0 " disabled>
                <BanIcon />
              </button>
            </span>
          </OverlayTrigger>
        )}
      </div>

      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Body className=" m-0 p-3 text-center">
          {actionType === "resend" && (
            <h5>
              Are you sure you want to resend the invitation to this user?
            </h5>
          )}
          {actionType === "delete" && (
            <h5>Are you sure you want to delete this user?</h5>
          )}
          {actionType === "action" && (
            // <h5>
            //   Are you sure you want to
            //   {data?.status === "active" ? "enable" : "disable"} this user?
            // </h5>
            <EnableDisableModal status={data?.status} msg="user" />
          )}
        </Modal.Body>
        <Modal.Footer className="justify-content-center border-0 m-0 p-2">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            className="primary-btn"
            variant={actionType === "delete" ? "danger" : "green"}
            onClick={() => {
              if (actionType === "resend") {
                resendOrgInfo(data.id);
              } else if (actionType === "delete") {
              } else if (actionType === "action") {
                actionUser(data?.id, data?.status);
              }
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              actionType === "delete" ? (
                <ButtonWithLoader name="" />
              ) : actionType === "resend" ? (
                <ButtonWithLoader name="" />
              ) : (
                <ButtonWithLoader name="" />
              )
            ) : actionType === "delete" ? (
              "Delete"
            ) : actionType === "resend" ? (
              "Resend"
            ) : (
              "Proceed"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default OrganizationConfirmationModal;
