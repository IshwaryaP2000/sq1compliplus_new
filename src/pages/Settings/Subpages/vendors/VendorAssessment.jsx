import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Modal } from "react-bootstrap";
import { end } from "@popperjs/core";
import Offcanvas from "react-bootstrap/Offcanvas";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import VendorChat from "../../../../components/Modal/VendorChat";
import OverflowTooltips from "../../../../components/Tooltip/OverflowTooltips";
import { getApi, postApi } from "../../../../services/apiService";

const SkeletonLoader = () => (
  <div className={`  mb-3 col-xxl-12`}>
    <div className="card card_custom-a p-0 ">
      <div className="card-body card-body_custom-a py-4 placeholder-glow">
        <div className="d-flex fw-bold ">
          <input
            className={`form-check-input custom-checkbox placeholder bg-secondary me-2`}
            type="checkbox"
          />
          <div className="w-100">
            <div>
              <p
                className="mb-0 pe-xxl-3 pe-2 placeholder bg-secondary"
                style={{ width: "90%" }}
              ></p>
            </div>
          </div>
        </div>
        <div className="ms-xxl-2 ms-xl-4 mt-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <button
              key={index}
              className={`btn vendorbtn-submit placeholder bg-secondary px-5`}
            ></button>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const VendorAssessment = () => {
  const idDetails = useParams();
  const id = idDetails?.id;
  const [data, setData] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false); // To show/hide modal
  const [adminComments, setAdminComments] = useState(""); // Store input value for nc/reset
  const [controlId, setControlId] = useState(null);
  const [modalTitle, setModalTitle] = useState("");
  const [selectedValues, setSelectedValues] = useState({});
  const [filter, setFilter] = useState("all");
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => {
    setShow(true);
  };

  const getAssessment = async (filter = "") => {
    try {
      setIsLoading(true);
      const url = filter
        ? `/vendor/assessment/${id}?view_by=${filter}`
        : `/vendor/assessment/${id}`;
      const response = await getApi(url);
      setFilter(filter || "all");
      setData(response?.data?.data?.vendor_assessment);
    } catch (error) {
      console.error("Error fetching assessment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectChange = async (event, control) => {
    try {
      const value = event.target.value;

      // Update the selected values state
      setSelectedValues((prev) => ({
        ...prev,
        [control?.id]: value, // Store selected value for the specific control
      }));

      if (value === "accept") {
        // Trigger the API call for 'accept' directly using control?.id
        await postApi("/vendor/update-qa-status", {
          vendor_qa_id: control?.id, // Use control?.id directly
          status_value: value,
          admin_comments: "", // No comment for accept
        });
        getAssessment(); // Refresh the data
      } else if (value === "nc" || value === "reset") {
        // Open modal for 'nc' or 'reset' and set the appropriate modal title
        setModalTitle(value === "nc" ? "nc" : "reset");
        setControlId(control?.id); // Set the control ID for the modal
        setShowModal(true);
      }
    } catch (error) {
      console.error("Error updating QA status:", error);
    }
  };

  const handleModalSubmit = async (control, event) => {
    try {
      // Trigger the API call for 'nc' or 'reset'
      await postApi("/vendor/update-qa-status", {
        vendor_qa_id: controlId,
        status_value: modalTitle,
        admin_comments: adminComments,
      });
      // Close modal after submission
      setShowModal(false);
      setAdminComments("");
      getAssessment();
    } catch (error) {}
  };

  const handleCloseModal = () => {
    // Close modal without submitting
    setShowModal(false);
    setAdminComments("");
    setModalTitle("");
  };

  const [edata, setEdata] = useState("");
  const [offcanvasTitle, setOffcanvasTitle] = useState("");

  const GetFile = async (id) => {
    try {
      setIsLoading(true);
      const response = await getApi(`/org-vendor/view-evidence/${id}`);
      setEdata(Object.values(response?.data?.data));
    } catch (error) {
      console.log("Error fetching evidence:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewEvidence = (imageUrl, title) => {
    setSelectedImageUrl({ imageUrl, title });
  };
  const [selectedImageUrl, setSelectedImageUrl] = useState({
    imageUrl: "",
    title: "",
  });

  useEffect(() => {
    getAssessment();
  }, []);

  const skeletonCount = 3;
  const lazyLoading = Array.from({ length: skeletonCount });

  return (
    <>
      <div className="d-flex flex-wrap mb-3 justify-content-between">
        <ul
          className="nav nav-pills mb-3 vendor-allque custom-a scrollable-nav "
          id="pills-tab"
          role="tablist"
        >
          <li className="nav-item" role="presentation">
            <button
              className={
                filter === "all"
                  ? "nav-link text-dark active"
                  : "nav-link text-dark"
              }
              onClick={() => getAssessment()}
              id="pills-all-tab"
              data-bs-toggle="pill"
              data-bs-target="#pills-all"
              type="button"
              role="tab"
              aria-controls="pills-all"
              aria-selected="true"
            >
              All
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={
                filter === "answered"
                  ? "nav-link text-dark active"
                  : "nav-link text-dark"
              }
              type="button"
              onClick={() => getAssessment("answered")}
            >
              Answered{" "}
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={
                filter === "un_answered"
                  ? "nav-link text-dark active"
                  : "nav-link text-dark"
              }
              type="button"
              onClick={() => getAssessment("un_answered")}
            >
              Not Answered{" "}
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={
                filter === "in_completed"
                  ? "nav-link text-dark active"
                  : "nav-link text-dark"
              }
              type="button"
              onClick={() => getAssessment("in_completed")}
            >
              Incomplete{" "}
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={
                filter === "accept"
                  ? "nav-link text-dark active"
                  : "nav-link text-dark"
              }
              type="button"
              onClick={() => getAssessment("accept")}
            >
              Accepted
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={
                filter === "nc"
                  ? "nav-link text-dark active"
                  : "nav-link text-dark"
              }
              type="button"
              onClick={() => getAssessment("nc")}
            >
              NC
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={
                filter === "reset"
                  ? "nav-link text-dark active"
                  : "nav-link text-dark"
              }
              type="button"
              onClick={() => getAssessment("reset")}
            >
              Reset
            </button>
          </li>
        </ul>
        <Link to="/vendors">
          <button className="btn px-3 mt-1 primary-btn">
            <i className="fa-solid fa-arrow-left me-1"></i>Back
          </button>
        </Link>
      </div>

      <div className="vendor-assessment fixed-align-both">
        <div className="row">
          {isLoading ? (
            <>
              {lazyLoading.map((item, index) => (
                <SkeletonLoader key={index} />
              ))}
            </>
          ) : data?.length > 0 ? (
            data?.map((control, index) => (
              <div
                className="col-xxl-12 mb-2 mb-lg-3"
                key={control?.id || index}
              >
                <div className="card card_custom-a  p-0">
                  <div className="card-body card-body_custom-a py-3 px-4">
                    <div className="card-text d-flex justify-content-between flex-wrap gap-3">
                      <div>
                        <h6 className="card-title">
                          {index + 1}.{" "}
                          {control?.control_template_controls || "-"}
                        </h6>

                        <div className="d-flex justify-content-between flex-wrap">
                          <div className="ms-xxl-2 ms-xl-4 mt-2">
                            <button
                              className={
                                control?.answer === "yes"
                                  ? `btn vendorbtn-submit-active vendorbtn-submit`
                                  : `btn  vendorbtn-submit custom-disabled`
                              }
                            >
                              <input
                                className="form-check-input me-2 custom-radio-a "
                                type="radio"
                              />
                              Yes
                            </button>
                            <button
                              className={
                                control?.answer === "no"
                                  ? `btn vendorbtn-submit-active vendorbtn-submit`
                                  : `btn  vendorbtn-submit custom-disabled`
                              }
                            >
                              <input
                                className="form-check-input me-2 custom-radio-a "
                                type="radio"
                              />
                              No
                            </button>
                            <button
                              className={
                                control?.answer === "Not Applicable"
                                  ? `btn vendorbtn-submit-active vendorbtn-submit`
                                  : `btn  vendorbtn-submit custom-disabled`
                              }
                            >
                              <input
                                className="form-check-input me-2 custom-radio-a "
                                type="radio"
                              />
                              Not Applicable
                            </button>
                            <VendorChat
                              updateStatus={control?.id}
                              type="organization"
                              vendor={control?.vendor_id}
                              unReadCount={control?.unReadCount}
                            />
                            {control?.qa_doc > 0 && (
                              <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip>View Evidence</Tooltip>}
                              >
                                <button
                                  className={`btn vendorbtn-submit position-relative`}
                                  onClick={() => {
                                    setControlId(control?.id);
                                    setOffcanvasTitle(
                                      `${index + 1}. ${
                                        control?.control_template_controls ||
                                        "-"
                                      }`
                                    );
                                    GetFile(control?.id);
                                    handleShow();
                                  }}
                                >
                                  <i className="fa-solid fa-eye me-1 text-muted"></i>{" "}
                                  View Evidence
                                  <div className="badge bg-danger text-white ms-1 upload-badge">
                                    <span>{control?.qa_doc}</span>
                                  </div>
                                </button>
                              </OverlayTrigger>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="place-item-end">
                        {control?.update_status === "1" && (
                          <div className="ms-xxl-2 ms-xl-4 ">
                            {control?.previous_status === "accept" ||
                            control?.previous_status === "nc" ? (
                              <p className="card-text mb-1">
                                <strong>Previous Status: </strong>{" "}
                                {control?.previous_status}
                              </p>
                            ) : (
                              ""
                            )}
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>No Change</Tooltip>}
                            >
                              <button
                                className={`btn vendorbtn-submit position-relative vendor-admin-nc-btn ${
                                  control?.status === "nc" ? "fill-nc-btn" : ""
                                }`}
                                onClick={() =>
                                  handleSelectChange(
                                    { target: { value: "nc" } },
                                    control
                                  )
                                }
                              >
                                NC
                              </button>
                            </OverlayTrigger>

                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>Accept Question</Tooltip>}
                            >
                              <button
                                className={`btn vendorbtn-submit vendor-admin-accept-btn position-relative  ${
                                  control?.status === "accept"
                                    ? "fill-accept-btn"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleSelectChange(
                                    { target: { value: "accept" } },
                                    control
                                  )
                                }
                              >
                                <i className="fa-solid fa-check"></i> Accept
                              </button>
                            </OverlayTrigger>

                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>Reset Question</Tooltip>}
                            >
                              <button
                                className={`btn vendorbtn-submit position-relative vendor-admin-reset-btn`}
                                onClick={() =>
                                  handleSelectChange(
                                    { target: { value: "reset" } },
                                    control
                                  )
                                }
                              >
                                <i className="fa-solid fa-arrows-rotate"></i>{" "}
                                Reset
                              </button>
                            </OverlayTrigger>
                            {/* <br /> */}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="d-flex justify-content-between flex-wrap d-none">
                      <div className="ms-xxl-2 ms-xl-4 mt-2 ">
                        <button
                          className={
                            control?.answer === "yes"
                              ? `btn vendorbtn-submit-active vendorbtn-submit`
                              : `btn  vendorbtn-submit custom-disabled`
                          }
                        >
                          <input
                            className="form-check-input me-2 custom-radio-a "
                            type="radio"
                          />
                          Yes
                        </button>
                        <button
                          className={
                            control?.answer === "no"
                              ? `btn vendorbtn-submit-active vendorbtn-submit`
                              : `btn  vendorbtn-submit custom-disabled`
                          }
                        >
                          <input
                            className="form-check-input me-2 custom-radio-a "
                            type="radio"
                          />
                          No
                        </button>
                        <button
                          className={
                            control?.answer === "na"
                              ? `btn vendorbtn-submit-active vendorbtn-submit`
                              : `btn  vendorbtn-submit custom-disabled`
                          }
                        >
                          <input
                            className="form-check-input me-2 custom-radio-a "
                            type="radio"
                          />
                          Not Applicable
                        </button>
                        <VendorChat
                          updateStatus={control?.id}
                          type="organization"
                          vendor={control?.vendor_id}
                          unReadCount={control?.unReadCount}
                        />

                        {control?.qa_doc > 0 && (
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>View Evidence</Tooltip>}
                          >
                            <button
                              className={`btn vendorbtn-submit position-relative`}
                              onClick={() => {
                                setControlId(control?.id);
                                setOffcanvasTitle(
                                  `${index + 1}. ${
                                    control?.control_template_controls || "-"
                                  }`
                                );
                                GetFile(control?.id);
                                handleShow();
                              }}
                            >
                              <i className="fa-solid fa-eye me-1 text-muted"></i>{" "}
                              View Evidence
                              <div className="badge bg-danger text-white ms-1 upload-badge">
                                <span>{control?.qa_doc}</span>
                              </div>
                            </button>
                          </OverlayTrigger>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 text-center">
              <img
                src="https://img.freepik.com/premium-vector/no-data-found_585024-42.jpg"
                style={{
                  height: "450px",
                  width: "100%",
                  objectFit: "contain",
                }}
                alt=""
              />
            </div>
          )}
        </div>
      </div>

      <Offcanvas
        show={show}
        onHide={handleClose}
        backdrop="static"
        placement={end}
        className=" vendor-admin-custom-offcanvas-width"
      >
        <Offcanvas.Header
          closeButton
          className="shadow vendor-admin-offcanvas_header"
        >
          <Offcanvas.Title>
            <h6 className="fw-bold">Evidence Details</h6>
            <p className="fs-6 p mb-0 mt-1 text-muted">{offcanvasTitle}</p>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
          <div className="vendor-admin-offcanvas-table tabledata-scroll mt-5 px-3">
            <table className="table users-table ">
              <thead className="tablescrolling-thead-tr">
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Title</th>
                  <th scope="col">Descrition</th>
                  <th scope="col" className="text-center">
                    View
                  </th>
                </tr>
              </thead>
              <tbody className="tablescrolling-tbody">
                {isLoading ? (
                  <tr>
                    <td colSpan="4" className="text-center">
                      <div
                        className="spinner-border text-success"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : edata?.length > 0 ? (
                  edata?.map((data, index) => (
                    <tr key={data?.id}>
                      <th scope="row">{index + 1}</th>
                      <td>
                        <OverflowTooltips
                          text={data?.title}
                          textType={"title"}
                        />
                      </td>
                      <td>
                        <OverflowTooltips
                          text={data?.description}
                          textType={"description"}
                        />
                      </td>
                      <td className="text-center">
                        <div className="users-crud d-flex m-auto">
                          <OverlayTrigger
                            overlay={
                              <Tooltip id="tooltip-disabled">
                                View Evidences
                              </Tooltip>
                            }
                          >
                            <button
                              className="btn btn-sm px-lg-3 my-1 "
                              data-bs-toggle="modal"
                              data-bs-target="#viewEvidenceFolder"
                              onClick={() =>
                                handleViewEvidence(
                                  data?.evidence_full_url,
                                  data?.title
                                )
                              }
                            >
                              <i className="fa-regular fa-eye"></i>
                            </button>
                          </OverlayTrigger>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center">
                      No Data Found...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Offcanvas.Body>
      </Offcanvas>

      <Modal
        show={showModal}
        onHide={handleCloseModal}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>{modalTitle === "nc" ? "NC" : "Reset"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <div className="mb-3">
              <label className="text-black mb-2">
                Comments <span className="text-muted ">(optional)</span>
              </label>
              <textarea
                type="text"
                className="form-control"
                rows="5"
                value={adminComments}
                onChange={(e) => setAdminComments(e.target.value)}
              />
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn primary-btn" onClick={handleModalSubmit}>
            Submit
          </button>
        </Modal.Footer>
      </Modal>
      <div
        className="modal fade"
        id="viewEvidenceFolder"
        tabindex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h1
                className="modal-title fs-5 des-limited-text"
                id="exampleModalLabel"
              >
                {selectedImageUrl?.title}
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <img
                src={selectedImageUrl?.imageUrl}
                alt="Evidence"
                className="w-100 "
                style={{ maxHeight: "80vh" }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VendorAssessment;
