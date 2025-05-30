import  { useState } from "react";
import { Button, Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import { postApi } from "../../services/apiService";
import { toast } from "react-toastify";
import ButtonWithLoader from "../Button/ButtonLoader";
import { BanIconNotallowed, RepeatIcon, TrashIcon, TriangleExclamationIcon } from "../Icons/Icons";

function ConfirmationModel({
  data,
  type,
  fetchAllUser,
  userId,
  orgId,
  getUserOrg,
  readinessData,
  GetQuestions,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [actionType, setActionType] = useState(null);

  const handleClose = () => setShow(false);
  const handleShow = (action) => {
    setActionType(action);
    setShow(true);
  };

  const handleDelete = async () => {
    try {
      const payload = {
        id: userId,
        org_id: orgId?.id,
        type: "organization",
      };
      await postApi("user-delete", payload);
      getUserOrg();
      handleClose();
    } catch (err) {
      console.error("Error in handleDelete:", err);
    }
  };
  
  const handleDeleteReadiness = async () => {
    try {
      const payload = {
        question_id: readinessData?.id,

        type: "main",
      };
      await postApi("delete-question", payload);
      GetQuestions();
      handleClose();
    } catch (err) {
      console.error("Error in handleDelete:", err);
      toast.error("Error while remove the question");
    }
  };

  const resendUser = async (userId) => {
    setIsLoading(true);
    try {
      await postApi("user-resent", { user_id: userId });
      handleClose();
    } catch (err) {
      console.error("Error in resendUser:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (id) => {
    try {
      setIsLoading(true);
      await postApi(`user-delete`, { id });
      fetchAllUser();
      handleClose();
    } catch (err) {
      console.error("Error in deleteUser:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const actionUser = async (userId, userStatus) => {
    try {
      setIsLoading(true);
      const payload = {
        id: userId,
        status: userStatus,
      };
      await postApi(`user-change-status`, payload);
      fetchAllUser();
    } catch (err) {
      console.error("Error in removeOrganization:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div>
        {type === "User" && (
          <>
            <OverlayTrigger
              overlay={
                <Tooltip id="tooltip-disabled">
                  {data?.status === "active" ? "Enable" : "Disable"}
                </Tooltip>
              }
            >
              <button
                onClick={() => handleShow("action")}
                className="btn btn-sm tableborder-right my-1"
              >
                <i
                  className={
                    data?.status === "active"
                      ? "fa-solid fa-user-check text-success"
                      : "fa-solid fa-user-xmark text-danger"
                  }
                ></i>
              </button>
            </OverlayTrigger>

            {data?.status === "invited" || data?.status === "resent_invited" ? (
              <OverlayTrigger
                overlay={<Tooltip id="tooltip-resend">Resend Invite</Tooltip>}
              >
                <span className="tableborder-right ">
                  <button
                    className="btn btn-sm my-1"
                    onClick={() => handleShow("resend")}
                  >
                    <i
                      className={
                        data?.status === "invited"
                          ? <RepeatIcon/>
                          : "fa-solid fa-repeat not-allowed"
                      }
                    ></i>
                  </button>
                </span>
              </OverlayTrigger>
            ) : (
              <OverlayTrigger
                overlay={<Tooltip id="tooltip-resend">Resend</Tooltip>}
              >
                <span className="tableborder-right ">
                  <button className="btn btn-sm my-1">
                    <BanIconNotallowed/>
                  </button>
                </span>
              </OverlayTrigger>
            )}

            <OverlayTrigger
              overlay={<Tooltip id="tooltip-delete">Delete</Tooltip>}
            >
              <button
                className="btn btn-sm py-0 my-1 tableborder-right"
                onClick={() => handleShow("delete")}
              >
               <TrashIcon/>
              </button>
            </OverlayTrigger>
          </>
        )}

        {type === "UserOrganization" && (
          <OverlayTrigger
            overlay={
              <Tooltip id="tooltip-disabled">Remove organization</Tooltip>
            }
          >
            <div className="users-crud">
              <button
                className="btn btn-sm py-0 my-1"
                onClick={() => handleShow("remove")}
              >
                <i className="fa-solid fa-xmark text-danger"></i>
              </button>
            </div>
          </OverlayTrigger>
        )}
        {type === "readiness" && (
          <OverlayTrigger
            overlay={<Tooltip id="tooltip-delete">Delete</Tooltip>}
          >
            <button
              className="btn btn-sm py-0 my-1 "
              onClick={() => handleShow("deleteReadiness")}
            >
              <TrashIcon/>
            </button>
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
        <Modal.Body className="p-3 m-0 text-center">
          {actionType === "resend" && (
            <span>
              Are you sure you want to resend the invitation to this user?
            </span>
          )}
          {actionType === "delete" && (
            <div className="text-center">
              <div className="mb-3">
                <div className="warning-icon-wrapper">
                 <TriangleExclamationIcon/>
                </div>
              </div>
              <h5 className="fw-bold mb-2 text-muted">Delete user?</h5>
              <p className="mb-2">
                You're going to <span className="fw-bold">"Delete this" </span>
                user?. Are you sure?
              </p>
            </div>
          )}
          {actionType === "deleteReadiness" && (
            <div className="text-center">
              <div className="mb-3">
                <div className="warning-icon-wrapper">
                  <TriangleExclamationIcon/>
                </div>
              </div>
              <h5 className="fw-bold mb-2 text-muted">Remove this question?</h5>
              <p className="mb-2">
                You're going to <span className="fw-bold">"Remove this" </span>
                question?. Are you sure?
              </p>
            </div>
          )}
          {actionType === "action" && (
            <span>
              Are you sure you want to{" "}
              {data?.status === "active" ? "disable" : "enable"} this user?
            </span>
          )}
          {actionType === "remove" && (
            <div className="text-center">
              <div className="mb-3">
                <div className="warning-icon-wrapper">
                  <TriangleExclamationIcon/>
                </div>
              </div>
              <h5 className="fw-bold mb-2 text-muted">
                Remove the organization from this user?
              </h5>
              <p className="mb-2">
                You're going to <span className="fw-bold">"Remove this" </span>
                organization from this user?. Are you sure?
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="justify-content-center border-0 m-0 p-2">

          <Button
            onClick={handleClose}
            className="bg-light border-1 text-dark px-4"
            style={{ borderColor: "#cccc" }}
          >
            No, Keep it
          </Button>
          <Button
            className={
              actionType === "delete" || actionType === "deleteReadiness"
                ? null
                : "primary-btn"
            }
            variant={
              actionType === "delete" || actionType === "deleteReadiness"
                ? "danger"
                : "green"
            }
            onClick={() => {
              if (actionType === "resend") {
                resendUser(data.id);
              } else if (actionType === "delete") {
                deleteUser(data.id);
              } else if (actionType === "action") {
                actionUser(data?.id, data?.status);
              } else if (actionType === "remove") {
                handleDelete(data?.id, data?.status);
              } else if (actionType === "deleteReadiness") {
                handleDeleteReadiness(readinessData?.id);
              }
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              actionType === "delete" ? (
                <ButtonWithLoader name="" />
              ) : actionType === "resend" ? (
                <ButtonWithLoader name="" />
              ) : actionType === "action" ? (
                <ButtonWithLoader name="" />
              ) : (
                <ButtonWithLoader name="" />
              )
            ) : actionType === "delete" ? (
              "Yes, Delete!"
            ) : actionType === "resend" ? (
              "Resend"
            ) : actionType === "action" ? (
              "Proceed"
            ) : (
              "Remove"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ConfirmationModel;
