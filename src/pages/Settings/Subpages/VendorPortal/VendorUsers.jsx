import { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Loader } from "../../../../components/Table/Loader";
import { getApi, deleteApi } from "../../../../services/apiService";
import {
  TrashIcon,
  TriangleExclamationIcon,
} from "../../../../components/Icons/Icons";

const VendorUsers = () => {
  const [data, setData] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState(null);

  const handleClose = () => {
    setShow(false);
    setUserIdToDelete(null); // Reset the user ID when closing the modal
  };

  const handleShow = (userId) => {
    setShow(true);
    setUserIdToDelete(userId); // Store the user ID to delete
  };

  const GetUsers = async () => {
    try {
      setIsLoading(true);
      const response = await getApi("/vendor/get-vendor-users");
      setData(response?.data?.data);
    } catch (err) {
      console.error("Error fetching vendor users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const DeleteUser = async () => {
    if (!userIdToDelete) return; // Prevents accidental deletion if no user ID is set
    try {
      await deleteApi(`/vendor/remove-vendor-users/${userIdToDelete}`);
      handleClose();
      GetUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  useEffect(() => {
    GetUsers();
  }, []);

  return (
    <>
      <h5 className="fw-bold mb-0 ms-1 mt-3">
        Users
        {data?.length > 0 && (
          <span className="badge bg-lightgreen-07">{data?.length}</span>
        )}
      </h5>
      <div className=" custom-table tabledata-scroll mb-3">
        <table className="table users-table mb-0 mt-2">
          <thead className="tablescrolling-thead-tr">
            <tr>
              <th scope="col">#</th>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col" className="text-center">
                Status
              </th>
              <th scope="col" className="text-center">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="tablescrolling-tbody">
            {isLoading ? (
              // Array.from({ length: 3 }).map((_, rowIndex) => (
              //   <tr key={rowIndex}>
              //     {Array.from({ length: 5 }).map((_, colIndex) => (
              //       <td key={colIndex}>
              //         <p className="placeholder-glow">
              //           <span className="placeholder col-12 bg-secondary"></span>
              //         </p>
              //       </td>
              //     ))}
              //   </tr>
              // ))
              <Loader rows={3} cols={5} />
            ) : data?.length > 0 ? (
              data?.map((users, index) => (
                <tr key={users?.id || index}>
                  <th scope="row">{index + 1}</th>
                  <td>{users?.name}</td>
                  <td>{users?.email}</td>
                  <td className="text-center">
                    <span
                      className={`badge badge-fixedwidth Capitalize ${
                        users?.status === "active"
                          ? "bg-success2-badge"
                          : "bg-invite-badge"
                      }`}
                    >
                      {users?.status}
                    </span>
                  </td>
                  <td className="text-center">
                    <div className="users-crud d-flex m-auto">
                      <OverlayTrigger
                        overlay={
                          <Tooltip id="tooltip-disabled">Delete</Tooltip>
                        }
                      >
                        <button
                          className="btn btn-sm px-lg-3 my-1"
                          onClick={() => handleShow(users?.id)}
                        >
                          <TrashIcon className="text-danger" />
                        </button>
                      </OverlayTrigger>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
                  No Users Available
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Modal show={show} onHide={handleClose} centered>
          <Modal.Body className="p-4">
            <div className="text-center">
              <div className="mb-3">
                <div className="warning-icon-wrapper">
                  <TriangleExclamationIcon />
                </div>
              </div>
              <h5 className="fw-bold mb-2 text-muted">Delete User</h5>
              <p className="mb-2">
                You're going to <span className="fw-bold">"Delete this"</span>
                user. Are you sure?
              </p>
            </div>
          </Modal.Body>
          <div className="d-flex justify-content-center mb-3 gap-4">
            <Button
              onClick={handleClose}
              className="bg-light border-1 text-dark px-4"
              style={{ borderColor: "#cccc" }}
            >
              No, Keep it
            </Button>
            <Button
              variant="danger"
              onClick={DeleteUser}
              className="px-4"
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Yes, Delete!"}
            </Button>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default VendorUsers;
