import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Accordion, Button, Modal } from "react-bootstrap";
import { getApi } from "../../../../services/apiService";
import usePageTitle from "../../../../utils/usePageTitle";

const ReadinessViewAnswers = () => {
  usePageTitle("Readiness Answers");
  const [answers, setAnswers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [evidenceImage, setEvidenceImage] = useState("");
  const { id } = useParams();

  const fetchAnswers = async () => {
    try {
      const response = await getApi(`/get-answers?organization_id=${id}`);
      setAnswers(response.data.data);
    } catch (error) {
      console.error("Error fetching answers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnswers();
  }, []);

  const handleViewEvidence = (evidenceUrl) => {
    // Fix the URL by replacing escaped slashes
    const formattedUrl = evidenceUrl;
    setEvidenceImage(formattedUrl);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEvidenceImage("");
  };

  return (
    <div className="container mt-4">
      <h2>Readiness Answers</h2>
      {loading ? (
        <p>Loading answers...</p>
      ) : (
        <Accordion>
          {Object.keys(answers).map((key, index) => (
            <Accordion.Item eventKey={index.toString()} key={key}>
              <Accordion.Header>{answers[key].question}</Accordion.Header>
              <Accordion.Body>
                <p className="px-4 py-3 mb-0">
                  <strong>Answer:</strong> {answers[key].answer}
                </p>
                {answers[key].sub_questions && (
                  <Accordion>
                    {answers[key].sub_questions.map((sub, subIndex) => (
                      <Accordion.Item
                        eventKey={`${index}-${subIndex}`}
                        key={subIndex}
                      >
                        <Accordion.Header>{sub.question}</Accordion.Header>
                        <Accordion.Body>
                          <p className="px-4 py-3 mb-0">
                            <strong>Answer:</strong> {sub.answer}
                          </p>
                          {sub.evidence && (
                            <Button
                              variant="primary"
                              onClick={() => handleViewEvidence(sub.evidence)}
                              className="mt-2"
                            >
                              View Evidence
                            </Button>
                          )}
                        </Accordion.Body>
                      </Accordion.Item>
                    ))}
                  </Accordion>
                )}
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      )}

      {/* Modal to display the evidence image */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Evidence</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {evidenceImage ? (
            <img
              src={evidenceImage}
              alt="Evidence"
              style={{ width: "100%", height: "auto" }}
            />
          ) : (
            <p>No evidence image available.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ReadinessViewAnswers;
