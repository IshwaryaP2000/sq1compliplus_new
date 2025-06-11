import Offcanvas from "react-bootstrap/Offcanvas";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useEffect, useState, useMemo } from "react";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import Select from "react-select";
import countryList from "react-select-country-list";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import { postApi, getApi } from "../../services/apiService";

function EditVendor({ Vendordata, GetVendors, areaType, handleCloseModals }) {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => {
    setShow(true);
  };
  const [isLoading, setIsLoading] = useState(false);
  const [serviceCategories, setCategory] = useState([]);
  const [serviceLocations, setLocation] = useState([]);
  const [serviceNames, setName] = useState([]);
  const [serviceTypes, setType] = useState([]);
  const options = useMemo(() => countryList().getData(), []);

  const validationSchema = Yup.object().shape({
    businessName: Yup.string().required("Business name is required"),
    contactName: Yup.string()
      .matches(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces")
      .required("Contact name is required"),
    contactEmail: Yup.string()
      .email("Invalid email")
      .required("Email is required"),
    contactPhone: Yup.string().required("Contact phone is required"),
    address: Yup.string().required("Address is required"),
    city: Yup.string().required("City is required"),
    country: Yup.object().required("Country is required"),
    selectedServices: Yup.array().min(
      1,
      "At least one service must be selected"
    ),
    selectedType: Yup.string().required("Type is required"),
    selectedCategory: Yup.object().required("Category is required"),
    selectedLocation: Yup.object().required("Location is required"),
    selectedCompliantType: Yup.string().required("SOC Compliant is required"),
  });

  const GetService = async () => {
    try {
      const response = await getApi("/vendor/get-vendor-service");
      setCategory(response?.data?.data?.service_categories);
      setLocation(response?.data?.data?.service_locations);
      setName(response?.data?.data?.service_names);
      setType(response?.data?.data?.service_types);
    } catch (error) {}
  };

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
      service_location: values.selectedLocation.label,
      soc_compliant: values.selectedCompliantType,
      data_access: values.selectedDataAccess, // Use the Formik state value
      type: "vendor",
    };
    try {
      setIsLoading(true);
      await postApi(`/vendor/vendor-update/${Vendordata?.id}`, payload);
      GetVendors();
    } catch (error) {
      const errors = error.response?.data?.errors;

      if (errors && typeof errors === "object") {
        Object.values(errors).forEach((messages) => {
          messages.forEach((msg) => toast.error(msg));
        });
      } else {
        toast.error("An unexpected error occurred.");
      }
      toast.error(error.response?.data?.errors);
    } finally {
      setIsLoading(false);
      handleClose();
      handleCloseModals();
    }
  };

  useEffect(() => {
    GetService();
  }, []);

  return (
    <>
      {areaType === "vendorEdit" ? (
        <button className="btn btn-sm my-1 policy-buttons" onClick={handleShow}>
          <i className="fa-regular fa-edit me-1 "></i> Edit
        </button>
      ) : (
        <button
          className="btn btn-sm py-0  tableborder-right"
          onClick={handleShow}
        >
          <i className="fa-regular fa-pen-to-square"></i>
        </button>
      )}
      <Offcanvas
        show={show}
        onHide={handleClose}
        backdrop="static"
        placement="end"
        style={{ width: "50%" }}
      >
        <Offcanvas.Header closeButton className="shadow-sm">
          <Offcanvas.Title>
            <h6 className="mb-0 fw-bold">
              <i className="fa-solid fa-edit" /> Edit Vendor
            </h6>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Formik
            initialValues={{
              businessName: Vendordata?.business_name || "",
              contactName: Vendordata?.name || "",
              contactEmail: Vendordata?.email || "",
              contactPhone: Vendordata?.contact_phone || "",
              address: Vendordata?.address || "",
              city: Vendordata?.city || "",
              country:
                options.find(
                  (option) => option.value === Vendordata?.country
                ) || null,
              vendorStartDate: Vendordata?.vendor_start_date || new Date(),
              selectedServices:
                Vendordata?.service_name?.map((service) => ({
                  value: service,
                  label: service,
                })) || [],
              selectedType: Vendordata?.service_type || "",
              selectedCategory:
                Object.entries(serviceCategories)
                  .map(([key, value]) => ({ value: key, label: value }))
                  .find(
                    (category) =>
                      category.label === Vendordata?.service_category
                  ) || null,
              selectedLocation:
                Object.entries(serviceLocations)
                  .map(([key, value]) => ({ value: key, label: value }))
                  .find(
                    (location) =>
                      location.label === Vendordata?.service_location
                  ) || null,
              selectedCompliantType: Vendordata?.soc_compliant || "",
              selectedDataAccess: Vendordata?.data_access,
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ setFieldValue, values }) => (
              <Form>
                <div className="row mb-3">
                  <div className="col-md-6 mb-3">
                    <label className="mb-2">
                      Business Name<span className="text-danger">*</span>
                    </label>
                    <Field name="businessName">
                      {({ field }) => (
                        <input
                          type="text"
                          value={Vendordata?.data?.business_name}
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
                          disabled={true}
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
                      onChange={(phone) => setFieldValue("contactPhone", phone)}
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
                  <div className="col-md-6 mb-3">
                    <label className="mb-2">
                      Country<span className="text-danger">*</span>
                    </label>
                    <Select
                      name="country"
                      options={options} // Pass the country options
                      value={options.find(
                        (option) => option.value === values.country?.value
                      )} // Match the selected country
                      onChange={(value) => setFieldValue("country", value)} // Update Formik state
                    />
                    <ErrorMessage
                      name="country"
                      component="div"
                      className="text-danger"
                    />
                  </div>
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
                </div>
                {/* <h6 className="fw-bold shadow-sm p-3 px-2 ">Services</h6> */}
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="mb-2">
                      Services Offered<span className="text-danger">*</span>
                    </label>
                    <Select
                      isMulti
                      name="selectedServices"
                      options={serviceNames.map((name) => ({
                        value: name,
                        label: name,
                      }))} // Map serviceNames to options
                      className="basic-multi-select"
                      classNamePrefix="select"
                      menuPlacement="auto"
                      closeMenuOnSelect={false}
                      value={values.selectedServices.map((service) =>
                        typeof service === "string"
                          ? { value: service, label: service } // Convert string to object
                          : service
                      )} // Ensure value matches the options structure
                      onChange={(value) =>
                        setFieldValue("selectedServices", value)
                      } // Update Formik state
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
                      menuPlacement="auto"
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
                      menuPlacement="auto"
                      options={Object.entries(serviceCategories).map(
                        ([key, value]) => ({
                          value: key,
                          label: value,
                        })
                      )} // Map serviceCategories to options
                      className="basic-multi-select"
                      classNamePrefix="select"
                      value={values.selectedCategory} // Bind the selected category
                      onChange={(value) =>
                        setFieldValue("selectedCategory", value)
                      } // Update Formik state
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
                      name="selectedLocation"
                      menuPlacement="auto"
                      options={Object.entries(serviceLocations).map(
                        ([key, value]) => ({
                          value: key,
                          label: value,
                        })
                      )} // Map serviceLocations to options
                      value={values.selectedLocation} // Bind the selected location
                      onChange={(value) =>
                        setFieldValue("selectedLocation", value)
                      } // Update Formik state
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
                      disabled={true}
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
                    <Field
                      as="select"
                      disabled={true}
                      className="form-select"
                      name="selectedDataAccess"
                      value={values.selectedDataAccess || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFieldValue("selectedDataAccess", value);
                        if (values.selectedCompliantType === "yes") {
                          setFieldValue("selectedDataAccess", null);
                        }
                      }}
                    >
                      <option value="" label="Please select" />
                      <option value="High" label="High" />
                      <option value="Medium" label="Medium" />
                      <option value="Low" label="Low" />
                      <option value="N/A" label="N/A" />
                    </Field>
                    <ErrorMessage
                      name="selectedDataAccess"
                      component="div"
                      className="text-danger"
                    />
                  </div>
                </div>
                <div className="d-flex justify-content-end my-3">
                  <button
                    className="btn btn-outline-secondary me-2"
                    type="submit"
                    onClick={handleClose}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn primary-btn"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div
                        class="spinner-border p-0 text-success spinner-border-sm"
                        role="status"
                      ></div>
                    ) : (
                      "Update Vendor"
                    )}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default EditVendor;
