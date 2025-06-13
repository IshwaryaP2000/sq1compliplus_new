import { useEffect, useState, useMemo } from "react";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import Select from "react-select";
import countryList from "react-select-country-list";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Formik, Form, Field } from "formik";
import { getApi, postApi } from "../../services/apiService";
import { ucFirst } from "../../utils/UtilsGlobalData";
import ButtonWithLoader from "../Button/ButtonLoader";
import { LeftarrowIcon, RightarrowIcon } from "../Icons/Icons";

const AddVendor = ({ handleCloseAddVendor, GetVendors }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingNext, setIsLoadingNext] = useState(false);
  const [serviceCategories, setCategory] = useState([]);
  const [serviceLocations, setLocation] = useState([]);
  const [serviceNames, setName] = useState([]);
  const [serviceTypes, setType] = useState([]);
  const options = useMemo(() => countryList().getData(), []);
  const service_dataAccess = ["High", "Low", "Medium"];
  const [serviceNameserror, setNameError] = useState([]);
  const [businessNameserror, setBusinessNameError] = useState([]);
  const [emailerror, setEmailError] = useState([]);
  const [phoneerror, setPhoneError] = useState([]);
  const [addresserror, setAddressError] = useState([]);
  const [cityerror, setCityError] = useState([]);
  const [countryerror, setCountryError] = useState([]);
  const [servicenameerror, setServiceNameError] = useState([]);
  const [typeerror, setTypeError] = useState([]);
  const [Categoryerror, setCategoryError] = useState([]);
  const [locationerror, setLocationError] = useState([]);
  const [socerror, setSocError] = useState([]);
  const [dataaccesserror, setDataaccessError] = useState([]);
  const [startdateerror, setStartDateError] = useState([]);

  const GetService = async () => {
    try {
      setIsLoading(true);
      const response = await getApi("/vendor/get-vendor-service");
      if (response && response.data && response.data.data) {
        setCategory(response.data.data.service_categories || []);
        setLocation(response.data.data.service_locations || []);
        setName(response.data.data.service_names || []);
        setType(response.data.data.service_types || []);
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
      // navigate("/vendors");
      handleCloseAddVendor();
      GetVendors();
    } catch (error) {
      const backendErrors = {};
      console.error("Error submitting form:", error);
      if (error?.response?.data?.errors?.vendor_start_date) {
        backendErrors.contactName =
          error?.response?.data?.errors?.vendor_start_date[0];
        setStartDateError(error?.response?.data?.errors?.vendor_start_date[0]);
      }
    } finally {
      setIsLoading(false);
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

  const [currentStep, setCurrentStep] = useState(0);
  const steps = ["Basic Info", "Services", "Contract"];

  const nextStep = async (values, validateForm, setErrors) => {
    // No Formik validation errors, proceed to backend validation
    try {
      setNameError([]);
      setBusinessNameError([]);
      setEmailError([]);
      setPhoneError([]);
      setAddressError([]);
      setCityError([]);
      setCountryError([]);
      setIsLoadingNext(true);

      if (currentStep === 0) {
        const payload = {
          business_name: values.businessName,
          name: values.contactName,
          email: values.contactEmail,
          contact_phone: values.contactPhone,
          address: values.address,
          city: values.city,
          country: values.country?.value,
        };

        const response = await postApi("vendor/store-basic-valid", payload);
        if (response?.data?.errors) {
          console.error("Backend Errors:", response.data.errors);
          const backendErrors = {};
          if (response.data.errors.business_name) {
            backendErrors.businessName = response.data.errors.business_name[0];
          }
          // Map other errors...

          setErrors(backendErrors);
          return;
        }
      }

      // Proceed to the next step
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      console.error("Error submitting basic info:", error);
      if (error?.response?.data?.errors) {
        const backendErrors = {};
        if (error?.response?.data?.errors?.business_name) {
          backendErrors.businessName =
            error?.response?.data?.errors?.business_name[0];
          setBusinessNameError(error?.response?.data?.errors?.business_name[0]);
        }
        if (error?.response?.data?.errors?.name) {
          backendErrors.contactName = error?.response?.data?.errors?.name[0];
          setNameError(error?.response?.data?.errors?.name[0]);
        }
        if (error?.response?.data?.errors?.email) {
          backendErrors.contactName = error?.response?.data?.errors?.email[0];
          setEmailError(error?.response?.data?.errors?.email[0]);
        }
        if (error?.response?.data?.errors?.contact_phone) {
          backendErrors.contactName =
            error?.response?.data?.errors?.contact_phone[0];
          setPhoneError(error?.response?.data?.errors?.contact_phone[0]);
        }
        if (error?.response?.data?.errors?.city) {
          backendErrors.contactName = error?.response?.data?.errors?.city[0];
          setCityError(error?.response?.data?.errors?.city[0]);
        }
        if (error?.response?.data?.errors?.country) {
          backendErrors.contactName = error?.response?.data?.errors?.country[0];
          setCountryError(error?.response?.data?.errors?.country[0]);
        }
        if (error?.response?.data?.errors?.address) {
          backendErrors.contactName = error?.response?.data?.errors?.address[0];
          setAddressError(error?.response?.data?.errors?.address[0]);
        }

        setErrors(backendErrors);
        return;
      }
      setNameError(error?.response?.data?.errors?.business_name[0]);
    } finally {
      setIsLoadingNext(false);
    }
  };
  const midStep = async (values) => {
    try {
      setServiceNameError([]);
      setTypeError([]);
      setCategoryError([]);
      setLocationError([]);
      setSocError([]);
      setDataaccessError([]);
      setIsLoadingNext(true);

      const payload = {
        service_name: values.selectedServices.map((service) => service.value),
        service_type: values.selectedType,
        service_category: values.selectedCategory?.label ?? "",
        service_location: values.selectedLocation?.label?.toLowerCase() ?? "",
        soc_compliant: values.selectedCompliantType,
        data_access:
          values.selectedCompliantType === "yes"
            ? null
            : values.data_access?.value,
      };

      await postApi("vendor/store-service-valid", payload);

      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      console.error("Error submitting basic info:", error);
      if (error?.response?.data?.errors) {
        const backendErrors = {};
        if (error?.response?.data?.errors?.service_name) {
          backendErrors.businessName =
            error?.response?.data?.errors?.service_name[0];
          setServiceNameError(error?.response?.data?.errors?.service_name[0]);
        }
        if (error?.response?.data?.errors?.service_type) {
          backendErrors.contactName =
            error?.response?.data?.errors?.service_type[0];
          setTypeError(error?.response?.data?.errors?.service_type[0]);
        }
        if (error?.response?.data?.errors?.service_category) {
          backendErrors.contactName =
            error?.response?.data?.errors?.service_category[0];
          setCategoryError(error?.response?.data?.errors?.service_category[0]);
        }
        if (error?.response?.data?.errors?.service_location) {
          backendErrors.contactName =
            error?.response?.data?.errors?.service_location[0];
          setLocationError(error?.response?.data?.errors?.service_location[0]);
        }
        if (error?.response?.data?.errors?.soc_compliant) {
          backendErrors.contactName =
            error?.response?.data?.errors?.soc_compliant[0];
          setSocError(error?.response?.data?.errors?.soc_compliant[0]);
        }
        if (error?.response?.data?.errors?.data_access) {
          backendErrors.contactName =
            error?.response?.data?.errors?.data_access[0];
          setDataaccessError(error?.response?.data?.errors?.data_access[0]);
        }

        // setErrors(backendErrors);
        return;
      }
    } finally {
      setIsLoadingNext(false);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div defaultActiveKey="1">
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
        onSubmit={handleSubmit}
      >
        {({ setFieldValue, values, validateForm, setErrors }) => (
          <Form>
            <div className="progress-vendor mb-4 w-100">
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
                    {index < currentStep ? (
                      <i className="fa-solid fa-check"></i>
                    ) : (
                      index + 1
                    )}
                  </span>
                  {step}
                </div>
              ))}
            </div>

            {/* Step 1: Basic Info and Services */}
            <div className={`form-step ${currentStep === 0 ? "active" : ""}`}>
              <div className="row mb-3">
                <div className="col-md-6 mb-3">
                  <label className="mb-2">
                    Business Name<span className="text-danger">*</span>
                  </label>
                  <Field name="businessName">
                    {({ field }) => (
                      <input type="text" className="form-control" {...field} />
                    )}
                  </Field>
                  <p className="text-danger">{businessNameserror}</p>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="mb-2">
                    Contact Name<span className="text-danger">*</span>
                  </label>
                  <Field name="contactName">
                    {({ field }) => (
                      <input type="text" className="form-control" {...field} />
                    )}
                  </Field>
                  <p className="text-danger">{serviceNameserror}</p>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="mb-2">
                    Contact Email<span className="text-danger">*</span>
                  </label>
                  <Field name="contactEmail">
                    {({ field }) => (
                      <input type="email" className="form-control" {...field} />
                    )}
                  </Field>
                  <p className="text-danger">{emailerror}</p>
                </div>
                <div className="col-md-6 countycode-select mb-3">
                  <label className="mb-2">
                    Contact Phone<span className="text-danger">*</span>
                  </label>
                  <PhoneInput
                    defaultCountry="in"
                    value={values.contactPhone}
                    onChange={(phone) => setFieldValue("contactPhone", phone)}
                    className="w-100"
                  />
                  <p className="text-danger">{phoneerror}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="mb-2">
                    Address<span className="text-danger">*</span>
                  </label>
                  <Field name="address">
                    {({ field }) => (
                      <textarea className="form-control" rows="1" {...field} />
                    )}
                  </Field>
                  <p className="text-danger">{addresserror}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="mb-2">
                    City<span className="text-danger">*</span>
                  </label>
                  <Field name="city">
                    {({ field }) => (
                      <input type="text" className="form-control" {...field} />
                    )}
                  </Field>
                  <p className="text-danger">{cityerror}</p>
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
                  <p className="text-danger">{countryerror}</p>
                </div>
              </div>

              <div className="w-100 text-end">
                <button
                  type="button"
                  className="btn primary-btn me-2"
                  onClick={() => nextStep(values, validateForm, setErrors)}
                  disabled={isLoading}
                >
                  {isLoadingNext ? <ButtonWithLoader name="" /> : "Continue"}
                  <RightarrowIcon />
                </button>
              </div>
            </div>

            {/* Step 2: Remaining Fields */}
            <div className={`form-step ${currentStep === 1 ? "active" : ""}`}>
              <div className="row">
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

                  <p className="text-danger">{servicenameerror}</p>
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
                  <p className="text-danger">{typeerror}</p>
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
                  <p className="text-danger">{Categoryerror}</p>
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
                  <p className="text-danger">{locationerror}</p>
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
                  <p className="text-danger">{socerror}</p>
                </div>
                {values.selectedCompliantType === "no" && (
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
                    <p className="text-danger">{dataaccesserror}</p>
                  </div>
                )}
              </div>
              <div className=" stepper-bottom-btn">
                <button
                  type="button"
                  className="btn primary-btn me-2"
                  onClick={prevStep}
                >
                  <LeftarrowIcon /> Back
                </button>
                <button
                  type="button"
                  className="btn primary-btn"
                  onClick={() => midStep(values)}
                  disabled={isLoading}
                >
                  {isLoading ? <ButtonWithLoader name="" /> : "Next"}
                  <RightarrowIcon />
                </button>
              </div>
            </div>

            {/* Step 3: Vendor Start Date */}
            <div className={`form-step ${currentStep === 2 ? "active" : ""}`}>
              <div className="row mb-3">
                <div className="col-md-12 mb-3 date-select-vendor">
                  <label className="mb-2">
                    Vendor start date<span className="text-danger">*</span>
                  </label>
                  <DatePicker
                    selected={values.vendorStartDate}
                    onChange={(date) => setFieldValue("vendorStartDate", date)}
                    dateFormat="dd/MM/yyyy"
                  />
                  <p className="text-danger">{startdateerror}</p>
                </div>
              </div>
              <div className=" stepper-bottom-btn">
                <button
                  type="button"
                  className="btn primary-btn me-2"
                  onClick={prevStep}
                >
                  <LeftarrowIcon /> Back
                </button>

                <button
                  type="submit"
                  className="btn primary-btn"
                  disabled={isLoading}
                >
                  {isLoading ? <ButtonWithLoader name="" /> : "Submit"}
                </button>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default AddVendor;
