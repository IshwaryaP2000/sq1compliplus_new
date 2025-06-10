import { useState, useEffect } from "react";
import { Offcanvas, Form, Button, Modal } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import JoditEditor from "jodit-react";
import { useLocation, useNavigate } from "react-router-dom";
import { getApi, postApi } from "../../../../services/apiService";
import ButtonWithLoader from "../../../../components/Button/ButtonLoader";

const Policy = () => {
  const location = useLocation();
  const isEmployeesPage = location.pathname.includes("/policy/employees");
  const isBulkUploadPage = location.pathname.includes("/bulk-upload");
  const [showCanvas, setShowCanvas] = useState(false);
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [originalContent, setOriginalContent] = useState("");
  const navigate = useNavigate();

  const initialValues = {
    name: "",
    type: "",
    title: "",
    comments: "",
    policyFile: null,
    majorVersion: 1,
    minorVersion: 0,
    policyContent: "",
    tempDataId: null,
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Policy Name is required*"),
    type: Yup.string()
      .oneOf(["template", "new"], "Invalid type")
      .required("Type is required*"),
    title: Yup.string().required("Policy Title is required*"),
    comments: Yup.string(),
    policyFile: Yup.mixed().when("type", {
      is: (type) => type === "new",
      then: (schema) =>
        schema
          .required("Policy file is required for new policy")
          .test(
            "fileType",
            "Only PDF files are allowed",
            (value) => !value || (value && value.type === "application/pdf")
          ),
      otherwise: (schema) => schema.nullable().notRequired(),
    }),
    policyContent: Yup.string().when("type", {
      is: (type) => type === "template",
      then: (schema) =>
        schema.required("Policy content is required for template"),
      otherwise: (schema) => schema.nullable().notRequired(),
    }),
    majorVersion: Yup.number()
      .min(1, "Major version must be at least 1")
      .required("Major version is required"),
    minorVersion: Yup.number()
      .min(0, "Minor version cannot be negative")
      .required("Minor version is required"),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, { resetForm, setErrors }) => {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append(
        "type",
        values.type === "template" ? "from_template" : "new_policy"
      );
      formData.append("title", values.title);
      formData.append("comments", values.comments);
      formData.append(
        "version",
        `${values.majorVersion}.${values.minorVersion}`
      );

      if (values.type === "new" && values.policyFile) {
        formData.append("policy_file", values.policyFile);
      }

      if (values.type === "template" && values.tempDataId) {
        const hasContentChanged = values.policyContent !== originalContent;
        if (hasContentChanged) {
          formData.append(
            `temp_data_${values.tempDataId}`,
            values.policyContent
          );
        } else {
          formData.append(
            `temp_data_${values.tempDataId}`,
            values.policyContent
          );
        }
      }

      try {
        setIsLoading(true);
        const response = await postApi("/policy/create", formData);
        console.log("API Response:", response);
        if (response?.data?.success) {
          resetForm({ values: initialValues });
          setShowCanvas(false);
          setOriginalContent("");
          navigate("/policy/waiting", { state: { refresh: true } });
        }
      } catch (error) {
        if (error.response?.data?.errors) {
          const serverErrors = {};
          Object.keys(error.response.data.errors).forEach((key) => {
            serverErrors[key] = error.response.data.errors[key][0];
          });
          setErrors(serverErrors);
        } else {
          console.error("Error creating policy:", error);
        }
      } finally {
        setIsLoading(false);
      }
    },
  });

  useEffect(() => {
    if (!isEmployeesPage) {
      const fetchTemplates = async () => {
        try {
          setIsLoading(true);
          const response = await getApi("/policy/policy-template");
          if (response?.data?.success && response?.data?.data?.template?.data) {
            setTemplates(response.data.data.template.data);
          }
        } catch (error) {
          console.error("Error fetching templates:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchTemplates();
    }
  }, [isEmployeesPage]);

  const handleCloseCanvas = () => {
    setShowCanvas(false);
    formik.resetForm({ values: initialValues });
  };

  const handleShowCanvas = () => {
    setShowCanvas(true);
    formik.resetForm({ values: initialValues });
    setOriginalContent("");
  };

  const handleCloseEditor = () => setShowEditorModal(false);

  const handleTitleChange = (e) => {
    const selectedTitle = e.target.value;
    formik.handleChange(e);
    const selectedTemplate = templates.find(
      (template) => template.title === selectedTitle
    );
    if (selectedTemplate && formik.values.type === "template") {
      formik.setFieldValue("policyContent", selectedTemplate.data);
      formik.setFieldValue("tempDataId", selectedTemplate.id);
      setOriginalContent(selectedTemplate.data);
      setShowEditorModal(true);
    } else {
      formik.setFieldValue("policyContent", "");
      formik.setFieldValue("tempDataId", null);
      setOriginalContent("");
    }
  };

  const editorConfig = {
    readonly: isLoading,
    height: 500,
    toolbar: true,
    spellcheck: true,
    buttons: [
      "bold",
      "italic",
      "underline",
      "|",
      "ul",
      "ol",
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
      "undo",
      "redo",
    ],
    style: {
      border: "1px solid #ced4da",
      borderRadius: "4px",
      backgroundColor: "#fff",
    },
  };

  if (isEmployeesPage || isBulkUploadPage) {
    return null;
  }

  return (
    <>
      <div className="float-right">
        <div className="d-flex justify-content-end flex-wrap mb-3">
          <button
            className="btn mx-1 ms-2 p-1 primary-btn"
            onClick={handleShowCanvas}
            disabled={isLoading}
          >
            <i className="fa-solid fa-plus me-1 ms-1"></i>
            Create Policy
          </button>
        </div>
      </div>

      <Offcanvas
        show={showCanvas}
        onHide={handleCloseCanvas}
        placement="end"
        style={{ width: "400px" }}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Create New Policy</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form onSubmit={formik.handleSubmit}>
            <Form.Group className="mb-3">
              Policy Name <span style={{ color: "red" }}>*</span>
              <Form.Control
                type="text"
                name="name"
                placeholder="Enter policy name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                isInvalid={formik.touched.name && !!formik.errors.name}
                disabled={isLoading}
              />
              <Form.Control.Feedback type="invalid">
                {formik.errors.name}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Policy Type <span style={{ color: "red" }}>*</span>
              </Form.Label>
              <Form.Select
                name="type"
                value={formik.values.type}
                onChange={(e) => {
                  formik.handleChange(e);
                  formik.setFieldValue("title", "");
                  formik.setFieldValue("policyContent", "");
                  formik.setFieldValue("tempDataId", null);
                  setOriginalContent("");
                }}
                onBlur={formik.handleBlur}
                isInvalid={formik.touched.type && !!formik.errors.type}
                disabled={isLoading}
              >
                <option value="" disabled>
                  Select a Policy Type
                </option>
                <option value="template">Create from Template</option>
                <option value="new">New Policy</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {formik.errors.type}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Policy Title
                <span style={{ color: "red" }}>*</span>
              </Form.Label>
              <Form.Select
                name="title"
                value={formik.values.title}
                onChange={handleTitleChange}
                onBlur={formik.handleBlur}
                isInvalid={formik.touched.title && !!formik.errors.title}
                disabled={isLoading || templates.length === 0}
              >
                <option value="">Select a Policy title</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.title}>
                    {template.title}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {formik.errors.title}
              </Form.Control.Feedback>
            </Form.Group>

            {formik.values.type === "new" && (
              <Form.Group className="mb-3">
                <Form.Label>Upload Policy Document</Form.Label>
                <Form.Control
                  type="file"
                  name="policyFile"
                  accept="application/pdf"
                  onChange={(e) =>
                    formik.setFieldValue("policyFile", e.target.files[0])
                  }
                  onBlur={formik.handleBlur}
                  isInvalid={
                    formik.touched.policyFile && !!formik.errors.policyFile
                  }
                  disabled={isLoading}
                />
                <Form.Control.Feedback type="invalid">
                  {formik.errors.policyFile}
                </Form.Control.Feedback>
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Comments</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="comments"
                value={formik.values.comments}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter comments"
                isInvalid={formik.touched.comments && !!formik.errors.comments}
                disabled={isLoading}
              />
              <Form.Control.Feedback type="invalid">
                {formik.errors.comments}
              </Form.Control.Feedback>
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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

            <button
              type="submit"
              className="btn primary-btn mx-1 p-1 mb-2 mt-2 d-flex justify-content-center align-items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <ButtonWithLoader name="" />
                </>
              ) : (
                "Create Policy"
              )}
            </button>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>

      <Modal
        show={showEditorModal}
        onHide={handleCloseEditor}
        size="xl"
        centered
        dialogClassName="modal-90w"
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Policy Content: {formik.values.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <JoditEditor
            value={formik.values.policyContent}
            onBlur={(newContent) =>
              formik.setFieldValue("policyContent", newContent)
            }
            config={editorConfig}
          />
          {formik.touched.policyContent && formik.errors.policyContent && (
            <div className="text-danger small mt-2">
              {formik.errors.policyContent}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEditor}>
            Close
          </Button>
          <button
            className="btn primary-btn"
            onClick={handleCloseEditor}
            disabled={isLoading}
          >
            Save Changes
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Policy;
