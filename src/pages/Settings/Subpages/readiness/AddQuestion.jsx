import { useState, useEffect } from "react";
import { postApi, getApi } from "../../../../services/apiService";
import { toast } from "react-toastify";
import Select from "react-select";
import { Modal, Button } from "react-bootstrap";
import usePageTitle from "../../../../utils/usePageTitle";
import ButtonWithLoader from "../../../../components/Button/ButtonLoader";
import { TriangleExclamationIcon } from "../../../../components/Icons/Icons";

function AddQuestion() {
  usePageTitle("Readiness Questions");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [uploadedQuestions, setUploadedQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [complianceTypes, setComplianceTypes] = useState([]);
  const [fieldTypes, setFieldTypes] = useState([]);
  const [showDelete, setShowDelete] = useState(false); // Renamed to match provided modal
  const [questionIdToDelete, setQuestionIdToDelete] = useState(null);
  const [isValidated, setIsValidated] = useState(false);

  // Handler functions for changes (unchanged)
  const handleComplianceTypeChange = (value, index) => {
    const updatedQuestions = [...uploadedQuestions];
    updatedQuestions[index].compliance_type_id = value
      ? parseInt(value, 10)
      : null;
    setUploadedQuestions(updatedQuestions);
  };

  const handleCategoryChange = (value, index) => {
    const updatedQuestions = [...uploadedQuestions];
    updatedQuestions[index].compliance_category_id = value
      ? parseInt(value, 10)
      : null;
    setUploadedQuestions(updatedQuestions);
  };

  const handleQuestionChange = (e, index) => {
    const updatedQuestions = [...uploadedQuestions];
    updatedQuestions[index].question = e.target.value;
    setUploadedQuestions(updatedQuestions);
  };

  const handleDescriptionChange = (e, index) => {
    const updatedQuestions = [...uploadedQuestions];
    updatedQuestions[index].description = e.target.value;
    setUploadedQuestions(updatedQuestions);
  };

  const handleFieldTypeChange = (value, index) => {
    const updatedQuestions = [...uploadedQuestions];
    updatedQuestions[index].field_type = value;
    setUploadedQuestions(updatedQuestions);
  };

  const handleDropdownOptionsChange = (e, index) => {
    const updatedQuestions = [...uploadedQuestions];
    const options = e.target.value
      .split(",")
      .map((opt) => opt.trim())
      .filter((opt) => opt && opt !== "self" && opt !== "others"); // Filter out "self" and "others"
    updatedQuestions[index].dropdown_options =
      options.length > 0 ? options : [];
    setUploadedQuestions(updatedQuestions);
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;
    const validTypes = [
      "application/vnd.ms-excel",
      "text/csv",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (!validTypes.includes(selectedFile.type)) {
      setError("Please upload a valid file (Excel or CSV).");
      setFile(null);
    } else {
      setError("");
      setFile(selectedFile);
    }
  };

  const fetchUploadedQuestions = async () => {
    try {
      setIsLoading(true);
      const response = await getApi("get-uploaded-questions");
      if (response?.data?.data) {
        const flatQuestions = flattenQuestions(response.data.data);
        setUploadedQuestions(flatQuestions);
      }
    } catch (error) {
      console.error("Error fetching uploaded questions:", error);
      toast.error("Error fetching uploaded questions");
    } finally {
      setIsLoading(false);
    }
  };

  const flattenQuestions = (questions) => {
    const flatList = [];
    const fieldTypeMapping = {
      radio_with_sub_action: "radio with sub action",
      tools: "tools",
      file: "file",
      text: "text",
      dropdown: "dropdown",
      radio: "radio",
      checkbox: "checkbox",
    };

    const processSubQuestions = (
      subQuestions,
      parentId,
      parentIndex,
      subQuestionCounter,
      prefix,
      header
    ) => {
      const result = [];
      Object.entries(subQuestions || {}).forEach(([subId, sub]) => {
        const displayOrder = `${prefix}.${subQuestionCounter}`;
        const hasSubQuestions =
          sub.field_type === "radio_with_sub_action" &&
          (Object.keys(sub.sub_questions?.yes || {}).length > 0 ||
            Object.keys(sub.sub_questions?.no || {}).length > 0);

        result.push({
          id: subId,
          question_type: "Sub",
          compliance_type_id: parseInt(
            flatList.find((q) => q.id === parentId)?.compliance_type_id,
            10
          ),
          compliance_category_id: parseInt(
            flatList.find((q) => q.id === parentId)?.compliance_category_id,
            10
          ),
          question: sub.question || "",
          description: sub.description || "",
          field_type: fieldTypeMapping[sub.field_type] || sub.field_type || "",
          dropdown_options: sub.dropdown_options
            ? sub.dropdown_options.filter(
                (opt) => opt !== "self" && opt !== "others"
              )
            : [],
          parent_id: parentId,
          displayOrder: displayOrder,
          header: header,
          hasSubQuestions: hasSubQuestions,
        });

        if (sub.field_type === "radio_with_sub_action" && sub.sub_questions) {
          let nestedCounter = 1;
          ["yes", "no"].forEach((key) => {
            const nestedSubs = sub.sub_questions[key] || {};
            Object.entries(nestedSubs).forEach(([nestedId, nestedSub]) => {
              const nestedHasSubQuestions =
                nestedSub.field_type === "radio_with_sub_action" &&
                (Object.keys(nestedSub.sub_questions?.yes || {}).length > 0 ||
                  Object.keys(nestedSub.sub_questions?.no || {}).length > 0);

              result.push({
                id: nestedId,
                question_type: "Sub",
                compliance_type_id: parseInt(
                  flatList.find((q) => q.id === parentId)?.compliance_type_id,
                  10
                ),
                compliance_category_id: parseInt(
                  flatList.find((q) => q.id === parentId)
                    ?.compliance_category_id,
                  10
                ),
                question: nestedSub.question || "",
                description: nestedSub.description || "",
                field_type:
                  fieldTypeMapping[nestedSub.field_type] ||
                  nestedSub.field_type ||
                  "",
                dropdown_options: nestedSub.dropdown_options
                  ? nestedSub.dropdown_options.filter(
                      (opt) => opt !== "self" && opt !== "others"
                    )
                  : [],
                parent_id: subId,
                displayOrder: `${displayOrder}.${nestedCounter}`,
                header: key,
                hasSubQuestions: nestedHasSubQuestions,
              });
              nestedCounter++;
            });
          });
        }
        subQuestionCounter++;
      });
      return result;
    };

    questions.forEach((parent, parentIndex) => {
      flatList.push({
        id: parent.id,
        question_type: "Main",
        compliance_type_id: parseInt(parent.compliance_type, 10) || null,
        compliance_category_id: parseInt(parent.category, 10) || null,
        question: parent.question || "",
        description: parent.description || "",
        field_type: null,
        dropdown_options: null,
        parent_id: null,
        displayOrder: `${parentIndex + 1}`,
        header: "-",
        hasSubQuestions: false,
      });

      let subQuestionCounter = 1;
      const yesSubs = processSubQuestions(
        parent.sub_questions?.yes || {},
        parent.id,
        parentIndex,
        subQuestionCounter,
        `${parentIndex + 1}`,
        "Yes"
      );
      flatList.push(...yesSubs);
      subQuestionCounter += Object.keys(parent.sub_questions?.yes || {}).length;

      const noSubs = processSubQuestions(
        parent.sub_questions?.no || {},
        parent.id,
        parentIndex,
        subQuestionCounter,
        `${parentIndex + 1}`,
        "No"
      );
      flatList.push(...noSubs);
    });

    return flatList;
  };

  const fetchCategories = async () => {
    try {
      const response = await getApi("compliance-category");
      setCategories(
        response?.data?.map((cat) => ({
          value: parseInt(cat.id, 10),
          label: cat.name,
        })) || []
      );
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchFieldTypes = async () => {
    try {
      const response = await getApi("get-field-type");
      const fieldTypeMapping = {
        text: "text",
        dropdown: "dropdown",
        radio: "radio",
        checkbox: "checkbox",
        "file/skip": "file",
        "tools/file/skip": "tools",
      };

      const formattedFieldTypes =
        response?.data?.data?.map((type) => ({
          value: fieldTypeMapping[type] || type,
          label:
            type === "radio_with_sub_action" ? "radio with sub action" : type,
        })) || [];
      setFieldTypes(formattedFieldTypes);
    } catch (error) {
      console.error("Error fetching field types:", error);
    }
  };

  const fetchComplianceTypes = async () => {
    try {
      const response = await getApi("compliance-types");
      setComplianceTypes(
        response?.data?.data?.map((type) => ({
          value: parseInt(type.id, 10),
          label: type.name,
        })) || []
      );
    } catch (error) {
      console.error("Error fetching compliance types:", error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setError("File is required.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await postApi("/questions-import", formData);
      toast.success(response?.data?.data || "File uploaded successfully");
      setFile(null);
      setError("");
      document.getElementById("fileInput").value = null;
      fetchUploadedQuestions();
      setIsValidated(false);
    } catch (error) {
      console.error("Error while uploading questions:", error);
    }
  };

  // Updated to use the new modal naming convention
  const handleDelete = async (id) => {
    setQuestionIdToDelete(id);
    setShowDelete(true);
  };

  // Updated close handler for the new modal
  const handleCloseDelete = () => {
    setShowDelete(false);
    setQuestionIdToDelete(null);
  };

  // Renamed to match functionality but using the new modal
  const confirmDelete = async () => {
    if (!questionIdToDelete) return;

    try {
      setUploadedQuestions((prevQuestions) =>
        prevQuestions.filter((q) => q.id !== questionIdToDelete)
      );
      const questionToDelete = uploadedQuestions.find(
        (q) => q.id === questionIdToDelete
      );
      if (!questionToDelete) return;

      const payload = {
        question_id: questionIdToDelete,
        type: questionToDelete.question_type.toLowerCase(),
      };
      setIsLoading(true);
      const response = await postApi("/delete-question", payload);

      if (!response?.data?.success) {
        fetchUploadedQuestions();
        return;
      }
      fetchUploadedQuestions();
    } catch (error) {
      console.error("Error deleting question:", error);
      fetchUploadedQuestions();
    } finally {
      setIsLoading(false);
      handleCloseDelete();
    }
  };

  const validateQuestions = async () => {
    if (!uploadedQuestions.length) {
      toast.error("No questions to validate.");
      return;
    }

    const mainQuestions = {};
    const subQuestions = {};
    const fieldTypeMapping = {
      text: "text",
      dropdown: "dropdown",
      radio: "radio",
      checkbox: "checkbox",
      file: "file/skip",
      tools: "tools/file/skip",
      "radio with sub action": "radio_with_sub_action",
    };

    uploadedQuestions.forEach((question) => {
      if (question.question_type === "Main") {
        mainQuestions[question.id] = {
          type: question.compliance_type_id || "",
          compliance_category_id: question.compliance_category_id || "",
          question: question.question || "",
          description: question.description || "",
        };
      } else if (question.question_type === "Sub") {
        const dropdownOptionsString = question.dropdown_options
          ? question.dropdown_options.join(", ")
          : "";
        const backendFieldType = fieldTypeMapping[question.field_type] || "";
        subQuestions[question.id] = {
          question: question.question || "",
          description: question.description || "",
          field_type: backendFieldType,
          dropdown_options: dropdownOptionsString,
        };
      }
    });

    try {
      setIsLoading(true);
      const response = await postApi("validate-questions", {
        main: mainQuestions,
        sub: subQuestions,
      });

      if (response?.data?.success) {
        setIsValidated(true);
      } else {
        console.error("Validation Errors:", response?.data?.message);
        response?.data?.message.forEach((msg) => toast.error(msg));
      }
    } catch (error) {
      console.error("Error validating questions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchComplianceTypes();
    fetchFieldTypes();
    fetchUploadedQuestions();
  }, []);

  useEffect(() => {
    console.error("Uploaded questions updated:", uploadedQuestions);
  }, [uploadedQuestions]);

  // Helper function to check if field type allows dropdown options
  const isDropdownFieldType = (fieldType) => {
    return ["checkbox", "radio", "dropdown"].includes(fieldType);
  };

  const handleDownload = async () => {
    try {
      const response = await getApi("sample-compliance");
      const downloadUrl = response?.data?.data;
      if (!downloadUrl) {
        throw new Error("Download URL is missing in the response.");
      }
      if (downloadUrl.startsWith("http")) {
        window.location.href = downloadUrl;
      } else {
        throw new Error("Invalid URL provided for downloading.");
      }
    } catch (error) {
      console.error("Error downloading sample file:", error);
    }
  };

  return (
    <>
      <div className="justify-items-center">
        <div className="card form-card w-100">
          <h4 className="text-center mb-2">Upload Readiness Questions</h4>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Upload File</label>
              <input
                type="file"
                id="fileInput"
                className="styled-file-upload w-100 mt-2"
                onChange={handleFileChange}
                disabled={isLoading}
              />
              {error && <div className="text-danger">{error}</div>}
            </div>
            <span
              className="text-primary cursor-pointer"
              onClick={handleDownload}
            >
              Download Sample <i className="fa-solid fa-download ms-1"></i>
            </span>
            <center>
              <button
                type="submit"
                className="btn btn-sm primary-btn mt-3"
                disabled={isLoading}
              >
                {/* {isLoading ? "Uploading..." : "Upload"} */}
                {isLoading ? (
                  <>
                    <ButtonWithLoader name="Uploading..." />
                  </>
                ) : (
                  "Upload"
                )}
              </button>
            </center>
          </form>
        </div>

        {!isValidated && uploadedQuestions.length > 0 && (
          <div className="mt-5 w-100">
            <div className="card validate-question_card-wrapper">
              <div className="card-body">
                <h5 className="mb-3">Uploaded Questions</h5>
                <table className="table">
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>Question Type</th>
                      <th>Answer For</th>
                      <th>Compliance Type</th>
                      <th>Category</th>
                      <th>Question</th>
                      <th>Description</th>
                      <th>Field Type</th>
                      <th>Dropdown Options</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      // Array.from({ length: 3 }).map((_, rowIndex) => (
                      //   <tr key={rowIndex}>
                      //     {Array.from({ length: 10 }).map((_, colIndex) => (
                      //       <td key={colIndex}>
                      //         <p className="placeholder-glow">
                      //           <span className="placeholder col-12 bg-secondary"></span>
                      //         </p>
                      //       </td>
                      //     ))}
                      //   </tr>
                      // )
                      <Loader rows={3} cols={10} />
                    ) : (
                      uploadedQuestions.map((question, index) => (
                        <tr key={question.id || index}>
                          <td>{question.displayOrder}</td>
                          <td
                            style={{
                              whiteSpace: "normal",
                              wordBreak: "break-word",
                              maxWidth: "150px",
                            }}
                          >
                            {question.question_type}
                          </td>
                          <td>{question.header}</td>
                          <td style={{ maxWidth: "200px" }}>
                            {question.question_type === "Main" ? (
                              <Select
                                options={complianceTypes}
                                value={complianceTypes.find(
                                  (type) =>
                                    type.value === question.compliance_type_id
                                )}
                                onChange={(selectedOption) =>
                                  handleComplianceTypeChange(
                                    selectedOption?.value || null,
                                    index
                                  )
                                }
                                isSearchable={false}
                                placeholder="Select..."
                                isDisabled={isLoading}
                              />
                            ) : (
                              "-"
                            )}
                          </td>
                          <td style={{ maxWidth: "150px" }}>
                            {question.question_type === "Main" ? (
                              <Select
                                options={categories}
                                value={categories.find(
                                  (cat) =>
                                    cat.value ===
                                    question.compliance_category_id
                                )}
                                onChange={(selectedOption) =>
                                  handleCategoryChange(
                                    selectedOption?.value || null,
                                    index
                                  )
                                }
                                isSearchable={false}
                                placeholder="Select..."
                                isDisabled={isLoading}
                              />
                            ) : (
                              "-"
                            )}
                          </td>
                          <td>
                            <input
                              type="text"
                              value={question.question || ""}
                              onChange={(e) => handleQuestionChange(e, index)}
                              className="form-control"
                              style={{ width: "300px" }}
                              disabled={isLoading}
                            />
                          </td>
                          <td>
                            <textarea
                              value={question.description || ""}
                              onChange={(e) =>
                                handleDescriptionChange(e, index)
                              }
                              className="form-control"
                              rows="2"
                              style={{ width: "250px", resize: "vertical" }}
                              disabled={isLoading}
                            />
                          </td>
                          <td
                            className="add-question_field-type"
                            style={{ maxWidth: "150px" }}
                          >
                            {question.question_type === "Sub" ? (
                              question.field_type ===
                              "radio with sub action" ? (
                                question.hasSubQuestions ? (
                                  <input
                                    type="text"
                                    value="radio with sub action"
                                    className="form-control"
                                    disabled={true}
                                  />
                                ) : (
                                  <Select
                                    options={fieldTypes}
                                    value={fieldTypes.find(
                                      (type) =>
                                        type.value === question.field_type
                                    )}
                                    onChange={(selectedOption) =>
                                      handleFieldTypeChange(
                                        selectedOption?.value || null,
                                        index
                                      )
                                    }
                                    isSearchable={false}
                                    placeholder="Select..."
                                    isClearable={false}
                                    isDisabled={isLoading}
                                  />
                                )
                              ) : (
                                <Select
                                  options={fieldTypes}
                                  value={fieldTypes.find(
                                    (type) => type.value === question.field_type
                                  )}
                                  onChange={(selectedOption) =>
                                    handleFieldTypeChange(
                                      selectedOption?.value || null,
                                      index
                                    )
                                  }
                                  isSearchable={false}
                                  placeholder="Select..."
                                  isClearable={false}
                                  isDisabled={isLoading}
                                />
                              )
                            ) : (
                              "-"
                            )}
                          </td>
                          <td>
                            {question.question_type === "Sub" &&
                            isDropdownFieldType(question.field_type) ? (
                              <textarea
                                value={
                                  question.dropdown_options?.length > 0
                                    ? question.dropdown_options.join(", ")
                                    : ""
                                }
                                onChange={(e) =>
                                  handleDropdownOptionsChange(e, index)
                                }
                                className="form-control"
                                rows="2"
                                style={{ width: "250px", resize: "vertical" }}
                                placeholder="-"
                                disabled={isLoading}
                              />
                            ) : (
                              "-"
                            )}
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(question.id)}
                              disabled={isLoading}
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                <div className="d-flex justify-content-center mt-3">
                  <button
                    type="button"
                    className="btn btn-sm primary-btn mt-3"
                    onClick={validateQuestions}
                    disabled={isLoading}
                  >
                    {isLoading ? "Validating..." : "Validate Questions"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New Modal Design for Delete Confirmation */}
      <Modal show={showDelete} onHide={handleCloseDelete} centered>
        <Modal.Body className="p-4">
          <div className="text-center">
            <div className="mb-3">
              <div className="warning-icon-wrapper">
                <TriangleExclamationIcon />
              </div>
            </div>
            <h5 className="fw-bold mb-2 text-muted">Delete Question</h5>
            <p className="mb-2">
              You're going to <span className="fw-bold">"Delete this"</span>
              question. Are you sure?
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
            onClick={confirmDelete}
            className="px-4"
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Yes, Delete!"}
          </Button>
        </div>
      </Modal>
    </>
  );
}

export default AddQuestion;
