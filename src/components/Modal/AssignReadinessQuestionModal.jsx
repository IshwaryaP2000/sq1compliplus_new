import { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { postApi } from "../../services/apiService";
import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { typeId } from "../Validationschema/commonSchema";
import { TasksIcon } from "../Icons/Icons";

function AssignReadinessQuestionModal({ organization, complianceTypes }) {
  const [show, setShow] = useState(false);
  const [showNoQuestionsModal, setShowNoQuestionsModal] = useState(false);
  const navigate = useNavigate();

  const handleClose = () => setShow(false);
  const handleShow = () => {
    // Check if at least one compliance type has questions
    const hasQuestions = complianceTypes.some(
      (type) => type.questions_count > 0
    );

    if (hasQuestions) {
      setShow(true);
    } else {
      setShowNoQuestionsModal(true);
    }
  };
  const handleCloseNoQuestionsModal = () => setShowNoQuestionsModal(false);

  const handleGoToQuestionPage = () => {
    handleCloseNoQuestionsModal();
    navigate("/settings/add-question");
  };

  const validationSchema = Yup.object({
    type_id: typeId
  });

  // Determine initial compliance IDs based on the "selected" field
  const initialComplianceIds =
    complianceTypes
      ?.filter((complianceType) => complianceType.selected === "yes")
      .map((complianceType) => complianceType.id) || [];

  return (
    <>
      <OverlayTrigger
        overlay={
          <Tooltip id="tooltip-disabled">Assign Readiness Questions</Tooltip>
        }
      >
        <button
          className="btn btn-sm py-0 my-1 tableborder-right"
          onClick={handleShow}
        >
         <TasksIcon/>
        </button>
      </OverlayTrigger>

      {/* Main modal for assigning questions */}
      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Assign Readiness</Modal.Title>
        </Modal.Header>
        <Formik
          enableReinitialize={true}
          initialValues={{ type_id: initialComplianceIds }}
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              const payload = {
                type_id: values.type_id,
                organization_id: organization?.id,
              };
              await postApi("assign-questions", payload);
              handleClose();
            } catch (err) {
              console.error("Error in handleAssign:", err);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting, setFieldValue, values }) => (
            <Form>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Select Compliance Type</label>
                  {complianceTypes.map((complianceType) => (
                    <div className="form-check" key={complianceType.id}>
                      <input
                        onChange={() => {
                          if (complianceType.questions_count > 0) {
                            const updatedTypeIds = values.type_id.includes(
                              complianceType.id
                            )
                              ? values.type_id.filter(
                                (item) => item !== complianceType.id
                              )
                              : [...values.type_id, complianceType.id];
                            setFieldValue("type_id", updatedTypeIds);
                          }
                        }}
                        className="form-check-input"
                        type="checkbox"
                        value={complianceType.id}
                        id={`compliance-${complianceType.id}`}
                        checked={values.type_id.includes(complianceType.id)}
                        disabled={complianceType.questions_count === 0}
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`compliance-${complianceType.id}`}
                      >
                        {complianceType.name}{" "}
                        <span style={{ fontSize: "0.8em" }}>
                          ({complianceType.questions_count})
                        </span>
                      </label>
                    </div>
                  ))}
                  <ErrorMessage
                    name="type_id"
                    component="div"
                    className="text-danger"
                  />
                </div>
              </div>

              <div className="modal-footer border-0">
                <button
                  type="submit"
                  className="btn primary-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Assigning..." : "Assign"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </Modal>

      {/* Modal for when no questions are found */}
      <Modal
        show={showNoQuestionsModal}
        onHide={handleCloseNoQuestionsModal}
        centered
      >
        <Modal.Body className="p-4">
          <div className="text-center">
            <div className="mb-3">
              <div className="warning1-icon-wrapper">
                <i className="fa-solid text-warning fa-triangle-exclamation"></i>
              </div>
            </div>
            <h5 className="fw-bold mb-2 text-muted">No Questions Found</h5>
            <p className="mb-2">
              You haven't <b>uploaded any questions</b>. Please upload
              questions.
            </p>
          </div>
        </Modal.Body>
        <div className="d-flex justify-content-center mb-3 gap-4">
          <Button
            onClick={handleCloseNoQuestionsModal}
            className="bg-transparent border-1 text-dark px-4"
            style={{ borderColor: "#cccc" }}
          >
            No, Keep it
          </Button>
          <Button
            variant="warning"
            onClick={handleGoToQuestionPage}
            className="px-4"
          >
            Go to Question Page <i className="fa-solid fa-arrow-right ms-1"></i>
          </Button>
        </div>
      </Modal>
    </>
  );
}

export default AssignReadinessQuestionModal;
