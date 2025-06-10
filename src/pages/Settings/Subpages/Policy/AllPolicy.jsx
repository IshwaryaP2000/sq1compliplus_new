import { useEffect, useState, useMemo } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import JoditEditor from "jodit-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { getApi, postApi } from "../../../../services/apiService";
import { ucFirst } from "../../../../utils/UtilsGlobalData";
import Searchbar from "../../../../components/Search/Searchbar";
import ButtonWithLoader from "../../../../components/Button/ButtonLoader";
import {
  createDebouncedSearch,
  fetchSearchResults,
  highlightText,
} from "../../../../components/Search/useSearchAndSort";
import { TriangleExclamationIcon } from "../../../../components/Icons/Icons";

// Validation schema for the change policy form
const changePolicySchema = Yup.object().shape({
  name: Yup.string().required("Policy name is required"),
  comments: Yup.string().required("Comments are required"),
  majorVersion: Yup.number()
    .min(1, "Major version must be at least 1")
    .required("Major version is required"),
  minorVersion: Yup.number()
    .min(0, "Minor version cannot be negative")
    .required("Minor version is required"),
});

const AllPolicy = () => {
  const [data, setData] = useState({ all_policies: {}, waiting_policies: {} });
  const [isLoading, setIsLoading] = useState(false);
  const [showRetireModal, setShowRetireModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [reviewComment, setReviewComment] = useState("");
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [isRetiring, setIsRetiring] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [reviewDate, setReviewDate] = useState("");
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [showRecommissionModal, setShowRecommissionModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [isRecommissioning, setIsRecommissioning] = useState(false);
  const [isExtending, setIsExtending] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [openModalPolicyId, setOpenModalPolicyId] = useState(null);
  const [showQueriesModal, setShowQueriesModal] = useState(false);
  const [filteredLength, setFilteredLength] = useState(0);
  const [searchVal, setSearchVal] = useState("");
  const [filteredData, setFilteredData] = useState({
    all_policies: {},
    waiting_policies: {},
  });

  // Editor configuration
  const editorConfig = {
    readonly: false,
    height: 500,
    toolbar: true,
    spellcheck: true,
    language: "en",
    toolbarButtonSize: "medium",
    toolbarAdaptive: false,
    showCharsCounter: true,
    showWordsCounter: true,
    showXPathInStatusbar: false,
    askBeforePasteHTML: true,
    askBeforePasteFromWord: true,
    defaultActionOnPaste: "insert_clear_html",
    buttons: [
      "source",
      "|",
      "bold",
      "strikethrough",
      "underline",
      "italic",
      "|",
      "ul",
      "ol",
      "|",
      "outdent",
      "indent",
      "|",
      "font",
      "fontsize",
      "brush",
      "paragraph",
      "|",
      "image",
      "table",
      "link",
      "|",
      "align",
      "undo",
      "redo",
      "|",
      "hr",
      "eraser",
      "copyformat",
      "|",
      "fullsize",
    ],
  };

  const getAllPolicies = async () => {
    try {
      setIsLoading(true);
      const response = await getApi("/policy/all");
      const policies = response?.data?.data || {
        all_policies: {},
        waiting_policies: {},
      };
      setData(policies);
      setFilteredData(policies);
      // Calculate total policies for filteredLength
      const totalLength = [
        ...Object.values(policies.all_policies || {}).flat(),
        ...Object.values(policies.waiting_policies || {}).flat(),
      ].length;
      setFilteredLength(totalLength);
    } catch (error) {
      console.error("Error fetching policies:", error);
      setData({ all_policies: {}, waiting_policies: {} });
      setFilteredData({ all_policies: {}, waiting_policies: {} });
      setFilteredLength(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetirePolicy = async () => {
    try {
      setIsRetiring(true);
      await postApi(`/policy/retire/${selectedPolicy?.id}`);
      getAllPolicies();
    } catch (error) {
      console.error("Error retiring policy:", error);
    } finally {
      setIsRetiring(false);
      setShowRetireModal(false);
    }
  };

  const handleSubmitReview = async () => {
    try {
      setIsSubmittingReview(true);
      const payload = {
        comments: reviewComment,
      };
      await postApi(`/policy/review/${selectedPolicy?.id}`, payload);
      getAllPolicies();
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setIsSubmittingReview(false);
      setShowReviewModal(false);
    }
  };

  const handleSavePolicy = async (approveAction = false) => {
    try {
      setIsSaving(true);
      const fieldName = `data_${selectedPolicy?.id}`;
      const payload = {
        [fieldName]: editorContent,
        type: approveAction ? "save_approve" : "save",
      };
      await postApi(`/policy/save/policy-docs/${selectedPolicy?.id}`, payload);
      getAllPolicies();
      setShowEditorModal(false);
    } catch (error) {
      console.error("Error saving policy:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePolicyDateUpdate = async (actionType) => {
    try {
      if (actionType === "approve") setIsApproving(true);
      if (actionType === "recommission") setIsRecommissioning(true);
      if (actionType === "extend") setIsExtending(true);
      const fieldName = `expiry_date_${selectedPolicy?.id}`;
      const payload = {
        [fieldName]: reviewDate,
        type: "save",
      };
      await postApi(`/policy/approve/${selectedPolicy?.id}`, payload);
      getAllPolicies();

      if (actionType === "approve") setShowApproveModal(false);
      if (actionType === "recommission") setShowRecommissionModal(false);
      if (actionType === "extend") setShowExtendModal(false);
    } catch (error) {
      console.error("Error updating policy date:", error);
    } finally {
      if (actionType === "approve") setIsApproving(false);
      if (actionType === "recommission") setIsRecommissioning(false);
      if (actionType === "extend") setIsExtending(false);
    }
  };

  const handleChangePolicy = async (values) => {
    try {
      setIsChanging(true);
      const payload = {
        [`name_${selectedPolicy?.id}`]: values.name,
        [`comments_${selectedPolicy?.id}`]: values.comments,
        [`version_${selectedPolicy?.id}`]: `${values.majorVersion}.${values.minorVersion}`,
      };
      await postApi(`/policy/update/${selectedPolicy?.id}`, payload);
      getAllPolicies();
      setShowChangeModal(false);
    } catch (error) {
      console.error("Error changing policy:", error);
    } finally {
      setIsChanging(false);
    }
  };

  const handleShowApproveModal = (policy) => {
    setSelectedPolicy(policy);
    const currentDate = new Date();
    let defaultReviewDate = new Date();
    defaultReviewDate.setFullYear(currentDate.getFullYear() + 1);
    const formattedDate = defaultReviewDate.toISOString().split("T")[0];
    setReviewDate(formattedDate);
    setShowApproveModal(true);
  };

  const handleShowRecommissionModal = (policy) => {
    setSelectedPolicy(policy);
    const currentDate = new Date();
    let defaultReviewDate = new Date();
    defaultReviewDate.setFullYear(currentDate.getFullYear() + 1);
    const formattedDate = defaultReviewDate.toISOString().split("T")[0];
    setReviewDate(formattedDate);
    setShowRecommissionModal(true);
  };

  const handleShowExtendModal = (policy) => {
    setSelectedPolicy(policy);
    const currentDate = new Date();
    let defaultReviewDate = new Date();
    defaultReviewDate.setFullYear(currentDate.getFullYear() + 1);
    const formattedDate = defaultReviewDate.toISOString().split("T")[0];
    setReviewDate(formattedDate);
    setShowExtendModal(true);
  };

  const handleViewComments = (policy) => {
    setSelectedPolicy(policy);
    setShowCommentsModal(true);
  };

  const handleShowChangeModal = (policy) => {
    setSelectedPolicy(policy);
    setShowChangeModal(true);
  };

  const handleSearch = (value) => {
    setSearchVal(value);
    debouncedFetchSearchResults({ search: value });
  };

  const debouncedFetchSearchResults = useMemo(
    () =>
      createDebouncedSearch((params) => {
        fetchSearchResults(
          "/policy/all",
          params,
          (responseData) => {
            const policies = responseData || {
              all_policies: {},
              waiting_policies: {},
            };
            setFilteredData(policies);
            const totalLength = [
              ...Object.values(policies.all_policies || {}).flat(),
              ...Object.values(policies.waiting_policies || {}).flat(),
            ].length;
            setFilteredLength(totalLength);
          },
          setIsLoading,
          setFilteredLength,
          () => {}
        );
      }, 300),
    []
  );

  const getCategoryDisplayName = (category) => {
    if (category === "doc_data") {
      return "Existing Policy";
    }
    return ucFirst(category.replace(/_/g, " "));
  };

  const renderStatusBadges = (policy) => {
    const status = policy?.status;
    const isUserPolicy = policy?.isUserPolicy;
    const validStatuses = ["active", "retired", "review", "expired"];

    if (["pending_approval", "review", "retired", "expired"].includes(status)) {
      return (
        <div className="d-flex" style={{ flexWrap: "wrap" }}>
          {isUserPolicy ? (
            <>
              <p className="policy-approval-date mb-2 me-2 d-flex">
                <p className="mb-0">
                  {status === "pending_approval"
                    ? policy?.is_approved
                      ? "For me: Approved"
                      : "For me: Pending"
                    : status === "review"
                    ? "Review"
                    : status === "retired"
                    ? "Retired"
                    : "Expired"}
                </p>
              </p>
              {status === "pending_approval" && policy?.is_approved && (
                <p className="policy-waiting-date mb-2 me-2 d-flex">
                  <p className="mb-0">Waiting for others</p>
                </p>
              )}
            </>
          ) : (
            <p className="policy-other-user mb-2 me-2 d-flex">
              <p className="mb-0">Other User</p>
            </p>
          )}
          {validStatuses.includes(policy.status) && (
            <p className="policy-waiting-date me-2 mb-2">
              <p className="mb-0">
                {policy.status === "expired" ? "Expired date" : "Review date"} -{" "}
                {policy?.expiry_date}
              </p>
            </p>
          )}
        </div>
      );
    }

    const statusConfig = {
      active: {
        label: "Active",
        className: "poilcy-status d-flex me-2",
        render: (
          <div className="poilcy-status d-flex me-2">
            <div
              className="status-color me-2"
              style={{ background: "#37C650" }}
            ></div>
            Active
          </div>
        ),
      },
      template_data: {
        label: "Template Data",
        className: "badge badge-sm bg-info",
      },
      doc_data: {
        label: "Doc Data",
        className: "badge badge-sm bg-primary",
      },
    };

    const config = statusConfig[status] || {
      label: ucFirst(status || "Unknown"),
      className: "badge badge-sm bg-secondary",
    };

    return (
      <div className="d-flex" style={{ flexWrap: "wrap" }}>
        {config.render || (
          <span className={config.className}>{config.label}</span>
        )}
        {validStatuses.includes(status) && (
          <p className="policy-review-date me-2 mb-2">
            Review date - {policy?.expiry_date}
          </p>
        )}
      </div>
    );
  };

  const handleCardClick = (policyId) => {
    if (openModalPolicyId !== policyId) {
      setOpenModalPolicyId(policyId);
    }
  };

  const handleCloseModal = (e, policyId) => {
    e.stopPropagation();
    if (openModalPolicyId === policyId) {
      setOpenModalPolicyId(null);
    }
  };

  useEffect(() => {
    getAllPolicies();
  }, []);

  const renderPolicyCards = (policies, category) => {
    if (isLoading) {
      return (
        <div className="row">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="col-12 mb-3">
              <div className="card">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-12">
                      <p className="placeholder-glow">
                        <span className="placeholder col-12 bg-secondary"></span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (!policies || policies.length === 0) {
      return (
        <div className="card w-100">
          <div className="card-body text-center">
            <p>No Data Available...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="row">
        {policies.map((policy) => {
          // const agreed = policy.accepted_count || 0;
          // const employees = policy.employees || 0;
          // const total = agreed + employees;
          // let agreedWidth = 0;
          // let employeesWidth = 100;
          // if (agreed > 0 && total > 0) {
          //   agreedWidth = (agreed / total) * 100;
          //   employeesWidth = (employees / total) * 100;
          // }
          const agreed = policy.accepted_count || 0;
          const employees = policy.employees || 0;
          let agreedWidth = 0;
          let employeesWidth = 0;
          if (employees > 0) {
            agreedWidth = (agreed / employees) * 100;
            employeesWidth = 100 - agreedWidth;
          }
          if (category === "waiting_policies") {
            return (
              <div
                style={{ position: "relative" }}
                className="col-md-6 mb-1"
                key={policy.id}
              >
                <div
                  className={`card p-4 mb-3 rounded-4 ${
                    openModalPolicyId === policy.id ? "blur-effect" : ""
                  }`}
                  onClick={() => handleCardClick(policy.id)}
                  style={{
                    cursor: "pointer",
                    transition: "filter 0.3s ease",
                    position: "relative",
                  }}
                >
                  <div className="card-body p-0">
                    <div className="d-flex justify-content-between mb-3">
                      <div>
                        <h5
                          className="fs-24 policy-card-h"
                          dangerouslySetInnerHTML={{
                            __html: highlightText(
                              ucFirst(policy?.name) || "",
                              searchVal
                            ),
                          }}
                        ></h5>
                      </div>
                      <div className="d-flex align-items-center">
                        <span className="policy-version">
                          V - {policy.version}
                        </span>
                        <i
                          className="fas fa-ellipsis-v text-secondary fs-3 ms-2"
                          style={{ opacity: 0.5 }}
                        ></i>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between mb-3">
                      <div className="policy-details">
                        <p className="mb-0 fs-14 text-gray-light mb-2">
                          Policy Title
                        </p>
                        <h5
                          dangerouslySetInnerHTML={{
                            __html: highlightText(
                              ucFirst(policy?.title) || "",
                              searchVal
                            ),
                          }}
                        ></h5>
                      </div>
                      <div className="policy-details">
                        <p className="mb-0 fs-14 text-gray-light mb-2">
                          Status
                        </p>
                        <div>
                          <p className="policy-waiting-status mb-0">
                            {policy?.status
                              ? ucFirst(policy.status.replace(/_/g, " "))
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="policy-details">
                        <p className="mb-0 fs-14 text-gray-light mb-2">
                          Category
                        </p>
                        <h5
                          dangerouslySetInnerHTML={{
                            __html: highlightText(
                              ucFirst(policy?.category) || "",
                              searchVal
                            ),
                          }}
                        ></h5>
                      </div>
                    </div>
                    <div style={{ width: "100%" }}>
                      <p className="mb-0 fs-16 text-gray-light mb-2">Agreed</p>
                      <div className="policy-progressbar-container">
                        <div className="policy-progressbar">
                          <div className="progress-fill">
                            {agreedWidth > 0 && (
                              <div
                                className="agreed-bar"
                                style={{ width: `${agreedWidth}%` }}
                              ></div>
                            )}
                            <div
                              className="disagreed-bar"
                              style={{ width: `${employeesWidth}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="labels">
                          <span className="text-gray-light">
                            {agreed} Agreed
                          </span>
                          <span className="text-gray-light">
                            {employees} Employees
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="">
                      <p className="mb-0 fs-14 text-gray-light mb-2 mt-3">
                        Comments
                      </p>
                      <div className="waiting-policycomments">
                        <p className="mb-0">
                          {policy.comments || "No Comments"}
                        </p>
                      </div>
                    </div>
                  </div>
                  {openModalPolicyId === policy.id && (
                    <div className="policy-modal-overlay rounded-4">
                      <div className="card p-4 rounded-4 policy-card02">
                        <button
                          onClick={(e) => handleCloseModal(e, policy.id)}
                          className="close-btn"
                        >
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                        <div>
                          <h4 className="mb-3 text-center">Actions</h4>
                          <div className="d-flex justify-content-center">
                            {policy?.status === "template_data" && (
                              <button
                                onClick={() => {
                                  setSelectedPolicy(policy);
                                  setEditorContent(policy?.data || "");
                                  setShowEditorModal(true);
                                }}
                                className="policy-buttons"
                              >
                                Edit
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setSelectedPolicy(policy);
                                setShowLogModal(true);
                              }}
                              className="policy-buttons"
                            >
                              Logs
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          }
          return (
            <div
              style={{ position: "relative" }}
              className="col-md-6 mb-1"
              key={policy.id}
            >
              <div
                className={`card p-4 mb-3 rounded-4 ${
                  openModalPolicyId === policy.id ? "blur-effect" : ""
                }`}
                onClick={() => handleCardClick(policy.id)}
                style={{
                  cursor: "pointer",
                  transition: "filter 0.3s ease",
                  position: "relative",
                }}
              >
                <div className="card-body mb-3 p-0">
                  <div className="d-flex justify-content-between mb-3">
                    <div>
                      <h5
                        className="fs-24 policy-card-h Capitalize"
                        dangerouslySetInnerHTML={{
                          __html: highlightText(
                            ucFirst(policy?.name) || "",
                            searchVal
                          ),
                        }}
                      ></h5>
                      <div className="d-flex" style={{ flexWrap: "wrap" }}>
                        {renderStatusBadges(policy)}
                      </div>
                    </div>
                    <div className="d-flex align-items-center">
                      <span className="policy-version">
                        V - {policy.version}
                      </span>
                      <i
                        className="fas fa-ellipsis-v text-secondary fs-3 ms-2"
                        style={{ opacity: 0.5 }}
                      ></i>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <div className="policy-details">
                      <p className="mb-0 fs-14 text-gray-light mb-2">
                        Policy Title
                      </p>
                      <h5
                        dangerouslySetInnerHTML={{
                          __html: highlightText(
                            ucFirst(policy?.title) || "",
                            searchVal
                          ),
                        }}
                      ></h5>
                    </div>
                    {/* <div className="policy-details">
                      <p className="mb-0 fs-14 text-gray-light mb-2">Status</p>
                      <div>
                        <p className="policy-waiting-status mb-0">
                          {policy?.status
                            ? ucFirst(policy.status.replace(/_/g, " "))
                            : "N/A"}
                        </p>
                      </div>
                    </div> */}
                    <div className="policy-details">
                      <p className="mb-0 fs-14 text-gray-light mb-2">
                        Category
                      </p>
                      <h5
                        dangerouslySetInnerHTML={{
                          __html: highlightText(
                            ucFirst(policy?.category) || "",
                            searchVal
                          ),
                        }}
                      ></h5>
                    </div>
                  </div>
                  <div style={{ width: "100%" }}>
                    <p className="mb-0 fs-16 text-gray-light mb-2">Agreed</p>
                    <div className="policy-progressbar-container">
                      <div className="policy-progressbar">
                        <div className="progress-fill">
                          {agreedWidth > 0 && (
                            <div
                              className="agreed-bar"
                              style={{ width: `${agreedWidth}%` }}
                            ></div>
                          )}
                          <div
                            className="disagreed-bar"
                            style={{ width: `${employeesWidth}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="labels">
                        <span className="text-gray-light">{agreed} Agreed</span>
                        <span className="text-gray-light">
                          {employees} Employees
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="">
                    <p className="mb-0 fs-14 text-gray-light mb-2 mt-3">
                      Comments
                    </p>
                    <div className="waiting-policycomments">
                      <p className="mb-0">{policy.comments || "No Comments"}</p>
                    </div>
                  </div>
                </div>
                {openModalPolicyId === policy.id && (
                  <div className="policy-modal-overlay rounded-4">
                    <div className="card p-4 rounded-4 policy-card02">
                      <button
                        onClick={(e) => handleCloseModal(e, policy.id)}
                        className="close-btn"
                      >
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                      <div>
                        <h4 className="mb-3 text-center">Actions</h4>
                        <div className="d-flex justify-content-center">
                          {policy?.status === "active" &&
                            policy?.isUserPolicy === true && (
                              <>
                                <button
                                  className="policy-buttons"
                                  onClick={() =>
                                    window.open(policy?.pdf_url, "_blank")
                                  }
                                >
                                  View
                                </button>
                                <button
                                  className="policy-buttons"
                                  onClick={() => {
                                    setSelectedPolicy(policy);
                                    setShowQueriesModal(true);
                                  }}
                                >
                                  Queries
                                </button>
                                <button
                                  className="policy-buttons"
                                  onClick={() => {
                                    setSelectedPolicy(policy);
                                    setReviewComment("");
                                    setShowReviewModal(true);
                                  }}
                                >
                                  Review
                                </button>
                                <button
                                  className="policy-buttons"
                                  onClick={() => {
                                    setSelectedPolicy(policy);
                                    setShowRetireModal(true);
                                  }}
                                >
                                  Retire
                                </button>
                              </>
                            )}
                          <button
                            className="policy-buttons"
                            onClick={() => {
                              setSelectedPolicy(policy);
                              setShowLogModal(true);
                            }}
                          >
                            Logs
                          </button>
                          {policy?.status === "pending_approval" &&
                            policy?.isUserPolicy === true && (
                              <button
                                className="policy-buttons"
                                onClick={() => handleShowApproveModal(policy)}
                                disabled={isLoading}
                              >
                                Approve
                              </button>
                            )}
                          {(policy?.status === "pending_approval" &&
                            !policy?.isUserPolicy) ||
                            (policy?.status === "template_data" && (
                              <button
                                className="policy-buttons"
                                onClick={() => {
                                  setSelectedPolicy(policy);
                                  setEditorContent(policy?.data || "");
                                  setShowEditorModal(true);
                                }}
                              >
                                Edit
                              </button>
                            ))}
                          {policy?.status === "review" && (
                            <button
                              className="policy-buttons"
                              onClick={() => handleViewComments(policy)}
                            >
                              View Comments
                            </button>
                          )}
                          {policy?.status === "retired" &&
                            policy?.isUserPolicy === true && (
                              <button
                                className="policy-buttons"
                                onClick={() =>
                                  handleShowRecommissionModal(policy)
                                }
                              >
                                Recommission
                              </button>
                            )}
                          {policy?.status === "expired" &&
                            policy?.isUserPolicy === true && (
                              <>
                                <button
                                  className="policy-buttons"
                                  onClick={() => handleShowChangeModal(policy)}
                                >
                                  Change
                                </button>
                                <button
                                  className="policy-buttons"
                                  onClick={() => handleShowExtendModal(policy)}
                                >
                                  Extend
                                </button>
                              </>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const formik = useFormik({
    initialValues: {
      name: selectedPolicy?.name || "",
      comments: selectedPolicy?.comments || "",
      majorVersion: selectedPolicy?.version
        ? parseInt(selectedPolicy.version.split(".")[0])
        : 1,
      minorVersion: selectedPolicy?.version
        ? parseInt(selectedPolicy.version.split(".")[1])
        : 0,
    },
    enableReinitialize: true,
    validationSchema: changePolicySchema,
    onSubmit: handleChangePolicy,
  });

  return (
    <>
      <div className="d-flex justify-content-between mb-3 flex-wrap">
        <h5>
          All Policies
          {filteredLength > 0 && (
            <span className="badge user-active text-white m-1">
              {filteredLength}
            </span>
          )}
        </h5>
        <Searchbar onSearch={handleSearch} placeHolder={"Search"} />
      </div>
      {Object.entries(filteredData?.all_policies || {}).map(
        ([category, policies]) => (
          <div key={category} className="float-left">
            <div className="d-flex justify-content-between mb-3 flex-wrap">
              <h5>
                {getCategoryDisplayName(category)} Policy
                <span className="badge user-active text-white m-2">
                  {policies?.length || 0}
                </span>
              </h5>
            </div>
            {renderPolicyCards(policies, "all_policies")}
          </div>
        )
      )}
      {Object.entries(filteredData?.waiting_policies || {}).map(
        ([category, policies]) => (
          <div key={category} className="mb-4">
            <div className="d-flex justify-content-between mb-3 flex-wrap">
              <h5>
                {getCategoryDisplayName(category)}
                <span className="badge user-active text-white m-2">
                  {policies?.length || 0}
                </span>
              </h5>
            </div>
            {renderPolicyCards(policies, "waiting_policies")}
          </div>
        )
      )}
      {(!filteredData ||
        ((!filteredData.all_policies ||
          Object.keys(filteredData.all_policies).length === 0) &&
          (!filteredData.waiting_policies ||
            Object.keys(filteredData.waiting_policies).length === 0))) &&
        !isLoading && (
          <div className="card w-100">
            <div className="card-body text-center">
              <p>No Data Available...</p>
            </div>
          </div>
        )}
      <Modal
        show={showRetireModal}
        onHide={() => setShowRetireModal(false)}
        centered
      >
        <Modal.Body className="p-4">
          <div className="text-center">
            <div className="mb-3">
              <div className="warning-icon-wrapper">
                <TriangleExclamationIcon />
              </div>
            </div>
            <h5 className="fw-bold mb-2 text-muted">Retire Policy</h5>
            <p className="mb-2">
              You're going to <span className="fw-bold">"Retire this"</span>
              policy. Are you sure?
            </p>
          </div>
        </Modal.Body>
        <div className="d-flex justify-content-center mb-3 gap-4">
          <Button
            onClick={() => setShowRetireModal(false)}
            className="bg-light border-1 text-dark px-4"
            style={{ borderColor: "#cccc" }}
          >
            No, Keep it
          </Button>
          <Button
            variant="danger"
            onClick={handleRetirePolicy}
            disabled={isRetiring}
            className="px-4"
          >
            {isRetiring ? (
              <>
                <ButtonWithLoader name="Retiring..." />
              </>
            ) : (
              "Yes Retire It "
            )}
          </Button>
        </div>
      </Modal>
      <Modal
        show={showReviewModal}
        onHide={() => setShowReviewModal(false)}
        centered
        size="md"
      >
        <Modal.Header closeButton>
          <Modal.Title>Review Policy</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group">
            <label htmlFor="reviewComments">Review Comments</label>
            <textarea
              className="form-control"
              id="reviewComments"
              rows="4"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Enter your review comments here..."
            ></textarea>
          </div>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-center">
          <Button
            variant="secondary"
            onClick={() => setShowReviewModal(false)}
            disabled={isSubmittingReview}
          >
            Cancel
          </Button>
          <button
            className="btn primary-btn btn-sm mx-1 p-1 mb-2 mt-2 d-flex justify-content-center align-items-center"
            onClick={handleSubmitReview}
            disabled={isSubmittingReview}
          >
            {isSubmittingReview ? (
              <>
                <ButtonWithLoader name="Submitting..." />
              </>
            ) : (
              "Submit"
            )}
          </button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showQueriesModal}
        onHide={() => setShowQueriesModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Policy Queries</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "500px", overflowY: "auto" }}>
          <div className="d-flex flex-column">
            {selectedPolicy?.collect_queries &&
            Object.keys(selectedPolicy.collect_queries).length > 0 ? (
              Object.entries(selectedPolicy.collect_queries).flatMap(
                ([employeeName, queries]) =>
                  queries.map((query) => (
                    <div
                      key={query.id}
                      className="d-flex mb-3 justify-content-start"
                    >
                      <div
                        className="p-3 rounded-3 bg-light text-dark"
                        style={{ maxWidth: "60%", wordWrap: "break-word" }}
                      >
                        <p className="mb-1 fw-bold">{employeeName}</p>
                        <p className="mb-1">{query.query}</p>
                        <small className="d-block text-muted">
                          {new Date(query.created_at).toLocaleString()}
                        </small>
                      </div>
                    </div>
                  ))
              )
            ) : (
              <p className="text-center">No queries available.</p>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowQueriesModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        show={showCommentsModal}
        onHide={() => setShowCommentsModal(false)}
        centered
        size="md"
      >
        <Modal.Header closeButton>
          <Modal.Title>Review Comments</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="p-3">
            {selectedPolicy?.comments ? (
              <div
                dangerouslySetInnerHTML={{ __html: selectedPolicy?.comments }}
              />
            ) : (
              <p className="text-muted">
                No comments available for this policy.
              </p>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowCommentsModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        show={showEditorModal}
        onHide={() => setShowEditorModal(false)}
        size="xl"
        centered
        dialogClassName="modal-90w"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Edit Policy Content: {selectedPolicy?.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <JoditEditor
            value={editorContent}
            onBlur={(newContent) => setEditorContent(newContent)}
            config={editorConfig}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowEditorModal(false)}
            disabled={isSaving}
          >
            Close
          </Button>
          <button
            className="btn primary-btn me-2"
            onClick={() => handleSavePolicy(false)}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <ButtonWithLoader name="Saving..." />
              </>
            ) : (
              "Save"
            )}
          </button>
          {selectedPolicy?.status === "template_data" && (
            <button
              className="btn btn-primary"
              onClick={() => handleSavePolicy(true)}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <ButtonWithLoader name="Saving And Approving..." />
                </>
              ) : (
                "Save and Approve"
              )}
            </button>
          )}
        </Modal.Footer>
      </Modal>
      <Modal
        show={showApproveModal}
        onHide={() => setShowApproveModal(false)}
        centered
        size="md"
      >
        <Modal.Header closeButton>
          <Modal.Title>Approve Policy</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Next review date</Form.Label>
              <Form.Control
                type="date"
                value={reviewDate}
                onChange={(e) => setReviewDate(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowApproveModal(false)}
            disabled={isApproving}
          >
            Close
          </Button>
          <Button
            variant="success"
            onClick={() => handlePolicyDateUpdate("approve")}
            disabled={isApproving}
          >
            {isApproving ? (
              <>
                <ButtonWithLoader name="Approving..." />
              </>
            ) : (
              "Approve"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        show={showRecommissionModal}
        onHide={() => setShowRecommissionModal(false)}
        centered
        size="md"
      >
        <Modal.Header closeButton>
          <Modal.Title>Recommission Policy</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Next review date</Form.Label>
              <Form.Control
                type="date"
                value={reviewDate}
                onChange={(e) => setReviewDate(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowRecommissionModal(false)}
            disabled={isRecommissioning}
          >
            Close
          </Button>
          <Button
            variant="success"
            onClick={() => handlePolicyDateUpdate("recommission")}
            disabled={isRecommissioning}
          >
            {isRecommissioning ? (
              <>
                <ButtonWithLoader name="Recommisioning..." />
              </>
            ) : (
              "Recommision"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        show={showExtendModal}
        onHide={() => setShowExtendModal(false)}
        centered
        size="md"
      >
        <Modal.Header closeButton>
          <Modal.Title>Extend Policy</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Next review date</Form.Label>
              <Form.Control
                type="date"
                value={reviewDate}
                onChange={(e) => setReviewDate(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowExtendModal(false)}
            disabled={isExtending}
          >
            Close
          </Button>
          <Button
            variant="success"
            onClick={() => handlePolicyDateUpdate("extend")}
            disabled={isExtending}
          >
            {isExtending ? (
              <>
                <ButtonWithLoader name="Extending..." />
              </>
            ) : (
              "Extend"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        show={showChangeModal}
        onHide={() => setShowChangeModal(false)}
        centered
        size="md"
      >
        <Modal.Header closeButton>
          <Modal.Title>Change Policy</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={formik.handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Policy Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                isInvalid={formik.touched.name && formik.errors.name}
              />
              {formik.touched.name && formik.errors.name && (
                <div className="text-danger small">{formik.errors.name}</div>
              )}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Version</Form.Label>
              <div className="d-flex align-items-center gap-2">
                <div
                  className="d-flex align-items-center rounded-2"
                  style={{ border: "1px solid #ced4da" }}
                >
                  <Button
                    size="sm"
                    style={{
                      backgroundColor: "#37C650",
                      border: "none",
                      margin: "1px",
                    }}
                    onClick={() =>
                      formik.setFieldValue(
                        "majorVersion",
                        Math.max(1, formik.values.majorVersion - 1)
                      )
                    }
                    disabled={isChanging}
                  >
                    -
                  </Button>
                  <span className="mx-2">{formik.values.majorVersion}.</span>
                  <Button
                    style={{
                      backgroundColor: "#37C650",
                      border: "none",
                      margin: "1px",
                    }}
                    size="sm"
                    onClick={() =>
                      formik.setFieldValue(
                        "majorVersion",
                        formik.values.majorVersion + 1
                      )
                    }
                    disabled={isChanging}
                  >
                    +
                  </Button>
                </div>
                <div
                  className="d-flex align-items-center rounded-2"
                  style={{ border: "1px solid #ced4da" }}
                >
                  <Button
                    style={{
                      backgroundColor: "#37C650",
                      border: "none",
                      margin: "1px",
                    }}
                    size="sm"
                    onClick={() =>
                      formik.setFieldValue(
                        "minorVersion",
                        Math.max(0, formik.values.minorVersion - 1)
                      )
                    }
                    disabled={isChanging}
                  >
                    -
                  </Button>
                  <span className="mx-2">{formik.values.minorVersion}</span>
                  <Button
                    style={{
                      backgroundColor: "#37C650",
                      border: "none",
                      margin: "1px",
                    }}
                    size="sm"
                    onClick={() =>
                      formik.setFieldValue(
                        "minorVersion",
                        formik.values.minorVersion + 1
                      )
                    }
                    disabled={isChanging}
                  >
                    +
                  </Button>
                </div>
              </div>
              {(formik.touched.majorVersion || formik.touched.minorVersion) &&
                (formik.errors.majorVersion || formik.errors.minorVersion) && (
                  <div className="text-danger small">
                    {formik.errors.majorVersion || formik.errors.minorVersion}
                  </div>
                )}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Comments</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="comments"
                value={formik.values.comments}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                isInvalid={formik.touched.comments && formik.errors.comments}
                placeholder="Enter comments here..."
              />
              {formik.touched.comments && formik.errors.comments && (
                <div className="text-danger small">
                  {formik.errors.comments}
                </div>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowChangeModal(false)}
            disabled={isChanging}
          >
            Close
          </Button>
          <Button
            variant="success"
            onClick={formik.handleSubmit}
            disabled={isChanging}
          >
            {isChanging ? "Processing..." : "Save Changes"}
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        show={showLogModal}
        onHide={() => setShowLogModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Policy Logs</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "500px", overflowY: "auto" }}>
          <div className="d-flex flex-column">
            {selectedPolicy?.logs?.length > 0 ? (
              selectedPolicy.logs.map((log, index) => (
                <div
                  key={log.id}
                  className={`d-flex mb-3 ${
                    log.action === "policy_created"
                      ? "justify-content-start"
                      : "justify-content-end"
                  }`}
                >
                  <div
                    className={`p-3 rounded-3 ${
                      log.action === "policy_created"
                        ? "bg-light text-dark"
                        : "bg-primary text-white"
                    }`}
                    style={{ maxWidth: "60%", wordWrap: "break-word" }}
                  >
                    <p className="mb-1">{log.description.body}</p>
                    <small className="d-block text-muted">
                      {new Date(log.created_at).toLocaleString()}
                    </small>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center">No logs available.</p>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLogModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AllPolicy;
