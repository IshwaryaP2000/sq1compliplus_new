import { useEffect, useState, useMemo } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import JoditEditor from "jodit-react";
import { getApi, postApi } from "../../../../services/apiService";
import { ucFirst } from "../../../../utils/UtilsGlobalData";
import Searchbar from "../../../../components/Search/Searchbar";
import ButtonWithLoader from "../../../../components/Button/ButtonLoader";
import {
  createDebouncedSearch,
  fetchSearchResults,
  highlightText,
} from "../../../../components/Search/useSearchAndSort";

const PendingApproval = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [editorContent, setEditorContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [reviewDate, setReviewDate] = useState("");
  const [showLogModal, setShowLogModal] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredLength, setFilteredLength] = useState(0);
  const [searchVal, setSearchVal] = useState("");
  const [openModalPolicyId, setOpenModalPolicyId] = useState(null);

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

  const getPendingApproval = async () => {
    try {
      setIsLoading(true);
      const response = await getApi("/policy/pending-approval");
      const pendingData = response?.data?.data?.pending_approval || [];
      setData(pendingData);
      setFilteredUsers(pendingData);
      setFilteredLength(pendingData.length);
    } catch (error) {
      console.error("Error fetching pending approvals:", error);
      setData([]);
      setFilteredUsers([]);
      setFilteredLength(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePolicy = async () => {
    try {
      setIsSaving(true);
      const fieldName = `data_${selectedPolicy?.id}`;
      const payload = {
        [fieldName]: editorContent,
        type: "save",
      };
      await postApi(`/policy/save/policy-docs/${selectedPolicy?.id}`, payload);
      getPendingApproval();
      setShowEditorModal(false);
    } catch (error) {
      console.error("Error saving policy:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApprovePolicy = async () => {
    try {
      setIsApproving(true);
      const fieldName = `expiry_date_${selectedPolicy?.id}`;
      const payload = {
        [fieldName]: reviewDate,
        type: "save",
      };
      await postApi(`/policy/approve/${selectedPolicy?.id}`, payload);
      getPendingApproval();
      setShowApproveModal(false);
    } catch (error) {
      console.error("Error approving policy:", error);
    } finally {
      setIsApproving(false);
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

  const handleCloseEditor = () => {
    setShowEditorModal(false);
  };

  const handleCloseApproveModal = () => {
    setShowApproveModal(false);
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
          "/policy/pending-approval",
          params,
          setFilteredUsers,
          setIsLoading,
          setFilteredLength,
          () => {} // Empty setPageIndex
        );
      }, 300),
    []
  );

  useEffect(() => {
    getPendingApproval();
  }, []);

  const renderApprovalBadges = (policy) => {
    if (policy?.isUserPolicy) {
      if (policy?.is_approved) {
        return (
          <div className="d-flex flex-column align-items-center">
            <span className="badge badge-sm bg-success mb-1">
              For me: Approved
            </span>
            <span className="badge badge-sm bg-warning text-dark">
              Waiting for others
            </span>
          </div>
        );
      } else {
        return (
          <span className="badge badge-sm bg-warning text-dark">
            For me: Pending
          </span>
        );
      }
    } else {
      return <span className="badge badge-sm bg-secondary">Other User</span>;
    }
  };

  return (
    <>
      <div className="d-flex justify-content-between mb-3 flex-wrap">
        <h5>
          Pending Approval Policies
          {data?.length > 0 && (
            <span className="badge user-active text-white m-1">
              {data?.length}
            </span>
          )}
        </h5>
        <Searchbar onSearch={handleSearch} placeHolder={"Search"} />
      </div>

      <div>
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
            {filteredUsers.map((policy) => (
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
                        <div className="d-flex flex-wrap">
                          {policy?.isUserPolicy ? (
                            policy?.is_approved ? (
                              <>
                                <div className="policy-approval-date mb-2 me-2 d-flex flex-wrap">
                                  <p className="mb-0">For me: Approved</p>
                                </div>
                                <div className="policy-waiting-date mb-2 me-2 d-flex flex-wrap">
                                  <img
                                    src="/images/navbar-img/warning-!.svg"
                                    alt="Warning"
                                    className="svg-filter me-2"
                                  />
                                  <p className="mb-0">Waiting for others</p>
                                </div>
                              </>
                            ) : (
                              <div className="policy-approval-date mb-2 me-2 d-flex flex-wrap">
                                <img
                                  src="/images/navbar-img/warning-!.svg"
                                  alt="Warning"
                                  className="svg-filter me-2"
                                />
                                <p className="mb-0">For me: Pending</p>
                              </div>
                            )
                          ) : (
                            <div className="policy-other-user mb-2 me-2 d-flex flex-wrap">
                              <img
                                src="/images/navbar-img/other-user.svg"
                                alt="Other User"
                                className="svg-filter me-2"
                              />
                              <p className="mb-0">Other User</p>
                            </div>
                          )}
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
                    <div>
                      <p className="mb-0 fs-14 text-gray-light mb-2">
                        Comments
                      </p>
                      <div className="waiting-policycomments">
                        <p className="mb-0">
                          {policy?.comments || "No comments"}
                        </p>
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
                              {(policy?.status === "pending_approval" ||
                                policy?.status === "template_data") &&
                                !policy?.isUserPolicy && (
                                  <div className="btn-group mb-2">
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
                                    <button
                                      className="policy-buttons"
                                      onClick={() => {
                                        setSelectedPolicy(policy);
                                        setShowLogModal(true);
                                      }}
                                    >
                                      Log
                                    </button>
                                  </div>
                                )}
                              {policy?.isUserPolicy &&
                                policy?.status === "pending_approval" && (
                                  <div className="btn-group mb-2">
                                    <button
                                      className="policy-buttons"
                                      onClick={() => {
                                        handleShowApproveModal(policy);
                                      }}
                                    >
                                      Approve
                                    </button>
                                    <button
                                      className="policy-buttons"
                                      onClick={() => {
                                        setSelectedPolicy(policy);
                                        setShowLogModal(true);
                                      }}
                                    >
                                      Log
                                    </button>
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
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
        show={showEditorModal}
        onHide={handleCloseEditor}
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
            onClick={handleCloseEditor}
            disabled={isSaving}
          >
            Close
          </Button>
          <button
            className="btn primary-btn me-2"
            onClick={() => handleSavePolicy()}
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
        </Modal.Footer>
      </Modal>

      <Modal
        show={showApproveModal}
        onHide={handleCloseApproveModal}
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
            onClick={handleCloseApproveModal}
            disabled={isApproving}
          >
            Close
          </Button>
          <Button
            variant="success"
            onClick={handleApprovePolicy}
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
    </>
  );
};

export default PendingApproval;
