import { useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Button, Modal } from "react-bootstrap";
import usePageTitle from "../../../../utils/usePageTitle";
import { getApi, postApi } from "../../../../services/apiService";

const ValidateUpload = () => {
  usePageTitle("Validate Upload Questions");
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [isloading, setIsLoading] = useState(false);
  const [assessmentTypes, setAssessmentTypes] = useState([]);
  const [selectedValues, setSelectedValues] = useState({});
  const [isWeightage, setIsWeightage] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const questionWeightage = process.env.REACT_APP_QUESTION_WEIGHTAGE || 10;
  const [buttonShow, setButtonShow] = useState(0);

  useEffect(() => {
    const hasInvalidQuestions = questions.some(
      (q) =>
        !q.question ||
        !q.data_access ||
        !selectedValues[q.id] ||
        Number(q.weightage_of_yes) + Number(q.weightage_of_no) !=
          questionWeightage
    );
    setButtonShow(hasInvalidQuestions);
  }, [questions, questionWeightage, selectedValues]);

  const handleCloseDelete = () => {
    setShowDelete(false);
  };

  const dataAccessOptions = [
    { value: "High", label: "High" },
    { value: "Medium", label: "Medium" },
    { value: "Low", label: "Low" },
    { value: "SOC", label: "SOC" },
  ];

  const isAttachmentOptions = [
    { value: "Yes", label: "Yes" },
    { value: "No", label: "No" },
    { value: "Not Applicable", label: "Not Applicable" },
    { value: "Not Required", label: "Not Required" },
  ];

  // Create weightage options from 0 to 10
  const weightageOptions = Array.from({ length: 11 }, (_, index) => ({
    value: index,
    label: index,
  }));

  const GetQuestions = async () => {
    try {
      setIsLoading(true);
      const response = await getApi("/vendor/get-validate-upload-questions");
      const questions = response?.data?.data?.questions;
      const updatedQuestions = questions.map((question) => ({
        ...question,
        assessment_type: question.assessment_type, // Keep as is for now
      }));
      setQuestions(updatedQuestions);
      const hasHighWeightage = updatedQuestions.some((question) => {
        return (
          question.weightage_of_yes + question.weightage_of_no !=
          questionWeightage
        );
      });
      setIsWeightage(hasHighWeightage);
      if (hasHighWeightage) {
        setShowDelete(true);
      }
      // Initialize selectedValues based on fetched questions
      const initialSelectedValues = updatedQuestions.reduce((acc, question) => {
        const selectedOption = assessmentTypes.find(
          (type) => type.label === question.assessment_type
        );
        acc[question.id] = selectedOption ? selectedOption.value : "";
        return acc;
      }, {});

      setSelectedValues(initialSelectedValues);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getQues = async () => {
    try {
      const response = await getApi("/vendor/get-assessment-types");
      if (Array.isArray(response?.data?.data)) {
        const types = response.data.data.map((item) => ({
          value: item.id, // Use `id` as value
          label: item.assessment_type, // Use `assessment_type` as label
        }));
        setAssessmentTypes(types);
      } else {
        console.error("Unexpected data format:", response?.data);
        toast.error("Error: Assessment types data is missing or invalid.");
      }
    } catch (error) {
      toast.error("Error fetching assessment types.");
    }
  };

  useEffect(() => {
    getQues();
  }, []);

  useEffect(() => {
    if (assessmentTypes.length > 0) {
      GetQuestions();
    }
  }, [assessmentTypes]);

  const handleWeightageChange = (event, index, type) => {
    const hasHighWeightage = questions.some((question) => {
      return (
        question.weightage_of_yes > questionWeightage ||
        question.weightage_of_no > questionWeightage
      );
    });

    const newValue = parseInt(event.target.value);
    setQuestions((prevQuestions) => {
      const updatedQuestions = [...prevQuestions];
      const currentQuestion = { ...updatedQuestions[index] };
      setIsWeightage(hasHighWeightage);
      if (type === "yes") {
        currentQuestion.weightage_of_yes = newValue;
        currentQuestion.weightage_of_no = questionWeightage - newValue;
      } else {
        currentQuestion.weightage_of_no = newValue;
        currentQuestion.weightage_of_yes = questionWeightage - newValue;
      }

      updatedQuestions[index] = currentQuestion;
      return updatedQuestions;
    });
  };

  const handleQuestionChange = (e, index) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].question = e.target.value;
    setQuestions(updatedQuestions);
  };

  const handleIsAttachmentChange = (selectedOption, index) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].is_attachment = selectedOption.value;
    setQuestions(updatedQuestions);
  };

  const handleDataAccessChange = (selectedOption, index) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].data_access = selectedOption.value;
    setQuestions(updatedQuestions);
  };

  const handleDelete = async (id) => {
    const payload = { id: id };
    try {
      await postApi("/vendor/remove-upload-valid-questions", payload);
      GetQuestions();
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  };

  const handleSelectChange = (e, questionId) => {
    const selectedAssessmentId = e.target.value;
    setSelectedValues((prev) => ({
      ...prev,
      [questionId]: selectedAssessmentId,
    }));

    // Also update the corresponding question object
    const updatedQuestions = [...questions];
    const questionIndex = updatedQuestions.findIndex(
      (q) => q.id === questionId
    );
    if (questionIndex !== -1) {
      updatedQuestions[questionIndex].assessment_type = selectedAssessmentId;
      setQuestions(updatedQuestions);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const formattedQuestions = questions.reduce((acc, question) => {
        const assessmentId = selectedValues[question.id] || ""; // Use selected value from dropdown

        acc[question.id] = {
          assessment_type: assessmentId, // Use the selected ID
          question: question.question,
          weightage_of_yes: question.weightage_of_yes,
          weightage_of_no: question.weightage_of_no,
          is_attachment: question.is_attachment,
          data_access: question.data_access,
        };
        return acc;
      }, {});

      const payload = { data: formattedQuestions };
      await postApi("/vendor/save-upload-valid-questions", payload);
      navigate("/settings/question");
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between mb-3 flex-wrap">
        <h5 className="mb-0 d-flex align-items-end">
          Validate Upload Questions
          <span className="badge bg-lightgreen-07 ms-2">
            {questions.length}
          </span>
        </h5>
        <Link to="/settings/upload-question">
          <button className="btn mx-1 primary-btn">
            <i className="fa-solid fa-arrow-left me-1"></i> Back
          </button>
        </Link>
      </div>
      <div className="card">
        <div className="card-body">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Assessment Type</th>
                <th>Question</th>
                <th>Weightage Of Yes</th>
                <th>Weightage Of No</th>
                <th>Data Access</th>
                <th>Is Attachment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isloading ? (
                Array.from({ length: 3 }).map((_, rowIndex) => (
                  <tr key={rowIndex}>
                    {Array.from({ length: 7 }).map((_, colIndex) => (
                      <td key={colIndex}>
                        <p className="placeholder-glow">
                          <span className="placeholder col-12 bg-secondary"></span>
                        </p>
                      </td>
                    ))}
                  </tr>
                ))
              ) : questions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center border-bottom-0 ">
                    No Questions Found, please upload valid questions.
                  </td>
                </tr>
              ) : (
                <>
                  {questions.map((question, index) => (
                    <tr key={question.id}>
                      <td>{index}</td>
                      <td>
                        <select
                          id={`assessmentSelect${question.id}`}
                          value={selectedValues[question.id] || ""}
                          onChange={(e) => handleSelectChange(e, question.id)}
                          classNamePrefix="react-select"
                          className={`form-control ${
                            !selectedValues[question.id] ? "is-invalid" : ""
                          }`}
                        >
                          <option value="" disabled>
                            Select Assessment Type
                          </option>
                          {assessmentTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="text"
                          value={question.question}
                          onChange={(e) => handleQuestionChange(e, index)}
                          className={`form-control ${
                            question.question == null ? "is-invalid" : ""
                          }`}
                        />
                      </td>
                      <td>
                        <Select
                          classNamePrefix="react-select"
                          className={
                            parseInt(question.weightage_of_yes) +
                              parseInt(question.weightage_of_no) !==
                            parseInt(questionWeightage)
                              ? "is-invalid"
                              : ""
                          }
                          options={weightageOptions}
                          value={weightageOptions.find(
                            (option) =>
                              option.value == question.weightage_of_yes
                          )}
                          onChange={(selectedOption) =>
                            handleWeightageChange(
                              { target: { value: selectedOption.value } },
                              index,
                              "yes"
                            )
                          }
                          isSearchable={false}
                        />
                      </td>
                      <td>
                        <Select
                          classNamePrefix="react-select"
                          className={
                            parseInt(question.weightage_of_yes) +
                              parseInt(question.weightage_of_no) !==
                            parseInt(questionWeightage)
                              ? "is-invalid"
                              : ""
                          }
                          options={weightageOptions}
                          value={weightageOptions.find(
                            (option) => option.value == question.weightage_of_no
                          )}
                          onChange={(selectedOption) =>
                            handleWeightageChange(
                              { target: { value: selectedOption.value } },
                              index,
                              "no"
                            )
                          }
                          isSearchable={false}
                        />
                      </td>
                      <td>
                        <Select
                          options={dataAccessOptions}
                          value={dataAccessOptions.find(
                            (option) => option.value === question.data_access
                          )}
                          onChange={(selectedOption) =>
                            handleDataAccessChange(selectedOption, index)
                          }
                          classNamePrefix="react-select"
                          className={
                            !question.data_access ||
                            !dataAccessOptions.some(
                              (option) => option.value === question.data_access
                            )
                              ? "is-invalid"
                              : ""
                          }
                          isSearchable={false}
                        />
                      </td>
                      <td>
                        <Select
                          options={isAttachmentOptions}
                          value={isAttachmentOptions.find(
                            (option) => option.value === question.is_attachment
                          )}
                          onChange={(selectedOption) =>
                            handleIsAttachmentChange(selectedOption, index)
                          }
                          classNamePrefix="react-select"
                          className={
                            !question.is_attachment ||
                            !isAttachmentOptions.some(
                              (option) =>
                                option.value === question.is_attachment
                            )
                              ? "is-invalid"
                              : ""
                          }
                          isSearchable={false}
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(question.id)}
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}

                  <tr>
                    <td colSpan="7" className="text-center">
                      <div className="mb-5">
                        <button
                          disabled={buttonShow}
                          className="btn primary-btn mt-3"
                          onClick={handleSubmit}
                        >
                          Save Changes
                        </button>
                      </div>
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Modal show={showDelete} onHide={handleCloseDelete} centered size="lg">
        <Modal.Body className="p-4">
          <div className="text-center">
            <div>
              <img
                src="/images/information/format-yes-no.avif"
                alt="Error Format"
                className="img-fluid"
              />
            </div>
            <p className="my-2">
              <small>
                The total of <b>Weightage Of Yes</b> and <b>Weightage Of No</b>{" "}
                must be <b>10</b>.
              </small>
            </p>
          </div>
        </Modal.Body>
        <div className="d-flex justify-content-center mb-3 gap-4">
          <Button
            onClick={handleCloseDelete}
            className="bg-light border-1 text-dark px-4"
            style={{ borderColor: "#cccc" }}
          >
            Cancel
          </Button>
          <Button
            variant="warning"
            onClick={handleCloseDelete}
            className="px-4"
          >
            OK, got it!
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ValidateUpload;
