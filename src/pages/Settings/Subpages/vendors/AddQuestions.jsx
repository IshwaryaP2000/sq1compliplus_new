import { useEffect, useState } from "react";
import Select from "react-select";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import usePageTitle from "../../../../utils/usePageTitle";
import { getApi, postApi } from "../../../../services/apiService";
import { LeftarrowIcon } from "../../../../components/Icons/Icons";

const AddQuestions = () => {
  usePageTitle("Add Questions");
  const navigate = useNavigate();
  const [data, setData] = useState([]);

  // Options for dropdowns
  const options02 = [
    { value: 0, label: "Score-0" },
    { value: 1, label: "Score-1" },
    { value: 2, label: "Score-2" },
    { value: 3, label: "Score-3" },
    { value: 4, label: "Score-4" },
    { value: 5, label: "Score-5" },
    { value: 6, label: "Score-6" },
    { value: 7, label: "Score-7" },
    { value: 8, label: "Score-8" },
    { value: 9, label: "Score-9" },
    { value: 10, label: "Score-10" },
  ];

  const DataAccessOptions = [
    { value: "high", label: "High" },
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "soc", label: "SOC" },
  ];

  const Confirmation = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
    { value: "Not Applicable", label: "Not Applicable" },
    { value: "Not Required", label: "Not Required" },
  ];

  const GetAssessmentType = async () => {
    try {
      const response = await getApi("/vendor/get-assessment-types");
      setData(response?.data?.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    GetAssessmentType();
  }, []);

  // Form validation schema using Yup
  const validationSchema = Yup.object({
    question: Yup.string().required("Question is required"),
    weightageOfYes: Yup.string().required("Risk Score For Yes is required"),
    weightageOfNo: Yup.string().required("Risk Score For No is required"),
    isAttachment: Yup.string().required("Is Attachment Required? is required"),
    dataAccess: Yup.string().required("Data Access is required"),
  });

  const formik = useFormik({
    initialValues: {
      selectedType: "",
      question: "",
      weightageOfYes: "",
      weightageOfNo: "",
      isAttachment: "",
      dataAccess: "",
      newAssessmentType: "",
    },
    validationSchema,
    onSubmit: async (values, { setErrors }) => {
      const payload = {
        assessment_type:
          values.selectedType === "newassesstype" ? "0" : values.selectedType,
        new_assessment_type:
          values.selectedType === "newassesstype"
            ? values.newAssessmentType
            : "",
        question: values.question,
        weightage_of_yes: values.weightageOfYes,
        weightage_of_no: values.weightageOfNo,
        is_attachment: values.isAttachment,
        data_access: values.dataAccess,
      };

      try {
        await postApi("/vendor/store-question", payload);
        navigate("/settings/question");
      } catch (error) {
        if (error.response && error.response.status === 422) {
          // Laravel validation errors
          const validationErrors = error.response.data.errors;
          setErrors(validationErrors); // Bind Laravel errors to Formik
        } else {
          console.error("An unexpected error occurred:", error);
        }
      }
    },
  });

  return (
    <div>
      <div className="d-flex justify-content-between mb-3 flex-wrap">
        <h5>Add Question</h5>
        <div className="d-flex">
          <Link to="/settings/question">
            <button className="btn mx-1 primary-btn">
              <LeftarrowIcon className="me-1" /> Back
            </button>
          </Link>
        </div>
      </div>
      <div className="scrolling--card">
        <div className="card ">
          <div className="card-body h-100">
            <form onSubmit={formik.handleSubmit}>
              <div className="col-md-12 mb-3">
                <label className="mb-2">
                  Assessment Type<span className="text-danger">*</span>
                </label>
                <select
                  id="complianceType"
                  className="form-control"
                  value={formik.values.selectedType}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  name="selectedType"
                >
                  <option value="">Select a type</option>
                  {data?.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.assessment_type}
                    </option>
                  ))}
                  <option value="newassesstype">New Assessment Type</option>
                </select>
                {formik.touched.selectedType && formik.errors.selectedType ? (
                  <div className="text-danger">
                    {formik.errors.selectedType}
                  </div>
                ) : null}
              </div>

              {/* Show the input field if "New Assessment Type" is selected */}
              {formik.values.selectedType === "newassesstype" && (
                <div className="col-md-12 mb-3">
                  <label className="mb-2">
                    New Assessment Type <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="newAssessmentType"
                    value={formik.values.newAssessmentType}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter new assessment type"
                  />
                  {formik.touched.newAssessmentType &&
                  formik.errors.newAssessmentType ? (
                    <div className="text-danger">
                      {formik.errors.newAssessmentType}
                    </div>
                  ) : null}
                </div>
              )}

              <div className="col-md-12 mb-3">
                <label className="mb-2">
                  Question<span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="question"
                  value={formik.values.question}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter the question"
                />
                {formik.touched.question && formik.errors.question ? (
                  <div className="text-danger">{formik.errors.question}</div>
                ) : null}
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="mb-2">
                    Risk Score For Yes<span className="text-danger">*</span>
                  </label>
                  <Select
                    options={options02}
                    name="weightageOfYes"
                    menuPlacement="auto"
                    value={options02.find(
                      (option) => option.value === formik.values.weightageOfYes
                    )}
                    onChange={(option) => {
                      formik.setFieldValue("weightageOfYes", option.value);
                      formik.setFieldValue("weightageOfNo", 10 - option.value);
                    }}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.weightageOfYes &&
                  formik.errors.weightageOfYes ? (
                    <div className="text-danger">
                      {formik.errors.weightageOfYes}
                    </div>
                  ) : null}
                </div>
                <div className="col-md-6 mb-3">
                  <label className="mb-2">
                    Risk Score For No<span className="text-danger">*</span>
                  </label>
                  <Select
                    options={options02}
                    name="weightageOfNo"
                    menuPlacement="auto"
                    value={options02.find(
                      (option) => option.value === formik.values.weightageOfNo
                    )}
                    onChange={(option) => {
                      formik.setFieldValue("weightageOfNo", option.value);
                      formik.setFieldValue("weightageOfYes", 10 - option.value);
                    }}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.weightageOfNo &&
                  formik.errors.weightageOfNo ? (
                    <div className="text-danger">
                      {formik.errors.weightageOfNo}
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="col-md-12 mb-3">
                <label className="mb-2">
                  Is Attachment Required?<span className="text-danger">*</span>
                </label>
                <Select
                  options={Confirmation}
                  name="isAttachment"
                  menuPlacement="auto"
                  value={Confirmation.find(
                    (option) => option.value === formik.values.isAttachment
                  )}
                  onChange={(option) =>
                    formik.setFieldValue("isAttachment", option.value)
                  }
                  onBlur={formik.handleBlur}
                />
                {formik.touched.isAttachment && formik.errors.isAttachment ? (
                  <div className="text-danger">
                    {formik.errors.isAttachment}
                  </div>
                ) : null}
              </div>

              <div className="col-md-12 mb-3">
                <label className="mb-2">
                  Data Access<span className="text-danger">*</span>
                </label>
                <Select
                  options={DataAccessOptions}
                  name="dataAccess"
                  menuPlacement="auto"
                  value={DataAccessOptions.find(
                    (option) => option.value === formik.values.dataAccess
                  )}
                  onChange={(option) =>
                    formik.setFieldValue("dataAccess", option.value)
                  }
                  onBlur={formik.handleBlur}
                />
                {formik.touched.dataAccess && formik.errors.dataAccess ? (
                  <div className="text-danger">{formik.errors.dataAccess}</div>
                ) : null}
              </div>

              <div className="d-flex justify-content-center">
                <button type="submit" className="btn primary-btn mt-3">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddQuestions;
