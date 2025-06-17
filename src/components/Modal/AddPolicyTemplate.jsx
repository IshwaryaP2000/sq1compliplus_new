import { useRef, useState } from "react";
import JoditEditor from "jodit-react";
import * as Yup from "yup";
import { useFormik } from "formik";
import Offcanvas from "react-bootstrap/Offcanvas";
import { postApi } from "../../services/apiService";
import { PlusIcon } from "../Icons/Icons";

const AddPolicyTemplate = ({ GetPolicy }) => {
  const [description, setDescription] = useState("");
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const editor = useRef(null);
  const initialValues = {
    title: "",
    category: "",
    select: "",
    content: "",
    pdfContent: "",
  };

  const useValidation = Yup.object({
    title: Yup.string().min(3).required("Please Enter Template Title").trim(),
    category: Yup.string()
      .min(3)
      .required("Please Enter Policy Category")
      .trim(),
    select: Yup.string().required("Please Selete Policy Template Type"),
    content: Yup.string().when("select", {
      is: (val) => val === "create",
      then: () => Yup.string().required("Please Provide Template Data"),
      otherwise: () => Yup.string().notRequired(),
    }),
    pdfContent: Yup.mixed().when("select", {
      is: (val) => val === "upload",
      then: () => Yup.mixed().required("Please Provide Template PDF"),
      otherwise: () => Yup.mixed().notRequired(),
    }),
  });

  const {
    values,
    handleSubmit,
    handleBlur,
    handleChange,
    setFieldValue,
    touched,
    errors,
  } = useFormik({
    initialValues,
    validationSchema: useValidation,

    onSubmit: async (values) => {
      if (values.select === "create") {
        const payload = {
          template_title: values.title,
          policy_category: values.category,
          description: description,
          template_type: "create",
          template_data: values.content,
        };
        try {
          setIsLoading(true);
          await postApi(`policy/save-policy-template`, payload);
          GetPolicy();
          setShow(false);
          values.category = "";
          values.title = "";
          values.select = "";
          values.content = "";
          values.pdfContent = "";
          setDescription("");
        } catch (error) {
          console.error("error: ", error);
          values.category = "";
          values.title = "";
          values.select = "";
          values.content = "";
          values.pdfContent = "";
          setDescription("");
        } finally {
          setIsLoading(false);
        }
      } else {
        const payload = {
          template_title: values.title,
          policy_category: values.category,
          description: description,
          template_type: "upload",
          template_file: values.pdfContent,
        };
        try {
          setIsLoading(true);
          await postApi(`policy/save-policy-template`, payload);
          GetPolicy();
          setShow(false);
          values.category = "";
          values.title = "";
          values.select = "";
          values.content = "";
          values.pdfContent = "";
          setDescription("");
        } catch (error) {
          console.error("error: ", error);
          values.category = "";
          values.title = "";
          values.select = "";
          values.content = "";
          values.pdfContent = "";
          setDescription("");
        } finally {
          setIsLoading(false);
        }
      }
    },
  });

  const handleShow = () => setShow(true);
  const handleClose = () => {
    values.category = "";
    touched.category = "";
    errors.category = "";
    values.title = "";
    touched.title = "";
    errors.title = "";
    values.select = "";
    touched.select = "";
    errors.select = "";
    values.content = "";
    touched.content = "";
    errors.content = "";
    values.pdfContent = "";
    touched.pdfContent = "";
    errors.pdfContent = "";
    setDescription("");
    setShow(false);
  };

  const selectFunction = (event) => {
    handleChange(event);
    setFieldValue("content", "");
    setFieldValue("pdfContent", "");
  };

  return (
    <>
      <button className="primary-btn ms-2" type="button" onClick={handleShow}>
       <PlusIcon/>
        Add Policy Template
      </button>
      <Offcanvas
        show={show}
        onHide={handleClose}
        backdrop="static"
        placement="end"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            <h5 className="mb-0">Create Policy Template</h5>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-6">
              <label htmlFor="title" className="form-label">
                Policy Template Title
                <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                id="title"
                value={values.title}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.title && touched.title ? (
                <div className="text-danger">{errors.title}</div>
              ) : null}
            </div>
            <div className="col-md-6">
              <label htmlFor="category" className="form-label">
                Policy Category
                <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                id="category"
                value={values.category}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.category && touched.category ? (
                <div className="text-danger">{errors.category}</div>
              ) : null}
            </div>
            <div className="col-12">
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                className="form-control"
                id="description"
                rows="3"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                onBlur={handleBlur}
              ></textarea>
            </div>
            <div className="col-12">
              <label className="form-label">
                Template Data
                <span className="text-danger">*</span>
              </label>
              <select
                className="form-select"
                aria-label="Default select example"
                id="select"
                value={values.select}
                onChange={(event) => {
                  selectFunction(event);
                }}
                onBlur={handleBlur}
              >
                <option value="" disabled>
                  Select Template Type
                </option>
                <option value="create">Create Policy Template</option>
                <option value="upload">Upload Policy Template</option>
              </select>
            </div>
            {errors.select && touched.select ? (
              <div className="text-danger">{errors.select}</div>
            ) : null}
            {values.select === "upload" && (
              <div className="col-12">
                {errors.pdfContent && touched.pdfContent && (
                  <div className="text-danger">{errors.pdfContent}</div>
                )}
                <input
                  className="form-control"
                  type="file"
                  id="formFile"
                  accept=".pdf"
                  onChange={(event) =>
                    setFieldValue("pdfContent", event.target.files[0])
                  }
                />
              </div>
            )}
            {values.select === "create" && (
              <div className="col-12">
                {errors.content && touched.content && (
                  <div className="text-danger">{errors.content}</div>
                )}
                <JoditEditor
                  ref={editor}
                  onChange={(newContent) =>
                    setFieldValue("content", newContent)
                  }
                  onBlur={handleBlur}
                />
              </div>
            )}
            <div className="d-flex justify-content-end">
              <button type="submit" className="primary-btn me-1">
                {isLoading ? (
                  <div
                    className="spinner-border p-0 text-white spinner-border-sm"
                    role="status"
                  ></div>
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </form>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default AddPolicyTemplate;
