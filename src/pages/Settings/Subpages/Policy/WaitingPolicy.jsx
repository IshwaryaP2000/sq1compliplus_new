import { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
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

const WaitingPolicy = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [editorContent, setEditorContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredLength, setFilteredLength] = useState(0);
  const [searchVal, setSearchVal] = useState("");
  const [openModalPolicyId, setOpenModalPolicyId] = useState(null);
  const location = useLocation();

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

  const getWaitingPolicy = async () => {
    try {
      setIsLoading(true);
      const response = await getApi("/policy/waiting");
      const docData = response?.data?.data?.doc_data || [];
      const templateData = response?.data?.data?.template_data || [];
      const combinedData = [...docData, ...templateData];
      setData(combinedData);
      setFilteredUsers(combinedData);
      setFilteredLength(combinedData.length);
    } catch (error) {
      console.error("Error fetching waiting policies:", error);
      setData([]);
      setFilteredUsers([]);
      setFilteredLength(0);
    } finally {
      setIsLoading(false);
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
      getWaitingPolicy();
      setShowEditorModal(false);
    } catch (error) {
      console.error("Error saving policy:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseEditor = () => {
    setShowEditorModal(false);
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

  const getCategoryDisplayName = (category) => {
    if (category === "doc_data") {
      return "Existing Policy";
    }
    return ucFirst(category.replace(/_/g, " "));
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
          "/policy/waiting",
          params,
          setFilteredUsers,
          setIsLoading,
          setFilteredLength,
          () => { } // Empty setPageIndex since not used
        );
      }, 300),
    []
  );

  useEffect(() => {
    getWaitingPolicy();
  }, []);

  useEffect(() => {
    if (location.state?.refresh) {
      getWaitingPolicy();
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location.state]);

  return (
    <>
      <div className="d-flex justify-content-between mb-3 flex-wrap">
        <h5>
          Waiting Policies
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
            {filteredUsers.map((policy) => (
              <div
                style={{ position: "relative" }}
                className="col-md-6 mb-1"
                key={policy.id}
              >
                <div
                  className={`card p-4 mb-3 rounded-4 ${openModalPolicyId === policy.id ? "blur-effect" : ""
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
                        <div className="d-flex" style={{ flexWrap: "wrap" }}>
                          <p className="policy-waiting-date mb-2 me-2 d-flex">
                            <p className="mb-0">
                              {getCategoryDisplayName(policy?.status)}
                            </p>
                          </p>
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
                      <div className="policy-details ms-2 me-3">
                        <p className="mb-0 fs-14 text-gray-light mb-2">
                          Status
                        </p>
                        <p className="policy-waiting-status mb-0">
                          {policy?.status
                            ? ucFirst(policy.status.replace(/_/g, " "))
                            : "N/A"}
                        </p>
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
                        <div className="card p-4 px-5 rounded-4 policy-card02">
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
                  className={`d-flex mb-3 ${log.action === "policy_created"
                    ? "justify-content-start"
                    : "justify-content-end"
                    }`}
                >
                  <div
                    className={`p-3 rounded-3 ${log.action === "policy_created"
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
          <button
            className="btn btn-primary"
            onClick={() => handleSavePolicy(true)}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <ButtonWithLoader name="Saving and Approving..." />
              </>
            ) : (
              "Save and Approve"
            )}
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default WaitingPolicy;
