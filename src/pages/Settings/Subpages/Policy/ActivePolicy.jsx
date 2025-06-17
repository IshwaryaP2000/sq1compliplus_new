import { useEffect, useState, useMemo } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { getApi, postApi } from "../../../../services/apiService";
import { ucFirst } from "../../../../utils/UtilsGlobalData";
import Searchbar from "../../../../components/Search/Searchbar";
import ButtonWithLoader from "../../../../components/Button/ButtonLoader";
import {
  createDebouncedSearch,
  fetchSearchResults,
  highlightText,
} from "../../../../components/Search/useSearchAndSort";
import { EllipsisIcon, TriangleExclamationIcon, XmarkIcon } from "../../../../components/Icons/Icons";

const ActivePolicy = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showRetireModal, setShowRetireModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showQueriesModal, setShowQueriesModal] = useState(false);
  const [reviewComment, setReviewComment] = useState("");
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [isRetiring, setIsRetiring] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [openModalPolicyId, setOpenModalPolicyId] = useState(null);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredLength, setFilteredLength] = useState(0);
  const [searchVal, setSearchVal] = useState("");

  const getActivePolicy = async () => {
    try {
      setIsLoading(true);
      const response = await getApi("/policy/active");
      const policies = response?.data?.data || [];
      setData(policies);
      setFilteredUsers(policies);
      setFilteredLength(policies.length);
    } catch (error) {
      console.error("Error fetching active policies:", error);
      setData([]);
      setFilteredUsers([]);
      setFilteredLength(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetirePolicy = async () => {
    try {
      setIsRetiring(true);
      await postApi(`/policy/retire/${selectedPolicy?.id}`);
      getActivePolicy();
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
      getActivePolicy();
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setIsSubmittingReview(false);
      setShowReviewModal(false);
    }
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

  const handleSearch = (searchVal) => {
    setSearchVal(searchVal);
    debouncedFetchSearchResults({
      search: searchVal,
    });
  };

  const debouncedFetchSearchResults = useMemo(
    () =>
      createDebouncedSearch((params) => {
        fetchSearchResults(
          "/policy/active",
          params,
          setFilteredUsers,
          setIsLoading,
          setFilteredLength,
          () => {}
        );
      }, 300),
    []
  );

  useEffect(() => {
    getActivePolicy();
  }, []);

  return (
    <>
      <div className="d-flex justify-content-between mb-3 flex-wrap">
        <h5>
          Active Policies
          {data?.length > 0 && (
            <span className="badge user-active text-white m-1">
              {data?.length}
            </span>
          )}
        </h5>
        <Searchbar onSearch={handleSearch} placeHolder={"Search"} />
      </div>

      <div className="pb-5 mb-5">
        {isLoading ? (
          <div className="row w-100">
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
        ) : filteredUsers?.length > 0 ? (
          <div className="row w-100">
            {filteredUsers.map((policy) => {
              const agreed = policy.accepted_count || 0;
              const employees = policy.employees || 0;
              let agreedWidth = 0;
              let employeesWidth = 0;

              if (employees > 0) {
                agreedWidth = (agreed / employees) * 100;
                employeesWidth = 100 - agreedWidth;
              }

              return (
                <div
                  style={{ position: "relative" }}
                  className="col-md-6 mb-1"
                  key={policy.id}
                >
                  <div
                    className={`card p-4 mb-3 rounded-4 activepolicy-card ${
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
                          <div className="d-flex">
                            <div className="poilcy-status d-flex me-2">
                              <div
                                className="status-color me-2"
                                style={{ background: "#37C650" }}
                              ></div>
                              <span
                                dangerouslySetInnerHTML={{
                                  __html: highlightText(
                                    ucFirst(policy?.status) || "",
                                    searchVal
                                  ),
                                }}
                              ></span>
                            </div>
                            <p className="policy-review-date mb-0">
                              <span
                                dangerouslySetInnerHTML={{
                                  __html: highlightText(
                                    `Review Date - ${
                                      policy?.expiry_date || ""
                                    }`,
                                    searchVal
                                  ),
                                }}
                              ></span>
                            </p>
                          </div>
                          {openModalPolicyId === policy.id && (
                            <div className="policy-modal-overlay rounded-4">
                              <div className="card p-4 rounded-4 policy-card02">
                                <button
                                  onClick={(e) =>
                                    handleCloseModal(e, policy.id)
                                  }
                                  className="close-btn"
                                >
                                  <XmarkIcon/>
                                </button>
                                <div>
                                  <h4 className="mb-3 text-center">Actions</h4>
                                  <div className="d-flex justify-content-center">
                                    {policy?.isUserPolicy === true ? (
                                      <>
                                        <button
                                          onClick={() =>
                                            window.open(
                                              policy?.pdf_url,
                                              "_blank"
                                            )
                                          }
                                          className="policy-buttons"
                                        >
                                          View
                                        </button>
                                        <button
                                          onClick={() => {
                                            setSelectedPolicy(policy);
                                            setShowQueriesModal(true);
                                          }}
                                          className="policy-buttons"
                                        >
                                          Queries
                                        </button>
                                        <button
                                          onClick={() => {
                                            setSelectedPolicy(policy);
                                            setReviewComment("");
                                            setShowReviewModal(true);
                                          }}
                                          className="policy-buttons"
                                        >
                                          Review
                                        </button>
                                        <button
                                          onClick={() => {
                                            setSelectedPolicy(policy);
                                            setShowRetireModal(true);
                                          }}
                                          className="policy-buttons"
                                        >
                                          Retire
                                        </button>
                                        <button
                                          onClick={() => {
                                            setSelectedPolicy(policy);
                                            setShowLogModal(true);
                                          }}
                                          className="policy-buttons"
                                        >
                                          Logs
                                        </button>
                                      </>
                                    ) : (
                                      <button
                                        onClick={() => {
                                          setSelectedPolicy(policy);
                                          setShowLogModal(true);
                                        }}
                                        className="policy-buttons"
                                      >
                                        Logs
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="d-flex align-items-center">
                          <span className="policy-version m-2">
                            V - {policy.version}
                          </span>
                          <EllipsisIcon/>
                        </div>
                      </div>
                      <div className="d-flex justify-content-between">
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
                        <div style={{ width: "250px" }}>
                          <p className="mb-0 fs-16 text-gray-light mb-2">
                            Agreed
                          </p>
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
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card w-100">
            <div className="card-body text-center">
              <p>No Data Available...</p>
            </div>
          </div>
        )}
      </div>

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
              "Yes Retire"
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
              selectedPolicy.logs.map((log) => (
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
    </>
  );
};

export default ActivePolicy;
