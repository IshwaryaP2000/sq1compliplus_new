import { useState } from "react";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { postApi } from "../../services/apiService";

const validationSchema = Yup.object({
  question: Yup.string().required("Question is required"),
  description: Yup.string().nullable(),
  yes_score: Yup.number()
    .typeError("Yes Score must be a number")
    .positive("Yes Score must be a positive number")
    .integer("Yes Score must be an integer")
    .nullable(),
  no_score: Yup.number()
    .typeError("No Score must be a number")
    .positive("No Score must be a positive number")
    .integer("No Score must be an integer")
    .nullable(),
});

function EditQuestions({ data, category, question, GetQuestions }) {
  const [show, setShow] = useState(false);
  const [selectedType, setSelectedType] = useState(question?.type || "");
  const [selectedCategory, setSelectedCategory] = useState(
    question?.category || ""
  );
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [isCategoryTyping, setIsCategoryTyping] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleCustomCategoryChange = (event) => {
    const value = event.target.value;
    setSelectedCategory(value);
    if (value) {
      setIsCategoryTyping(true);
      const filtered = category?.filter((cat) =>
        cat.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      setIsCategoryTyping(false);
      setFilteredCategories([]);
    }
  };

  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName);
    setIsCategoryTyping(false);
    setFilteredCategories([]);
  };

  const handleSubmit = async (values) => {
    try {
      const { question, description, yes_score, no_score, question_id } =
        values;

      if (!question) {
        toast.error("Question is required");
        return;
      }

      const payload = {
        category: selectedCategory,
        question: question,
        question_id: question_id,
        type_id: selectedType,
        description: description || "",
        yes_score: yes_score || 0,
        no_score: no_score || 0,
      };

      await postApi("/edit-question", payload);
      handleClose();
      GetQuestions();
    } catch (error) {
      console.error(error);
      toast.error(error);
    }
  };

  return (
    <>
      <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">Edit</Tooltip>}>
        <button
          className="btn btn-sm py-0 my-1 tableborder-right"
          onClick={handleShow}
        >
          <i className="fa-regular fa-pen-to-square"></i>
        </button>
      </OverlayTrigger>

      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Question</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik
            initialValues={{
              category: question?.category || "",
              question: question?.question || "",
              description: question?.description || "",
              yes_score: question?.yes_score || "",
              no_score: question?.no_score || "",
              question_id: question?.id,
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ setFieldValue, values, touched, errors }) => (
              <Form>
                <div className="form-group">
                  <label htmlFor="complianceType" className="mb-2">
                    Compliance Type
                  </label>
                  <select
                    id="complianceType"
                    className="form-control"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                  >
                    {/* <option value="">Select a type</option> */}
                    {data?.data?.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="complianceCategory" className="mb-2">
                    Compliance Category
                  </label>
                  <input
                    type="text"
                    id="complianceCategory"
                    className="form-control"
                    value={selectedCategory}
                    onChange={handleCustomCategoryChange}
                    placeholder="Enter category"
                  />
                  {isCategoryTyping && filteredCategories.length > 0 && (
                    <ul className="dropdown-menu show position-absolute w-100 mt-2">
                      {filteredCategories.map((cat) => (
                        <li
                          key={cat.id}
                          className="dropdown-item"
                          onClick={() => handleCategorySelect(cat.name)}
                        >
                          {cat.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="question" className="mb-2">
                    Question
                  </label>
                  <Field
                    id="question"
                    name="question"
                    type="text"
                    className={`form-control ${
                      errors.question && touched.question ? "is-invalid" : ""
                    }`}
                  />
                  <ErrorMessage
                    name="question"
                    component="div"
                    className="invalid-feedback"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description" className="mb-2">
                    Description
                  </label>
                  <Field
                    id="description"
                    name="description"
                    type="text"
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="yes_score" className="mb-2">
                    Yes Score
                  </label>
                  <Field
                    id="yes_score"
                    name="yes_score"
                    type="number"
                    className={`form-control ${
                      errors.yes_score && touched.yes_score ? "is-invalid" : ""
                    }`}
                  />
                  <ErrorMessage
                    name="yes_score"
                    component="div"
                    className="invalid-feedback"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="no_score" className="mb-2">
                    No Score
                  </label>
                  <Field
                    id="no_score"
                    name="no_score"
                    type="number"
                    className={`form-control ${
                      errors.no_score && touched.no_score ? "is-invalid" : ""
                    }`}
                  />
                  <ErrorMessage
                    name="no_score"
                    component="div"
                    className="invalid-feedback"
                  />
                </div>

                <div className="text-center mb-3">
                  <Button
                    type="submit"
                    variant="primary"
                    className="btn btn-sm primary-btn"
                  >
                    Update
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default EditQuestions;
