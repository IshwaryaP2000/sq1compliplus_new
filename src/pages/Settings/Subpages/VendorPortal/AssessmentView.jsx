import { useEffect, useState, useRef } from "react";
import Offcanvas from "react-bootstrap/Offcanvas";
import { end } from "@popperjs/core";
import CreatableSelect from "react-select/creatable";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { OverlayTrigger } from "react-bootstrap";
import { Tooltip } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import "../../../../styles/adminAiChat.css";
import VendorChat from "../../../../components/Modal/VendorChat";
import { getApi, postApi } from "../../../../services/apiService";
import OverflowTooltips from "../../../../components/Tooltip/OverflowTooltips";
import ButtonWithLoader from "../../../../components/Button/ButtonLoader";
import {
  CheckIcon,
  CircleinfoIcon,
  FolderopenIcon,
  LeftarrowIcon,
  PlusIcon,
  RegulareyeIcon,
  TrashIcon,
  TriangleExclamationIcon,
} from "../../../../components/Icons/Icons";
import { Loader } from "../../../../components/Table/Loader";

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
          {Array.from({ length: 6 }).map((_, index) => (
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

const AssessmentView = () => {
  const [loader, setLoader] = useState(false);
  const [edata, SetEdata] = useState([]);
  const [data, setData] = useState("");
  const [vendorid, setVendorid] = useState("");
  const [checkedItems, setCheckedItems] = useState({});
  const [checkAll, setCheckAll] = useState(false);
  const [assessmentTypeChecked, setAssessmentTypeChecked] = useState({});
  const [showAtt, setShowAtt] = useState(false);
  const [showSend, setShowSend] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [answer, setAnswer] = useState("");
  const [viewBy, setViewBy] = useState("allquestions");
  const previousViewBy = useRef(viewBy);
  const [mail, setMail] = useState([]);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [loadingQuestionId, setLoadingQuestionId] = useState(null);

  const vendorType = localStorage.getItem("authUser");
  const user = JSON.parse(vendorType);

  const handleShowDelete = (id) => {
    setDeleteId(id);
    setShowDelete(true);
  };
  const handleCloseDelete = () => {
    setShowDelete(false);
    setDeleteId(null);
  };

  const handleCloseAtt = (selectedValue) => {
    previousViewBy.current = viewBy;
    setShowAtt(false);
    setSelectedControlsId("");
    setViewBy(selectedValue);
    Getassessment(selectedValue);

    setTimeout(() => {
      setViewBy(previousViewBy.current);
    }, 0);
  };

  const navigate = useNavigate();
  const handleCloseSend = () => setShowSend(false);
  const handleShowSend = () => setShowSend(true);
  const handleShowAtt = async (controlsId, answer) => {
    try {
      await getEvidence(controlsId);
    } catch (error) {
      console.error("Error showing attachment:", error);
    }

    setSelectedControlsId(controlsId);
    setAnswer(answer);
    setShowAtt(true);
  };

  const [count, setCount] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [selectedControlsId, setSelectedControlsId] = useState(null);
  const toggleDiv = () => {
    setIsVisible(!isVisible);
  };
  const handleSelectChange = (val) => {
    setViewBy(val); // Update the state with the selected value
    Getassessment(val); // Pass the selected value to the API call
  };

  const Getassessment = async (selectedViewBy = viewBy) => {
    const url = `/vendor/get-assessment-view?view_by=${selectedViewBy}`;

    try {
      const response = await getApi(url);
      setData(response?.data?.data?.vendor_answers);
      setVendorid(response?.data?.data?.vendor_id);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckboxChange = (assessmentType, controlId) => {
    setCheckedItems((prev) => {
      const newCheckedItems = { ...prev, [controlId]: !prev[controlId] };
      updateAssessmentTypeChecked(assessmentType, newCheckedItems);
      return newCheckedItems;
    });
  };

  const updateAssessmentTypeChecked = (
    assessmentType,
    newCheckedItems,
    controls
  ) => {
    const isAllUnchecked = mappedControls
      .filter((item) => item.assessmentType === assessmentType)
      .every((item) => !newCheckedItems[item.controlsId]);
    setAssessmentTypeChecked((prev) => ({
      ...prev,
      [assessmentType]: !isAllUnchecked,
    }));
  };

  const handleCheckAllChange = () => {
    const newCheckAll = !checkAll;
    setCheckAll(newCheckAll);

    const newCheckedItems = mappedControls.reduce((acc, item) => {
      acc[item.id] = newCheckAll;
      return acc;
    }, {});
    setCheckedItems(newCheckedItems);

    const newAssessmentTypeChecked = Object.keys(assessmentTypeCount).reduce(
      (acc, assessmentType) => {
        acc[assessmentType] = newCheckAll;
        return acc;
      },
      {}
    );
    setAssessmentTypeChecked(newAssessmentTypeChecked);
  };

  const handleAssessmentTypeChange = (assessmentType) => {
    const newCheckedState = !assessmentTypeChecked[assessmentType];
    setAssessmentTypeChecked((prev) => ({
      ...prev,
      [assessmentType]: newCheckedState,
    }));

    const updatedCheckedItems = { ...checkedItems };
    mappedControls.forEach((item) => {
      if (item.assessmentType === assessmentType) {
        updatedCheckedItems[item.id] = newCheckedState;
      }
    });
    setCheckedItems(updatedCheckedItems);
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
        id: controlTemplate?.id,
        controls: controlTemplate?.controls,
        assessmentType: controlTemplate?.assessment_type,
        assessmentTypeId: controlTemplate?.assessment_type_id,
        assessmentQuestionRequired: controlTemplate?.evidence_required,
        controlsId: answer?.id,
        answer: Answer,
        updateStatus: updateStatus,
        documentCount: qa_documents,
        update_comments: update_comments,
        unReadCount: answer?.unReadCount,
        templateId: controlTemplate?.id,
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

  const handleSubmitStore = async (
    qanswer,
    question_id,
    controlsId,
    controls,
    QuestionRequired,
    questionAnswer
  ) => {
    const payload = {
      qanswer,
      question_id,
      vendor_id: vendorid,
    };

    setLoadingQuestionId(controlsId);
    try {
      await postApi("/vendor/assessment-store", payload);
      Getassessment();
      getCount();
      if (QuestionRequired === questionAnswer) {
        handleShowAtt(controlsId, controls);
      }
    } catch (err) {
      console.error("Error submitting:", err);
    } finally {
      setLoadingQuestionId(null);
    }
  };

  const handleSubmitStoreMain = async (question_id, questionRequired) => {
    const payload = {
      submit_vendor: "vendor",
      question_id,
      vendor_id: vendorid,
    };

    try {
      setLoadingQuestionId(question_id); // Set the loading state for the specific button
      await postApi("/vendor/assessment-store", payload);
      Getassessment();
      getCount();
    } catch (error) {
      console.error("Error submitting:", error);
    } finally {
      setLoadingQuestionId(null); // Reset the loading state
    }
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
      // Reset the form
      form.reset();
      fileInput.value = ""; // To clear the file input specifically
    } catch (error) {
      console.error("Error submitting evidence:", error);
    }
  };

  const handleClearEvidence = () => {
    // Reset the form
    const form = document.querySelector("#evidenceForm");
    form.reset();
  };

  const handleDeleteEvidence = async (id, controlId) => {
    try {
      const payload = {
        evidence_id: id,
      };
      await postApi(`/vendor/remove-evidence`, payload);
      getEvidence(selectedControlsId);
      handleCloseDelete();
    } catch (err) {
      console.error("Error deleting evidence:", err);
    }
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
    } catch (err) {
      console.error("Error fetching emails:", err);
    }
  };
  const colourOptions = mail;

  const handleShareQuestion = async () => {
    const selectedQusIds = mappedControls
      .filter((item) => item?.updateStatus !== "1" && checkedItems[item.id])
      .map((item) => item.id);

    const payload = {
      email: selectedEmails.map((email) => email.value),
      qus_ids: selectedQusIds,
    };

    try {
      setLoader(true);
      await postApi("/vendor/vendor-userinvite-parent", payload);
      //toast.success("Questions shared successfully.");
      getMails();
      setSelectedEmails([]);
      setAssessmentTypeChecked({});
      setCheckedItems({});
      handleCloseSend();
    } catch (error) {
      console.error("Error sharing questions:", error);
      // toast.error("Failed to share questions.");
    } finally {
      setLoader(false);
    }
  };

  const getCount = async () => {
    try {
      const response = await getApi("/vendor/get-questions");
      if (
        response?.data?.data?.answer_count ===
        response?.data?.data?.question_count
      ) {
        navigate("/vendor-portal/dashboard"); // Use navigate instead of Navigate
      }
      setCount(response?.data?.data);
    } catch (err) {
      console.error("Error fetching count:", err);
    }
  };

  const [selectedImageUrl, setSelectedImageUrl] = useState({
    imageUrl: "",
    title: "",
  });

  const handleViewEvidence = (imageUrl, title) => {
    setSelectedImageUrl({ imageUrl, title });
  };

  useEffect(() => {
    Getassessment();
    getCount();
    getMails();
  }, []);

  const skeletonCount = 3;
  const lazyLoading = Array.from({ length: skeletonCount });

  const [showEviAns, setShowEviAns] = useState(false);

  const handleClose = () => setShowEviAns(false);

  const [openCollapseIndex, setOpenCollapseIndex] = useState(null);

  const toggleCollapse = (index) => {
    setOpenCollapseIndex((prevIndex) => (prevIndex === index ? null : index));
  };
  return (
    <>
      <section>
        <div className="row">
          <div className="col-lg-3 mb-4 mb-lg-0">
            <div className="card" style={{ height: "calc(100vh - 100px)" }}>
              <div className="card-header fs-18 fw-bold py-3 bg-white">
                {/* {vendorType?.type} */}
                {user?.type !== "vendor_user" ? (
                  <input
                    className="form-check-input custom-checkbox"
                    type="checkbox"
                    checked={checkAll}
                    onChange={handleCheckAllChange}
                  />
                ) : (
                  ""
                )}
                <span className="ms-3">Check All Questions</span>
              </div>
              <div
                className="card-body vendor-questions"
                style={{ overflowY: "auto", maxHeight: "calc(100vh - 200px)" }}
              >
                <nav>
                  <ul className="nav flex-column">
                    {Object.entries(assessmentTypeCount).map(
                      ([assessmentType, count], index) => (
                        <li
                          key={index}
                          className="nav-item d-flex justify-content-between align-items-center"
                        >
                          <div className="d-flex align-items-center">
                            {user?.type !== "vendor_user" ? (
                              <input
                                type="checkbox"
                                className={`form-check-input custom-checkbox me-1 ${
                                  mappedControls
                                    .filter(
                                      (item) =>
                                        item.assessmentType === assessmentType
                                    )
                                    .every((item) => item.updateStatus === "1")
                                    ? "custom-disabled" // Apply the single class for disabled state
                                    : ""
                                }`}
                                checked={
                                  assessmentTypeChecked[assessmentType] || false
                                }
                                disabled={mappedControls
                                  .filter(
                                    (item) =>
                                      item.assessmentType === assessmentType
                                  )
                                  .every((item) => item.updateStatus === "1")}
                                onChange={() =>
                                  handleAssessmentTypeChange(assessmentType)
                                }
                              />
                            ) : (
                              ""
                            )}
                            <a href="#!" className="nav-link px-2">
                              {assessmentType}
                            </a>
                          </div>
                          <div>
                            <span className="badge bg-lightgreen-07">
                              {count}
                            </span>
                          </div>
                        </li>
                      )
                    )}
                  </ul>
                </nav>
              </div>

              {Object.keys(checkedItems).some((key) => checkedItems[key]) ? (
                <div className="card-footer bg-white">
                  <button
                    className="btn primary-btn w-100"
                    onClick={handleShowSend}
                  >
                    Share Question
                    <i className="fa-regular fa-paper-plane ms-2"></i>
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <div className="col-lg-9">
            <div className="mb-4 vendor-card_wrapper">
              <div className="d-flex justify-content-between mb-3 flex-wrap flex-column-reverse flex-md-row">
                <ul
                  className="nav nav-pills mb-3 vendor-allque custom-a scrollable-nav "
                  id="pills-tab"
                  role="tablist"
                >
                  <li className="nav-item" role="presentation">
                    <button
                      className={
                        viewBy === "allquestions"
                          ? "nav-link text-dark active"
                          : "nav-link text-dark"
                      }
                      onClick={() => handleSelectChange("allquestions")}
                      id="pills-all-tab"
                      data-bs-toggle="pill"
                      data-bs-target="#pills-all"
                      type="button"
                      role="tab"
                      aria-controls="pills-all"
                      aria-selected="true"
                    >
                      All
                      <span className="badge rounded rounded-circle ms-1">
                        {isLoading ? 0 : count?.question_count}
                      </span>
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className={
                        viewBy === "answered"
                          ? "nav-link text-dark active"
                          : "nav-link text-dark"
                      }
                      type="button"
                      onClick={() => handleSelectChange("answered")}
                    >
                      Answered
                      <span className="badge rounded rounded-circle ms-1">
                        {isLoading ? 0 : count?.answer_count}
                      </span>
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className={
                        viewBy === "un_answered"
                          ? "nav-link text-dark active"
                          : "nav-link text-dark"
                      }
                      type="button"
                      onClick={() => handleSelectChange("un_answered")}
                    >
                      Not Answered
                      <span className="badge rounded rounded-circle ms-1">
                        {isLoading ? 0 : count?.not_answered_question_count}
                      </span>
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className={
                        viewBy === "in_completed"
                          ? "nav-link text-dark active"
                          : "nav-link text-dark"
                      }
                      type="button"
                      onClick={() => handleSelectChange("in_completed")}
                    >
                      Incomplete
                      <span className="badge rounded rounded-circle ms-1">
                        {isLoading ? 0 : count?.incomplete_question_count}
                      </span>
                    </button>
                  </li>
                </ul>
                <Link to="/vendor-portal/dashboard">
                  <button className="btn px-3 mt-1 mb-2 primary-btn">
                    <LeftarrowIcon className="me-1" />
                    Back
                  </button>
                </Link>
              </div>
              <div className="questions-completed_wrapper mb-3">
                <p className="questions-completed_title mb-0">
                  {isLoading ? (
                    <span className="fw-bold text-dark">0/0</span>
                  ) : (
                    <span className="fw-bold text-dark">
                      {count?.answer_count}/{count?.question_count}
                    </span>
                  )}
                  Questions Completed
                </p>
                <div className="row">
                  <div className="col-12 col-md-5 ps-4">
                    <div className="progress-bar--count">
                      <div className="progress-container">
                        <div
                          className="progress-bar"
                          style={{
                            width:
                              (count?.answer_count / count?.question_count) *
                                100 +
                              "%",
                          }}
                        ></div>
                        <div
                          className="progress-count"
                          style={{
                            left:
                              (count?.answer_count / count?.question_count) *
                                100 +
                              "%",
                          }}
                        >
                          {isLoading
                            ? 0
                            : Math.round(
                                (count?.answer_count / count?.question_count) *
                                  100
                              )}
                          %
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="invite-question_wrapper d-flex gap-2">
                      {/* <button className="btn primary-btn text-white"> <i className="fa-regular fa-envelope me-1"></i> Invite to Questions</button> */}
                      {/* <button className="btn btn-outline-dark">
                        Save & Exit
                      </button> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="vendor-assessment">
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
                      {/* <p>No Data Found</p> */}
                      <img
                        src="https://img.freepik.com/premium-vector/no-data-found_585024-42.jpg"
                        style={{
                          width: "500px",
                          objectFit: "contain",
                        }}
                        alt=""
                      />
                    </div>
                  ) : (
                    mappedControls.map((item, index) => (
                      <>
                        {loadingQuestionId === item.controlsId ? (
                          <SkeletonLoader />
                        ) : (
                          <div
                            id={`assessment-${index}`}
                            className={`
                                ${
                                  item?.updateStatus === "1"
                                    ? "mb-3 no-gray-background "
                                    : "mb-3"
                                } col-xxl-12`}
                            key={index}
                          >
                            <div className="card card_custom-a p-0 ">
                              <div className="card-body card-body_custom-a py-4">
                                <div className="d-flex fw-bold ">
                                  {/* <input
                                    className={`form-check-input custom-checkbox me-2  ${
                                      item?.updateStatus === "1"
                                        ? "custom-disabled"
                                        : ""
                                    }`}
                                    type="checkbox"
                                    checked={
                                      checkedItems[item.controlsId] || false
                                    }
                                    onChange={() =>
                                      handleCheckboxChange(
                                        item.assessmentType,
                                        item.controlsId
                                      )
                                    }
                                  /> */}
                                  {user?.type !== "vendor_user" ? (
                                    <input
                                      className={`form-check-input custom-checkbox me-2  ${
                                        item?.updateStatus === "1"
                                          ? "custom-disabled"
                                          : ""
                                      }`}
                                      type="checkbox"
                                      checked={
                                        item?.updateStatus === "1"
                                          ? false
                                          : checkedItems[item.id] || false
                                      }
                                      onChange={() =>
                                        handleCheckboxChange(
                                          item.assessmentType,
                                          item.id
                                        )
                                      }
                                    />
                                  ) : (
                                    ""
                                  )}

                                  {/* -----------------------questions------------------------------ */}

                                  <div className="d-flex justify-content-between w-100">
                                    <div>
                                      <p className="mb-0 pe-xxl-3 pe-2">
                                        {index + 1}. {item.controls}
                                        <OverlayTrigger
                                          placement="top"
                                          overlay={
                                            <Tooltip className="custom-tooltip">
                                              Help
                                            </Tooltip>
                                          }
                                        >
                                          <i
                                            onClick={() =>
                                              toggleCollapse(index)
                                            }
                                            aria-expanded={
                                              openCollapseIndex === index
                                            }
                                            aria-controls={`vendor-collapseExample${index}`}
                                            className={`fa-solid fa-circle-question  ms-1 text-secondary fs-5 ${
                                              item?.updateStatus === "1"
                                                ? "help-icon-disabled "
                                                : "cursorPointer"
                                            } `}
                                          ></i>
                                        </OverlayTrigger>
                                      </p>
                                    </div>
                                    {item?.updateStatus === "1" ? (
                                      <div className="badge-wrapper">
                                        <p className="badge py-2 text-bg-success d-flex align-items-center justify-content-center mb-0">
                                          <CheckIcon className="fs-6 me-1" />
                                          <span className="d-none d-sm-block">
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
                                              {/* <i className="fa-solid fa-circle-info fs-6 me-1"></i> */}
                                              <CircleinfoIcon className="fs-6 me-1" />
                                              <span className="d-none d-sm-block">
                                                Incomplete
                                              </span>
                                            </>
                                          ) : (
                                            <>
                                              <span className="d-none d-sm-block">
                                                Not Answered
                                              </span>
                                            </>
                                          )}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div
                                  className={`collapse vendor-collapse-content_wrapper p-0 mb-3 ${
                                    openCollapseIndex === index ? "show" : ""
                                  }`}
                                  id={`vendor-collapseExample${index}`}
                                >
                                  <div className="card card-body">
                                    <p className="fw-normal mb-0">
                                      <span>
                                        Some placeholder content for the
                                        collapse component.
                                      </span>
                                      This panel is hidden by default but
                                      revealed when the user activates the
                                      relevant trigger.
                                    </p>
                                  </div>
                                </div>
                                <div className="ms-xxl-2 ms-xl-4 mt-2 d-flex flex-wrap gap-sm-1 gap-2 postion-relative">
                                  {/* <div className="d-flex gap-2 p-0 m-0 position-relative"> */}
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
                                      handleSubmitStore(
                                        "yes",
                                        item.controlsId,
                                        item?.controlsId,
                                        item?.controls,
                                        item.assessmentQuestionRequired,
                                        "Yes"
                                      )
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
                                      handleSubmitStore(
                                        "no",
                                        item.controlsId,
                                        item?.controlsId,
                                        item?.controls,
                                        item.assessmentQuestionRequired,
                                        "No"
                                      )
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
                                      item?.answer === "Not Applicable"
                                        ? "btn vendorbtn-submit-active vendorbtn-submit"
                                        : "btn vendorbtn-submit"
                                    } ${
                                      item?.updateStatus === "1"
                                        ? "custom-disabled"
                                        : ""
                                    }`}
                                    onClick={() =>
                                      handleSubmitStore(
                                        "Not Applicable",
                                        item.controlsId,
                                        item?.controlsId,
                                        item?.controls,
                                        item.assessmentQuestionRequired,
                                        "Not Applicable"
                                      )
                                    }
                                  >
                                    <input
                                      className="form-check-input me-2 custom-radio-a "
                                      type="radio"
                                    />
                                    Not Applicable
                                  </button>

                                  <VendorChat
                                    updateStatus={item?.controlsId}
                                    type="vendor"
                                    vendor={user?.id}
                                    unReadCount={item?.unReadCount}
                                  />

                                  <OverlayTrigger
                                    placement="top"
                                    overlay={
                                      <Tooltip
                                        className="custom-tooltip"
                                        id="tooltip-top"
                                      >
                                        {item?.documentCount?.length > 0 ? (
                                          <span className="text">
                                            Update Evidence
                                          </span>
                                        ) : (
                                          <span className="text">
                                            Add Evidence
                                          </span>
                                        )}
                                      </Tooltip>
                                    }
                                  >
                                    <button
                                      className={`${
                                        item?.updateStatus === "1"
                                          ? "custom-disabled"
                                          : ""
                                      } btn  vendorbtn-submit position-relative py-2`}
                                      onClick={() =>
                                        handleShowAtt(
                                          item?.controlsId,
                                          item?.controls
                                        )
                                      }
                                    >
                                      <i className="fa-solid fa-paperclip me-1 text-muted icon"></i>
                                      {item?.documentCount?.length > 0 ? (
                                        <div
                                          className="badge rounded rounded-circle position-absolute top-0  translate-middle bg-danger text-white ms-1 upload-badge "
                                          style={{ right: "-37%" }}
                                        >
                                          <span>
                                            {item?.documentCount?.length}
                                          </span>
                                        </div>
                                      ) : (
                                        ""
                                      )}
                                    </button>
                                  </OverlayTrigger>

                                  <button
                                    className={`${
                                      loadingQuestionId === item.controlsId
                                        ? "custom-disabled"
                                        : ""
                                    } btn vendorbtn-submit custom-submit ms-2`}
                                    onClick={() =>
                                      handleSubmitStoreMain(
                                        item.controlsId,
                                        item.assessmentQuestionRequired
                                      )
                                    }
                                  >
                                    {loadingQuestionId === item.controlsId ? (
                                      <ButtonWithLoader name="" />
                                    ) : (
                                      "Submit"
                                    )}
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

        {/* ------------------off-canvas----------------- */}
        <Offcanvas
          show={showSend}
          onHide={handleCloseSend}
          backdrop="static"
          placement={end}
          className="vendors-offcanvas custom-offcanvas-width"
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Invite User</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <label className="mb-3">
              Email<span className="text-danger">*</span>
            </label>
            <CreatableSelect
              isMulti
              value={selectedEmails}
              onChange={(emails) => setSelectedEmails(emails)}
              options={colourOptions}
            />
            <button
              className="btn primary-btn w-100 mt-3"
              onClick={handleShareQuestion}
            >
              {loader ? <ButtonWithLoader name="" /> : "Invite"}
            </button>
          </Offcanvas.Body>
        </Offcanvas>

        <Modal show={showDelete} onHide={handleCloseDelete} centered>
          <Modal.Body className="p-4">
            <div className="text-center">
              <div className="mb-3">
                <div className="warning-icon-wrapper">
                  <TriangleExclamationIcon />
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
      {/* ------------ view Answer ----------- */}
      <Offcanvas
        show={showEviAns}
        onHide={handleClose}
        backdrop="static"
        placement={end}
        className="custom-offcanvas-width"
      >
        <Offcanvas.Header
          closeButton
          className="shadow-sm custom-offcanvas_header"
        >
          <Offcanvas.Title>
            <h5 className="fw-bold">Answer Details</h5>
            <p className="fs-6 p mb-0 mt-1 text-muted">
              {selectedControlsId}. {answer || "Answer"}
            </p>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
          <div className=" custom-offcanvas-table tabledata-scroll mt-4 px-3">
            <table className="table users-table ">
              <thead className="tablescrolling-thead-tr">
                <tr>
                  <th scope="col"></th>
                  <th scope="col">Email</th>
                  <th scope="col">Answer</th>
                  <th scope="col">Comment</th>
                  <th scope="col" className="text-center">
                    Evidence
                  </th>
                </tr>
              </thead>
              <tbody className="tablescrolling-tbody">
                <tr>
                  <td>
                    <input
                      type="checkbox"
                      name="checkEvidence"
                      className="form-check-input custom-checkbox me-1"
                    />
                  </td>
                  <td>Business@gmail.com</td>
                  <td>
                    <div className="fw-bold">Yes</div>
                  </td>
                  <td>
                    <p className="fst-italic des-limited-text">
                      Sample Content case
                    </p>
                  </td>
                  <td className="text-center text-secondary">
                    <button
                      data-bs-toggle="modal"
                      data-bs-target="#viewEvidenceFolder"
                      className=" border border-0 bg-transparent "
                    >
                      <FolderopenIcon />
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>
                    <input
                      type="checkbox"
                      name="checkEvidence"
                      className="form-check-input custom-checkbox me-1"
                    />
                  </td>
                  <td>Certificate@gmail.com</td>
                  <td>
                    <div className="fw-bold">Yes</div>
                  </td>
                  <td>
                    <p className="fst-italic des-limited-text">
                      Sample Content case
                    </p>
                  </td>
                  <td className="text-center text-secondary">
                    <button
                      data-bs-toggle="modal"
                      data-bs-target="#viewEvidenceFolder"
                      className=" border border-0 bg-transparent "
                    >
                      <FolderopenIcon />
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>
                    <input
                      type="checkbox"
                      name="checkEvidence"
                      className="form-check-input custom-checkbox me-1"
                    />
                  </td>
                  <td>Financial@gmail.com</td>
                  <td>
                    <div className="fw-bold">Not Applicable</div>
                  </td>
                  <td>
                    <p className="fst-italic des-limited-text">
                      Sample Content case
                    </p>
                  </td>
                  <td className="text-center text-secondary">
                    <button
                      data-bs-toggle="modal"
                      data-bs-target="#viewEvidenceFolder"
                      className=" border border-0 bg-transparent "
                    >
                      <FolderopenIcon />
                    </button>
                  </td>
                </tr>

                <tr>
                  <td>
                    <input
                      type="checkbox"
                      name="checkEvidence"
                      className="form-check-input custom-checkbox me-1"
                    />
                  </td>
                  <td>References@gmail.com</td>
                  <td>
                    <div className="fw-bold">No</div>
                  </td>
                  <td>
                    <p className="fst-italic des-limited-text">
                      Sample Content case
                    </p>
                  </td>
                  <td className="text-center text-secondary">
                    <button
                      data-bs-toggle="modal"
                      data-bs-target="#viewEvidenceFolder"
                      className=" border border-0 bg-transparent "
                    >
                      <FolderopenIcon />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Offcanvas.Body>
      </Offcanvas>

      {/* -------------Evidence Documentation ------------------- */}
      <Offcanvas
        show={showAtt}
        onHide={handleCloseAtt}
        backdrop="static"
        placement={end}
        className="vendors-offcanvas custom-offcanvas-width"
      >
        <Offcanvas.Header closeButton className="shadow-sm">
          <Offcanvas.Title>
            <h6 className="fw-bold">Evidence Documentation</h6>
            <p className="fs-6 p mb-0 mt-1 text-muted">
              {answer || "Evidences Question"}
            </p>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div>
            <div className="d-flex justify-content-end">
              <button onClick={toggleDiv} className={`btn primary-btn `}>
                {isVisible ? (
                  <>
                    <i className="fa-solid fa-close me-2"></i>Close Evidence
                  </>
                ) : (
                  <>
                    <PlusIcon className="me-2" />
                    Add Evidence
                  </>
                )}
              </button>
            </div>

            {isVisible && (
              <div
                className={`Add-evidence-wrapper shadow-sm rounded-3 mb-4 bg-light`}
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
                        accept=".jpg,.jpeg,.png"
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
                      onClick={handleClearEvidence}
                    >
                      Clear
                    </button>
                    <button type="submit" className="btn primary-btn px-xxl-4">
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
                <caption className="fs-6 fw-bold pt-0">
                  List of Evidence
                  {edata.length > 0 ? (
                    <span className="badge ms-1 bg-lightgreen-07">
                      {edata.length}
                    </span>
                  ) : (
                    ""
                  )}
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
                    // Array.from({ length: 3 }).map((_, rowIndex) => (
                    //   <tr key={rowIndex}>
                    //     {Array.from({ length: 4 }).map((_, colIndex) => (
                    //       <td key={colIndex}>
                    //         <p className="placeholder-glow">
                    //           <span className="placeholder col-12 bg-secondary"></span>
                    //         </p>
                    //       </td>
                    //     ))}
                    //   </tr>
                    // ))
                    <Loader rows={3} cols={6} />
                  ) : edata.length > 0 ? (
                    edata?.map((data, index) => (
                      <tr key={data?.id}>
                        <td>{index + 1}</td>
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
                                className="btn btn-sm px-lg-3 my-1 tableborder-right"
                                data-bs-toggle="modal"
                                data-bs-target="#viewEvidenceFolder"
                                onClick={() =>
                                  handleViewEvidence(
                                    data?.evidence_full_url,
                                    data?.title
                                  )
                                }
                              >
                                <RegulareyeIcon />
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

      {/* <!-- Modal --> */}
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

export default AssessmentView;
