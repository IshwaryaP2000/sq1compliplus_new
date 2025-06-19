import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import moment from "moment";
import Accordion from "react-bootstrap/Accordion";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import Select from "react-select";
import countryList from "react-select-country-list";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getApi, postApi } from "../../../../services/apiService";
import { ucFirst } from "../../../../utils/UtilsGlobalData";
import {
  CheckIcon,
  LeftarrowIcon,
  ListIcon,
  RightarrowIcon,
} from "../../../../components/Icons/Icons";

const VendorCreate = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingbtn, setIsLoadingbtn] = useState(false);
  const [serviceCategories, setCategory] = useState([]);
  const [serviceLocations, setLocation] = useState([]);
  const [serviceNames, setName] = useState([]);
  const [serviceTypes, setType] = useState([]);
  const options = useMemo(() => countryList().getData(), []);
  const service_dataAccess = ["High", "Low", "Medium"];
  const [data, setData] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const steps = ["Basic Info", "Services", "Contract"];

  const GetService = async () => {
    try {
      setIsLoading(true);
      const response = await getApi("/vendor/get-vendor-service");
      if (response && response.data && response.data.data) {
        setCategory(response.data.data.service_categories || []);
        setLocation(response.data.data.service_locations || []);
        setName(response.data.data.service_names || []);
        setType(response.data.data.service_types || []);
        setData(response?.data?.data?.pre_approved_vendors || "");
      } else {
        console.warn("Invalid API response:", response);
      }
    } catch (error) {
      console.error("Error fetching service data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    GetService();
  }, []);

  const validationSchema = Yup.object().shape({
    businessName: Yup.string().required("Business name is required"),
    contactName: Yup.string().required("Contact name is required"),
    contactEmail: Yup.string()
      .email("Invalid email")
      .required("Email is required"),
    contactPhone: Yup.string().required("Contact phone is required"),
    address: Yup.string().required("Address is required"),
    city: Yup.string().required("City is required"),
    country: Yup.object().required("Country is required"),
    vendorStartDate: Yup.date()
      .required("Contract expiry date is required")
      .test(
        "is-future-date",
        "Date must be at least two days from today",
        function (value) {
          if (!value) {
            return false; // Already handled by .required()
          }
          const twoDaysFromNow = moment().add(2, "days").startOf("day");
          const inputDate = moment(value).startOf("day");
          return inputDate.isSameOrAfter(twoDaysFromNow);
        }
      ),
    selectedServices: Yup.array().min(
      1,
      "At least one service must be selected"
    ),
    selectedType: Yup.string().required("Type is required"),
    selectedCategory: Yup.object().required("Category is required"),
    selectedLocation: Yup.object().required("Location is required"),
    selectedCompliantType: Yup.string().required("SOC Compliant is required"),
  });

  const handleSubmit = async (values) => {
    const payload = {
      business_name: values.businessName,
      name: values.contactName,
      email: values.contactEmail,
      contact_phone: values.contactPhone,
      address: values.address,
      city: values.city,
      country: values.country.value,
      vendor_start_date: values.vendorStartDate,
      service_name: values.selectedServices.map((service) => service.value),
      service_type: values.selectedType,
      service_category: values.selectedCategory.label,
      service_location: values.selectedLocation.label.toLowerCase(),
      soc_compliant: values.selectedCompliantType,
      data_access:
        values.selectedCompliantType === "yes"
          ? null
          : values.data_access?.value,
      type: "vendor",
    };
    try {
      setIsLoading(true);
      await postApi("/vendor/store", payload);
      navigate("/vendors");
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const PreVendorAdd = async (id) => {
    try {
      setIsLoadingbtn(true);
      const payload = { id: id };
      await postApi(`/add/pre-approved`, payload);
      GetService();
    } catch (err) {
      console.error("Error adding pre-approved vendor:", err);
    } finally {
      setIsLoadingbtn(false);
    }
  };

  const customStyles = {
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#bcf7c6" // Selected option background
        : state.isFocused
        ? "#bcf7c6" // Hovered option background
        : provided.backgroundColor,
      color: state.isSelected ? "block" : "inherit",
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999, // Ensure dropdown appears above other elements
    }),
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div>
      <Accordion defaultActiveKey="1">
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <ListIcon className="me-1" />
            Listed Vendors
          </Accordion.Header>
          <Accordion.Body className="p-4">
            <div className="tabledata-scroll mb-3">
              <div>
                {isLoading ? (
                  Array.from({ length: data?.length }).map((_, rowIndex) => (
                    <tr key={rowIndex}>
                      {Array.from({ length: 4 }).map((_, colIndex) => (
                        <td key={colIndex}>
                          <p className="placeholder-glow">
                            <span className="placeholder col-12 bg-secondary"></span>
                          </p>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <table className="table">
                    <thead>
                      <tr>
                        <th scope="col">#</th>
                        <th scope="col">Name</th>
                        <th scope="col">Service</th>
                        <th scope="col" className="text-center">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center">
                            No data found
                          </td>
                        </tr>
                      ) : (
                        data.map((item, index) => (
                          <tr key={item.id || index}>
                            <th scope="row">{index + 1}</th>
                            <td>{item.name || "-"}</td>
                            <td>
                              {item?.service_name.map((data) => (
                                <span className="me-2 service-badge">
                                  {data}
                                </span>
                              ))}
                            </td>
                            <td className="text-center">
                              {item?.is_pre_approved_active === "active" ? (
                                <span className="btn btn-secondary  not-allowed">
                                  {"Added"}
                                </span>
                              ) : (
                                <button
                                  className="btn primary-btn"
                                  onClick={() => PreVendorAdd(item?.id)}
                                >
                                  {isLoadingbtn ? "Adding..." : "Add"}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="1">
          <Accordion.Header>
            <i className="fa-solid fa-handshake me-1"></i> Create New Vendor
          </Accordion.Header>
          <Accordion.Body className="p-4">
            <Formik
              initialValues={{
                businessName: "",
                contactName: "",
                contactEmail: "",
                contactPhone: "",
                address: "",
                city: "",
                country: null,
                vendorStartDate: new Date(),
                selectedServices: [],
                selectedType: "",
                selectedCategory: null,
                selectedLocation: null,
                selectedCompliantType: "",
                selectedDataAccess: "",
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ setFieldValue, values }) => (
                <Form>
                  <div className="progress-vendor">
                    <div className="progress-track"></div>
                    <div
                      className="progress-line"
                      style={{
                        width: `${(currentStep / (steps.length - 1)) * 100}%`,
                      }}
                    ></div>
                    {steps.map((step, index) => (
                      <div
                        key={index}
                        className={`step ${
                          index === currentStep
                            ? "active"
                            : index < currentStep
                            ? "completed"
                            : ""
                        }`}
                      >
                        <span>
                          {index < currentStep ? <CheckIcon /> : index + 1}
                        </span>
                        {step}
                      </div>
                    ))}
                  </div>

                  {/* Step 1: Basic Info and Services */}
                  <div
                    className={`form-step ${currentStep === 0 ? "active" : ""}`}
                  >
                    <div className="row mb-3">
                      <div className="col-md-6 mb-3">
                        <label className="mb-2">
                          Business Name<span className="text-danger">*</span>
                        </label>
                        <Field name="businessName">
                          {({ field }) => (
                            <input
                              type="text"
                              className="form-control"
                              {...field}
                            />
                          )}
                        </Field>
                        <ErrorMessage
                          name="businessName"
                          component="div"
                          className="text-danger"
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="mb-2">
                          Contact Name<span className="text-danger">*</span>
                        </label>
                        <Field name="contactName">
                          {({ field }) => (
                            <input
                              type="text"
                              className="form-control"
                              {...field}
                            />
                          )}
                        </Field>
                        <ErrorMessage
                          name="contactName"
                          component="div"
                          className="text-danger"
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="mb-2">
                          Contact Email<span className="text-danger">*</span>
                        </label>
                        <Field name="contactEmail">
                          {({ field }) => (
                            <input
                              type="email"
                              className="form-control"
                              {...field}
                            />
                          )}
                        </Field>
                        <ErrorMessage
                          name="contactEmail"
                          component="div"
                          className="text-danger"
                        />
                      </div>
                      <div className="col-md-6 countycode-select mb-3">
                        <label className="mb-2">
                          Contact Phone<span className="text-danger">*</span>
                        </label>
                        <PhoneInput
                          defaultCountry="in"
                          value={values.contactPhone}
                          onChange={(phone) =>
                            setFieldValue("contactPhone", phone)
                          }
                          className="w-100"
                        />
                        <ErrorMessage
                          name="contactPhone"
                          component="div"
                          className="text-danger"
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="mb-2">
                          Address<span className="text-danger">*</span>
                        </label>
                        <Field name="address">
                          {({ field }) => (
                            <textarea
                              className="form-control"
                              rows="1"
                              {...field}
                            />
                          )}
                        </Field>
                        <ErrorMessage
                          name="address"
                          component="div"
                          className="text-danger"
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="mb-2">
                          City<span className="text-danger">*</span>
                        </label>
                        <Field name="city">
                          {({ field }) => (
                            <input
                              type="text"
                              className="form-control"
                              {...field}
                            />
                          )}
                        </Field>
                        <ErrorMessage
                          name="city"
                          component="div"
                          className="text-danger"
                        />
                      </div>
                      <div className="col-md-12 mb-3">
                        <label className="mb-2">
                          Country<span className="text-danger">*</span>
                        </label>
                        <Select
                          options={options}
                          value={values.country}
                          onChange={(value) => setFieldValue("country", value)}
                          styles={customStyles}
                          menuPlacement="auto"
                        />
                        <ErrorMessage
                          name="country"
                          component="div"
                          className="text-danger"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn primary-btn me-2"
                      onClick={nextStep}
                    >
                      Next <RightarrowIcon className="ms-2" />
                    </button>
                  </div>

                  {/* Step 2: Remaining Fields */}
                  <div
                    className={`form-step ${currentStep === 1 ? "active" : ""}`}
                  >
                    <div className="row">
                      <h5 className="mb-3">Services</h5>
                      <div className="col-md-6 mb-3">
                        <label className="mb-2">
                          Services Offered
                          <span className="text-danger">*</span>
                        </label>
                        <Select
                          isMulti
                          name="selectedServices"
                          options={serviceNames.map((name) => ({
                            value: name,
                            label: name,
                          }))}
                          className="basic-multi-select"
                          classNamePrefix="select"
                          value={values.selectedServices}
                          onChange={(value) =>
                            setFieldValue("selectedServices", value)
                          }
                          styles={customStyles}
                          menuPlacement="auto"
                          closeMenuOnSelect={false}
                        />
                        <ErrorMessage
                          name="selectedServices"
                          component="div"
                          className="text-danger"
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="mb-2">
                          Type<span className="text-danger">*</span>
                        </label>
                        <Select
                          name="selectedType"
                          options={Object.entries(serviceTypes).map(
                            ([key, value]) => ({
                              value: key,
                              label: value,
                            })
                          )}
                          value={
                            values.selectedType
                              ? {
                                  value: values.selectedType,
                                  label: values.selectedType,
                                }
                              : null
                          }
                          onChange={(selectedOption) =>
                            setFieldValue("selectedType", selectedOption.label)
                          }
                          styles={customStyles}
                          menuPlacement="auto"
                        />
                        <ErrorMessage
                          name="selectedType"
                          component="div"
                          className="text-danger"
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="mb-2">
                          Category<span className="text-danger">*</span>
                        </label>
                        <Select
                          name="selectedCategory"
                          options={Object.entries(serviceCategories).map(
                            ([key, value]) => ({
                              value: key,
                              label: value,
                            })
                          )}
                          className="basic-multi-select"
                          classNamePrefix="select"
                          value={values.selectedCategory}
                          onChange={(value) =>
                            setFieldValue("selectedCategory", value)
                          }
                          styles={customStyles}
                          menuPlacement="auto"
                        />
                        <ErrorMessage
                          name="selectedCategory"
                          component="div"
                          className="text-danger"
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="mb-2">
                          Location<span className="text-danger">*</span>
                        </label>
                        <Select
                          options={Object.entries(serviceLocations).map(
                            ([key, value]) => ({
                              value: key,
                              label: ucFirst(value),
                            })
                          )}
                          value={values.selectedLocation}
                          onChange={(value) =>
                            setFieldValue("selectedLocation", value)
                          }
                          styles={customStyles}
                          menuPlacement="auto"
                        />
                        <ErrorMessage
                          name="selectedLocation"
                          component="div"
                          className="text-danger"
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="mb-2">
                          SOC Compliant<span className="text-danger">*</span>
                        </label>
                        <Field
                          as="select"
                          name="selectedCompliantType"
                          className="form-select"
                        >
                          <option value="" label="Select..." />
                          <option value="yes" label="Yes" />
                          <option value="no" label="No" />
                        </Field>
                        <ErrorMessage
                          name="selectedCompliantType"
                          component="div"
                          className="text-danger"
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="mb-2">Data Access</label>
                        <Select
                          isDisabled={values.selectedCompliantType === "yes"}
                          options={service_dataAccess.map((value) => ({
                            value: value,
                            label: value,
                          }))}
                          value={values.data_access}
                          onChange={(value) => {
                            setFieldValue("data_access", value);
                            if (values.selectedCompliantType === "yes") {
                              setFieldValue("data_access", null);
                            }
                          }}
                          styles={customStyles}
                          menuPlacement="auto"
                        />
                        <ErrorMessage
                          name="data_access"
                          component="div"
                          className="text-danger"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn primary-btn me-2"
                      onClick={prevStep}
                    >
                      <LeftarrowIcon className="me-2" /> Back
                    </button>
                    <button
                      type="button"
                      className="btn primary-btn"
                      onClick={nextStep}
                    >
                      Next <RightarrowIcon className="ms-2" />
                    </button>
                  </div>

                  {/* Step 3: Vendor Start Date */}
                  <div
                    className={`form-step ${currentStep === 2 ? "active" : ""}`}
                  >
                    <div className="col-md-6 mb-3 d-grid date-select-vendor">
                      <label className="mb-2">
                        Contract Expiry<span className="text-danger">*</span>
                      </label>
                      <DatePicker
                        selected={values.vendorStartDate}
                        onChange={(date) =>
                          setFieldValue("vendorStartDate", date)
                        }
                        dateFormat="dd/MM/yyyy"
                      />
                      <ErrorMessage
                        name="vendorStartDate"
                        component="div"
                        className="text-danger"
                      />
                    </div>
                    <button
                      type="button"
                      className="btn primary-btn me-2"
                      onClick={prevStep}
                    >
                      <LeftarrowIcon className="me-2" /> Back
                    </button>

                    <button
                      type="submit"
                      className="btn primary-btn"
                      disabled={isLoading}
                    >
                      {isLoading ? "Submitting..." : "Submit"}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  );
};

export default VendorCreate;
