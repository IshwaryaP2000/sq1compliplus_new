import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useFormik } from "formik";
import { Spinner, Modal, Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { getApi, postApi } from "../../services/apiService";

const ViewPolicy = () => {
  const { id: policyId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const navigate = useNavigate();
  const queriesToShow = showMore ? data?.queries : data?.queries?.slice(0, 5);

  const fetchPolicy = async (URI = `employee/policy/${policyId}`) => {
    try {
      setIsLoading(true);
      const response = await getApi(URI);
      setData(response?.data?.data || []);
    } catch (error) {
      console.error("Error fetching policy:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async () => {
    try {
      setIsLoading(true);
      await getApi(`employee/accept/${policyId}`);
      navigate("/employee/accepted-policy");
    } catch (err) {
      console.error("error", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [policyId]);

  function returnEmployeePolicy() {
    navigate(`/employee/all-policy`);
  }

  const formik = useFormik({
    initialValues: {
      comments: "",
    },
    onSubmit: async (values) => {
      setIsLoading(true);
      if (!values.comments) {
        formik.setFieldError("comments", "Please enter comments");
        setIsLoading(false);
        return;
      }
      try {
        const payload = { comments: values.comments };
        await postApi(`employee/query/${policyId}`, payload);
        fetchPolicy();
        formik.resetForm();
      } catch (error) {
        console.error("API Error:", error);
        setIsLoading(false);
      } finally {
        setShowModal(false);
        setIsLoading(false);
      }
    },
  });

  return (
    <>
      <div className="custom-title-edit">
        <div className="d-flex justify-content-between">
          <h5>Policy - {data?.name || ""}</h5>
        </div>
        <button className="primary-btn" onClick={returnEmployeePolicy}>
          <i className="fa-solid fa-arrow-left me-1"></i>
          Back
        </button>
      </div>
      <div className="container mt-4">
        <Card className="shadow-lg p-4">
          {isLoading ? (
            <div
              className="d-flex justify-content-center align-items-center "
              style={{ height: "700px" }}
            >
              <Spinner animation="border" variant="success" />
            </div>
          ) : data?.data ? (
            <>
              <iframe
                title="myFrame"
                src={data?.data}
                width="100%"
                height="630px"
                className="rounded border shadow-sm"
              ></iframe>
              <div className="d-flex justify-content-center mt-3">
                <>
                  <button
                    type="button"
                    className="btn btn-sm primary-btn ms-3"
                    onClick={() => setShowModal(true)}
                  >
                    {data?.is_accepted ? "Raised Query" : "Raise Query"}
                  </button>
                  {!data?.is_accepted ? (
                    <button
                      type="button"
                      className="btn btn-sm primary-btn ms-3"
                      onClick={handleAccept}
                    >
                      Accept
                    </button>
                  ) : null}
                </>
              </div>
            </>
          ) : (
            <div className="text-center form-card p-3 bg-light text-muted">
              No data Available Here.
            </div>
          )}
        </Card>
        {/* Query Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title className="h5">Raise Query</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={formik.handleSubmit}>
              <div>
                <label htmlFor="queries" className="mb-2">
                  Raised Queries
                </label>
                <div>
                  {isLoading ? (
                    <div className="d-flex justify-content-center align-items-center">
                      <Spinner animation="border" variant="success" />
                    </div>
                  ) : data?.queries?.length > 0 ? (
                    <div className="row">
                      {queriesToShow?.map((queries, index) => (
                        <div key={queries?.id || index} className="m-3">
                          <div className="card-body">
                            <div className="row">
                              <div className="col-md-5">
                                <h6 className="mb-2">
                                  {index + 1}. {queries}
                                </h6>
                              </div>
                              <div className="col-md-3">
                                <h6 className="mb-2">
                                  {data?.query_date[index]}.
                                </h6>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {data?.queries?.length > 5 && (
                        <button
                          className="btn btn-link p-0 mt-1 text-decoration-none"
                          onClick={() => setShowMore(!showMore)}
                          type="button"
                        >
                          {showMore ? "Show Less" : "Show More"}
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="card">
                      <div className="card-body text-center">
                        <p>No Data Available...</p>
                      </div>
                    </div>
                  )}
                </div>
                <hr></hr>
              </div>
              {!data?.is_accepted ? (
                <>
                  <div className="form-group">
                    <label htmlFor="comments" className="mt-2">
                      Comments
                    </label>
                    <textarea
                      className="form-control my-4"
                      id="comments"
                      name="comments"
                      value={formik.values.comments}
                      onChange={formik.handleChange}
                      placeholder="Write your comments here..."
                    ></textarea>
                    {formik.errors.comments && formik.touched.comments && (
                      <div className="text-danger">
                        {formik.errors.comments}
                      </div>
                    )}
                  </div>
                  <Modal.Footer>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setShowModal(false);
                        formik.resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                    <button
                      type="submit"
                      className="btn btn-sm primary-btn ms-3"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="spinner-border spinner-border-sm"></span>
                      ) : (
                        "Submit"
                      )}
                    </button>
                  </Modal.Footer>
                </>
              ) : null}
            </form>
          </Modal.Body>
        </Modal>
      </div>
    </>
  );
};

export default ViewPolicy;
