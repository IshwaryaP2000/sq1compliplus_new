import { useEffect, useState } from "react";
import Offcanvas from "react-bootstrap/Offcanvas";
import { end } from "@popperjs/core";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { OverlayTrigger } from "react-bootstrap";
import { Tooltip } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import usePageTitle from "../../../../utils/usePageTitle";
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
          <div className="badge-wrapper">
            <button
              className={`btn vendorbtn-submit placeholder px-5 bg-secondary`}
            ></button>
          </div>
        </div>
        <div className="ms-xxl-2 ms-xl-4 mt-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <button
              key={index}
              className={`btn vendorbtn-submit placeholder bg-secondary px-5`}
            ></button>
          ))}
          <button
            className={`btn vendorbtn-submit placeholder bg-dark px-5`}
          ></button>
        </div>
      </div>
    </div>
  </div>
);

const PreApprovedAssessment = () => {
  usePageTitle("Pre Approved Assessment");
  const id = useParams();
  const [edata, SetEdata] = useState([]);
  const [data, setData] = useState("");
  const [vendorid, setVendorid] = useState("");
  const [showAtt, setShowAtt] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [answer, setAnswer] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [loadingQuestionId, setLoadingQuestionId] = useState(null);
  const vendorType = localStorage.getItem("authUser");
  const user = JSON.parse(vendorType);
  const [mail, setMail] = useState([]);
  const [checkedItems, setCheckedItems] = useState({});
  const [selectedEmails, setSelectedEmails] = useState([]);
  const navigate = useNavigate();

  const handleShowDelete = (id) => {
    setDeleteId(id);
    setShowDelete(true);
  };
  const handleCloseDelete = () => {
    setShowDelete(false);
    setDeleteId(null);
  };

  const handleCloseAtt = () => {
    setShowAtt(false);
    setSelectedControlsId("");
    Getassessment();
  };

  const [isVisible, setIsVisible] = useState(false);
  const [selectedControlsId, setSelectedControlsId] = useState(null);
  const toggleDiv = () => {
    setIsVisible(!isVisible);
  };

  const Getassessment = async (viewBy = "allquestions") => {
    let url = `/vendor/pre-approved/assessment/${id?.id}`;
    try {
      const response = await getApi(url);
      setData(response?.data?.data?.vendor_answers);
      setVendorid(response?.data?.data?.vendor_id);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  let mappedControls = [];
  let assessmentTypeCount = [];

  if (Array.isArray(data)) {
    mappedControls = data.map((answer) => {
      const controlTemplate = answer?.control_template;
      const Answer = answer?.answer;
      const updateStatus = answer?.update_status;
      const qa_documents = answer?.qa_documents;
      const update_comments = answer?.update_comments;
      return {
        controls: controlTemplate?.controls,
        assessmentType: controlTemplate?.assessment_type,
        assessmentTypeId: controlTemplate?.assessment_type_id,
        controlsId: answer?.id,
        answer: Answer,
        updateStatus: updateStatus,
        documentCount: qa_documents,
        update_comments: update_comments,
      };
    });

    assessmentTypeCount = mappedControls.reduce((acc, item) => {
      const { assessmentType } = item;
      if (assessmentType) {
        acc[assessmentType] = (acc[assessmentType] || 0) + 1;
      }
      return acc;
    }, {});
  }

  const getEvidence = async (controlsId) => {
    try {
      const response = await getApi(`/vendor/view-evidence/${controlsId}`);
      const data = Array.isArray(response?.data?.data)
        ? response?.data?.data
        : Object.values(response?.data?.data);
      SetEdata(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSubmitStore = async (qanswer, question_id) => {
    const payload = {
      qanswer,
      question_id,
      vendor_id: vendorid,
    };
    setLoadingQuestionId(question_id);

    try {
      await postApi("/vendor/assessment-store", payload);
      Getassessment();
      getCount();
    } catch {
    } finally {
      setLoadingQuestionId(null);
    }
  };

  const handleSubmitStoreMain = async (question_id) => {
    const payload = {
      submit_vendor: "pre_approved_vendor",
      question_id,
      vendor_id: vendorid,
    };

    try {
      const response = await postApi("/vendor/assessment-store", payload);
      const data = response?.data?.data;
      const answerCount = data?.vendor_ans_count;
      const allquestions = data?.vendor_all_question;
      Getassessment();
      getCount();

      if (answerCount === allquestions) {
        toast.success("All questions answered successfully");
        navigate("/settings/add-pre-approved-vendor");
      }
    } catch {}
  };

  const handleSubmitStoreEvidence = async (event) => {
    event.preventDefault();
    const form = event.target;
    const title = form.querySelector('input[type="text"]').value;
    const description = form.querySelector("textarea").value;
    const fileInput = form.querySelector("#fileInput");
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append("vendor_id", vendorid);
    formData.append("question_id", selectedControlsId);
    formData.append("doc_title", title);
    formData.append("doc_desc", description);
    if (file) {
      formData.append("doc_evidence", file);
    }

    try {
      await postApi("/vendor/assessment-store", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const response = await getApi(
        `/vendor/view-evidence/${selectedControlsId}`
      );

      const data = Array.isArray(response?.data?.data)
        ? response?.data?.data
        : Object.values(response?.data?.data);

      SetEdata(data);
      form.reset();
      fileInput.value = "";
    } catch (error) {}
  };

  const handleDeleteEvidence = async (id, controlId) => {
    try {
      const payload = {
        evidence_id: id,
      };
      await postApi(`/vendor/remove-evidence`, payload);
      getEvidence(selectedControlsId);
      handleCloseDelete();
    } catch {}
  };

  const getMails = async () => {
    try {
      const response = await getApi("/vendor/get-vendor-users");
      const emails = response?.data?.data?.map((user) => user.email);
      const colourOptions = emails?.map((email) => ({
        value: email,
        label: email,
      }));
      setMail(colourOptions);
    } catch {}
  };
  const colourOptions = mail;

  const getCount = async () => {
    try {
      await getApi(`/vendor/get-questions/${id?.id}`);
    } catch {}
  };

  useEffect(() => {
    Getassessment();
  }, []);

  const skeletonCount = 5;
  const lazyLoading = Array.from({ length: skeletonCount });

  return (
    <>
      <section>
        <div className="row">
          <div className="col-lg-3">
            <div className="card" style={{ height: "calc(94vh - 120px)" }}>
              <div className="card-header fs-18 fw-bold py-3 bg-white">
                <span className="ms-3">All Questions</span>
              </div>
              <div
                className="card-body vendor-questions"
                style={{ overflowY: "auto", maxHeight: "calc(100vh - 220px)" }}
              >
                <nav>
                  <ul className="nav flex-column">
                    {Object.entries(assessmentTypeCount).map(
                      ([assessmentType, count], index) => (
                        <a className="nav-item" key={index}>
                          <li className=" p-3 d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                              {assessmentType}
                            </div>
                            <div>
                              <span className="badge bg-lightgreen-07">
                                {count}
                              </span>
                            </div>
                          </li>
                        </a>
                      )
                    )}
                  </ul>
                </nav>
              </div>
            </div>
          </div>

          <div className="col-lg-9">
            <div className=""></div>

            <div className="vendor-assessment fixed-align-both">
              <div className="d-flex justify-content-end mb-2">
                <Link to="/settings/add-pre-approved-vendor">
                  <button className="btn px-3 mt-1 mb-2 primary-btn">
                    <i className="fa-solid fa-arrow-left me-1"></i>Back
                  </button>
                </Link>
              </div>
              <div className="">
                <div className="" id="scrollSpyContent">
                  {isLoading ? (
                    <>
                      {lazyLoading.map((item, index) => (
                        <SkeletonLoader key={index} />
                      ))}
                    </>
                  ) : mappedControls.length === 0 ? (
                    <div className="text-center">
                      <p>No Data Found</p>
                    </div>
                  ) : (
                    mappedControls.map((item, index) => (
                      <>
                        {loadingQuestionId === item.controlsId ? (
                          <SkeletonLoader />
                        ) : (
                          <div
                            className={`
                          ${item?.updateStatus} === "1"
                            ? "card mb-3 no-gray-background"
                            : "card mb-3"
                        `}
                            key={index}
                          >
                            <div className="card card_custom-a p-0 ">
                              <div className="card-body card-body_custom-a py-4 ">
                                <div className="d-flex fw-bold mb-2 justify-content-between">
                                  <div>
                                    <p
                                      className="mb-0 pe-xxl-3 pe-2"
                                      id={`${item?.assessmentType}`}
                                    >
                                      {index + 1}. {item.controls}
                                      {item?.update_comments !== null ? (
                                        <OverlayTrigger
                                          overlay={
                                            <Tooltip id="tooltip-disabled">
                                              {item?.update_comments}
                                            </Tooltip>
                                          }
                                        >
                                          <button className="bg-white border-0 text-muted">
                                            <i className="fa-solid fa-circle-info"></i>
                                          </button>
                                        </OverlayTrigger>
                                      ) : (
                                        ""
                                      )}
                                    </p>
                                  </div>
                                  {item?.updateStatus === "1" ? (
                                    <div className="badge-wrapper">
                                      <p className="badge py-2 text-bg-success d-flex align-items-center justify-content-center mb-0 ">
                                        <i className="fa-solid fa-check fs-6 me-1 "></i>
                                        <span className="d-none d-sm-block ">
                                          Answered
                                        </span>
                                      </p>
                                    </div>
                                  ) : (
                                    <div className="badge-wrapper">
                                      <p
                                        className={`badge py-2 d-flex align-items-center justify-content-center mb-0  ${
                                          item?.answer
                                            ? "custom-bg-warning"
                                            : "text-bg-danger"
                                        }`}
                                      >
                                        {item?.answer ? (
                                          <>
                                            <i className="fa-solid fa-circle-info fs-6 me-1 "></i>
                                            <span className="d-none d-sm-block ">
                                              Incomplete
                                            </span>
                                          </>
                                        ) : (
                                          <>
                                            <i className="fa-solid fa-circle-exclamation fs-6 me-1 "></i>
                                            <span className="d-none d-sm-block ">
                                              {" "}
                                              Not Answered
                                            </span>
                                          </>
                                        )}
                                      </p>
                                    </div>
                                  )}
                                </div>
                                <div className="ms-xxl-2 ms-xl-4 mt-2 d-flex flex-wrap gap-sm-1 gap-2 postion-relative">
                                  <button
                                    className={`${
                                      item?.answer === "yes"
                                        ? "btn vendorbtn-submit-active vendorbtn-submit"
                                        : "btn vendorbtn-submit"
                                    } ${
                                      item?.updateStatus === "1"
                                        ? "custom-disabled"
                                        : ""
                                    }`}
                                    onClick={() =>
                                      handleSubmitStore("yes", item.controlsId)
                                    }
                                  >
                                    <input
                                      className="form-check-input me-2 custom-radio-a"
                                      type="radio"
                                    />
                                    Yes
                                  </button>

                                  <button
                                    className={`${
                                      item?.answer === "no"
                                        ? " btn vendorbtn-submit-active vendorbtn-submit"
                                        : "btn vendorbtn-submit"
                                    } ${
                                      item?.updateStatus === "1"
                                        ? "custom-disabled"
                                        : ""
                                    }`}
                                    onClick={() =>
                                      handleSubmitStore("no", item.controlsId)
                                    }
                                  >
                                    <input
                                      className="form-check-input me-2 custom-radio-a "
                                      type="radio"
                                    />
                                    No
                                  </button>

                                  <button
                                    className={`${
                                      item?.answer === "na"
                                        ? "btn vendorbtn-submit-active vendorbtn-submit"
                                        : "btn vendorbtn-submit"
                                    } ${
                                      item?.updateStatus === "1"
                                        ? "custom-disabled"
                                        : ""
                                    }`}
                                    onClick={() =>
                                      handleSubmitStore("na", item.controlsId)
                                    }
                                  >
                                    <input
                                      className="form-check-input me-2 custom-radio-a "
                                      type="radio"
                                    />
                                    Not Applicable
                                  </button>

                                  <button
                                    className={`${
                                      item?.updateStatus === "1"
                                        ? "custom-disabled"
                                        : ""
                                    } btn vendorbtn-submit custom-submit ms-2`}
                                    onClick={() =>
                                      handleSubmitStoreMain(item.controlsId)
                                    }
                                    disabled={item?.updateStatus === "1"}
                                  >
                                    Submit
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Offcanvas
          show={showAtt}
          onHide={handleCloseAtt}
          backdrop="static"
          placement={end}
          className="vendors-offcanvas custom-offcanvas-width"
        >
          <Offcanvas.Header closeButton className="shadow-sm">
            <Offcanvas.Title>
              <h5 className="fw-bold">Evidence Documentation</h5>
              <p className="fs-6 p mb-0 mt-1 text-muted">
                {selectedControlsId}. {answer || "Evidence Question"}
              </p>
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <div>
              <div className="d-flex justify-content-end">
                <button
                  onClick={toggleDiv}
                  className={`btn primary-btn mt-2 mb-3 `}
                >
                  {isVisible ? (
                    <>Close Evidence</>
                  ) : (
                    <>
                      <i className="fa-solid fa-plus me-2"></i>Add Evidence
                    </>
                  )}
                </button>
              </div>

              {isVisible && (
                <div
                  className={`Add-evidence-wrapper shadow-sm rounded-3 bg-light`}
                  style={{
                    padding: "20px",
                    marginTop: "10px",
                  }}
                >
                  <form onSubmit={handleSubmitStoreEvidence} id="evidenceForm">
                    <div className="row mb-3 gap-3">
                      <div className="col-12">
                        <label className="form-label ">
                          Title <span className="text-danger">*</span>
                        </label>
                        <input type="text" className="form-control" required />
                      </div>

                      <div className="col-12">
                        <label className="mb-2">
                          Choose File <span className="text-danger">*</span>
                        </label>
                        <input
                          type="file"
                          id="fileInput"
                          className="styled-file-upload w-100 mb-0"
                          required
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label">
                          Description
                          <span className="text-muted">
                            <small> (Optional)</small>
                          </span>
                        </label>
                        <textarea className="form-control" rows="3"></textarea>
                      </div>
                    </div>

                    <div className="d-flex justify-content-end">
                      <button
                        type="button"
                        className="btn  cus_close-btn me-2 px-xxl-4"
                      >
                        Clear
                      </button>
                      <button
                        type="submit"
                        className="btn primary-btn px-xxl-4"
                      >
                        Submit
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            <div className="tabledata-scroll my-2">
              <div className=" custom-offcanvas-table tabledata-scroll ">
                <table className="table users-table caption-top ">
                  <caption className="fs-5 fw-bold">
                    List of Evidence...
                  </caption>
                  <thead className="tablescrolling-thead-tr">
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Title</th>
                      <th scope="col">Descrition</th>
                      <th scope="col" className="text-center">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="tablescrolling-tbody">
                    {isLoading ? (
                      Array.from({ length: 3 }).map((_, rowIndex) => (
                        <tr key={rowIndex}>
                          {Array.from({ length: 4 }).map((_, colIndex) => (
                            <td key={colIndex}>
                              <p className="placeholder-glow">
                                <span className="placeholder col-12 bg-secondary"></span>
                              </p>
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : edata.length > 0 ? (
                      edata?.map((data, index) => (
                        <tr key={data?.id}>
                          <td>{index + 1}</td>
                          <td>
                            <div className="title-limited-text">
                              {data?.title}
                            </div>
                          </td>
                          <td>
                            <div className="des-limited-text">
                              {data?.description}
                            </div>
                          </td>
                          <td className="text-center">
                            <div className="users-crud d-flex m-auto">
                              <OverlayTrigger
                                overlay={
                                  <Tooltip id="tooltip-disabled">
                                    View Evidence
                                  </Tooltip>
                                }
                              >
                                <button
                                  className="btn btn-sm px-lg-3 my-1 tableborder-right"
                                  onClick={() =>
                                    window.open(
                                      data?.evidence_full_url,
                                      "_blank"
                                    )
                                  }
                                >
                                  <i className="fa-regular fa-eye"></i>
                                </button>
                              </OverlayTrigger>

                              <OverlayTrigger
                                overlay={
                                  <Tooltip id="tooltip-delete">Delete</Tooltip>
                                }
                              >
                                <button
                                  className="btn btn-sm px-lg-3 py-0  "
                                  onClick={() => handleShowDelete(data?.id)}
                                >
                                  <i className="fa-solid fa-trash text-danger "></i>
                                </button>
                              </OverlayTrigger>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center">
                          No Evidence Available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </Offcanvas.Body>
        </Offcanvas>

        <Modal show={showDelete} onHide={handleCloseDelete} centered>
          <Modal.Body className="p-4">
            <div className="text-center">
              <div className="mb-3">
                <div className="warning-icon-wrapper">
                  <i className="fa-solid text-danger fa-triangle-exclamation"></i>
                </div>
              </div>
              <h5 className="fw-bold mb-2 text-muted">Delete Evidence</h5>
              <p className="mb-2">
                You're going to <span className="fw-bold">"Delete this"</span>
                evidence. Are you sure?
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
            <Button
              variant="danger"
              onClick={() => handleDeleteEvidence(deleteId)}
              className="px-4"
            >
              Yes, Delete!
            </Button>
          </div>
        </Modal>
      </section>
    </>
  );
};

export default PreApprovedAssessment;
