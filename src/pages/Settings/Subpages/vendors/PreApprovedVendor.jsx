import { useEffect, useMemo } from "react";
import { useState } from "react";
import Offcanvas from "react-bootstrap/Offcanvas";
import Select from "react-select";
import DatePicker from "react-datepicker";
import { Link } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import moment from "moment";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useNavigate } from "react-router-dom";
import { BiUpArrowAlt, BiDownArrowAlt } from "react-icons/bi";
import { deleteApi, getApi, postApi } from "../../../../services/apiService";
import Searchbar from "../../../../components/Search/Searchbar";
import Pagination from "../../../../components/Pagination/Pagination";
import DeleteComponent from "../../../../components/Modal/DeleteWarningMsg";
import usePageTitle from "../../../../utils/usePageTitle";
import {
  createDebouncedSearch,
  fetchSearchResults,
  highlightText,
  LimitSelector,
} from "../../../../components/Search/useSearchAndSort";
import { PlusIcon, RegulareyeIcon, RightarrowIcon } from "../../../../components/Icons/Icons";

export const PreApprovedVendor = () => {
  usePageTitle("Pre-Approved Vendor");
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  const handleClose = () => {
    setShow(false);
  };

  const handleShow = () => setShow(true);
  const service_dataAccess = ["high", "low", "medium", "N/A"];
  const [showDelete, setShowDelete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState(null);
  const [serviceCategories, setCategory] = useState([]);
  const [serviceLocations, setLocation] = useState([]);
  const [serviceNames, setName] = useState([]);
  const [serviceTypes, setType] = useState([]);
  const [meta, setMeta] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [sortColumn, setSortColumn] = useState("business_name");
  const [sortDirection, setSortDirection] = useState("desc");
  const [searchVal, setSearchVal] = useState("");
  const [limit, setLimit] = useState(10);
  const [filteredLength, setFilteredLength] = useState([]);
  const [pageIndex, setPageIndex] = useState([]);
  const [questionCount, setQuestionCount] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const GetPreApprovedVendor = async (
    URI = "/vendor/get-pre-approved-vendors"
  ) => {
    try {
      setIsLoading(true);
      const response = await getApi(URI);
      setMeta(response?.data?.data?.meta);
      setFilteredUsers(response?.data?.data?.data);
      setFilteredLength(response?.data?.data?.meta?.total);
      setPageIndex(response?.data?.data);
    } catch (err) {
      console.error("Error fetching pre-approved vendors:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      if (!userIdToDelete) return;
      await deleteApi(`/vendor/delete/pre-approved/${userIdToDelete}`);
      GetPreApprovedVendor();
      handleCloseDelete();
    } catch (error) {
      console.error("Error deleting vendor:", error);
    }
  };

  const validationSchema = Yup.object().shape({
    businessName: Yup.string().required("Business name is required"),
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
      vendor_start_date: values.vendorStartDate,
      service_name: values.selectedServices.map((service) => service.value),
      service_type: values.selectedType,
      service_category: values.selectedCategory.label,
      service_location: values.selectedLocation.label,
      soc_compliant: values.selectedCompliantType,
      data_access:
        values.selectedCompliantType === "yes"
          ? null
          : values.data_access?.value,
      type: "pre_approved_vendor",
    };
    try {
      setIsLoading(true);
      await postApi("/vendor/store", payload);
      handleClose();
      GetPreApprovedVendor();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const GetService = async () => {
    try {
      const response = await getApi("/vendor/get-vendor-service");
      setCategory(response?.data?.data?.service_categories);
      setLocation(response?.data?.data?.service_locations);
      setName(response?.data?.data?.service_names);
      setType(response?.data?.data?.service_types);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const handleCloseDelete = () => {
    setShowDelete(false);
    setUserIdToDelete(null);
  };

  const handleShowDelete = (userId) => {
    setShowDelete(true);
    setUserIdToDelete(userId);
  };

  const handleSearch = (searchVal) => {
    setSearchVal(searchVal);
    debouncedFetchSearchResults({
      search: searchVal,
      sort_by: sortColumn || "",
      sort_direction: sortDirection,
      limit: limit,
    });
  };

  const handleSort = (columnName) => {
    const newSortDirection =
      sortColumn === columnName
        ? sortDirection === "asc"
          ? "desc"
          : "asc"
        : "asc";

    const newSortColumn = columnName;
    setSortDirection(newSortDirection);
    setSortColumn(newSortColumn);

    debouncedFetchSearchResults({
      search: searchVal,
      sort_by: newSortColumn,
      sort_direction: newSortDirection,
      limit: limit,
    });
  };

  const debouncedFetchSearchResults = useMemo(
    () =>
      createDebouncedSearch((params) => {
        fetchSearchResults(
          "/vendor/get-pre-approved-vendors",
          params,
          setFilteredUsers,
          setIsLoading,
          setFilteredLength,
          setPageIndex
        );
      }, 300),
    []
  );

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    debouncedFetchSearchResults({
      search: searchVal,
      sort_by: sortColumn || "",
      sort_direction: sortDirection,
      limit: newLimit,
    });
  };

  const GetQuestions = async () => {
    try {
      const response = await getApi("/vendor/list-questions");
      setQuestionCount(response?.data?.data?.data);
    } catch (err) {
      console.error("Error fetching questions:", err);
    }
  };

  const handleButtonClick = () => {
    if (!questionCount || questionCount.length === 0) {
      setShowModal(true);
    } else {
      handleShow(true);
    }
  };

  const handleGoToQuestionPage = () => {
    navigate("/settings/question");
    setShowModal(false);
  };
  const handleCloseModal = () => setShowModal(false);

  useEffect(() => {
    GetPreApprovedVendor();
    GetService();
    GetQuestions();
  }, []);

  return (
    <div>
      <div className="d-flex justify-content-between mb-3 flex-wrap">
        <h5 className="mb-0 d-flex align-items-end">
          Pre-Approved Vendors
          {meta?.total !== 0 ? (
            <span className="badge user-active text-white ms-1">
              {meta?.total}
            </span>
          ) : (
            ""
          )}
        </h5>
        <div className="d-flex">
          <Searchbar onSearch={handleSearch} placeHolder={"Search"} />
          <button
            type="button"
            className="btn ms-2 primary-btn"
            onClick={handleButtonClick}
          >
            <PlusIcon className="me-2" /> Create Pre-Approved Vendor
          </button>

          <div>
            <Offcanvas
              show={show}
              onHide={handleClose}
              backdrop="static"
              placement="end"
              className="w-50"
            >
              <Offcanvas.Header closeButton className="shadow-sm">
                <Offcanvas.Title>
                  <h6 className="mb-0 fw-bold">Create Pre-Approved Vendor</h6>
                </Offcanvas.Title>
              </Offcanvas.Header>
              <Offcanvas.Body className="p-4">
                <div>
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
                        <div className="row mb-3">
                          <div className="col-md-6 mb-3">
                            <label className="mb-2">
                              Business Name
                              <span className="text-danger">*</span>
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
                          <div className="col-md-6 mb-3 d-grid date-select-vendor">
                            <label className="mb-2">
                              Contract Expiry
                              <span className="text-danger">*</span>
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
                        <h5 className="mb-3">Services</h5>
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
                                setFieldValue(
                                  "selectedType",
                                  selectedOption.label
                                )
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
                                  label: value,
                                })
                              )}
                              value={values.selectedLocation}
                              onChange={(value) =>
                                setFieldValue("selectedLocation", value)
                              }
                            />
                            <ErrorMessage
                              name="selectedLocation"
                              component="div"
                              className="text-danger"
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="mb-2">
                              SOC Compliant
                              <span className="text-danger">*</span>
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
                          {values.selectedCompliantType === "no" && (
                            <div className="col-md-6 mb-3">
                              <label className="mb-2">Data Access</label>
                              <Select
                                isDisabled={
                                  values.selectedCompliantType === "yes"
                                }
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
                              />
                              <ErrorMessage
                                name="data_access"
                                component="div"
                                className="text-danger"
                              />
                            </div>
                          )}
                        </div>
                        <div className="d-flex justify-content-end my-3">
                          <button
                            className="btn primary-btn"
                            type="submit"
                            disabled={isLoading}
                          >
                            {isLoading ? "Submiting..." : "Submit"}
                          </button>
                        </div>
                      </Form>
                    )}
                  </Formik>
                </div>
              </Offcanvas.Body>
            </Offcanvas>
          </div>
        </div>
      </div>
      <div className="custom-table tabledata-scroll mb-3">
        <table className="table users-table mb-0">
          <thead className="tablescrolling-thead-tr">
            <tr>
              <th scope="col">#</th>
              <th
                scope="col"
                onClick={() => {
                  handleSort("business_name");
                }}
              >
                Business Name
                <span
                  style={{
                    color: "rgba(48, 188, 71)",
                    cursor: "pointer",
                    fontSize: "20px",
                  }}
                >
                  {sortDirection === "asc" && sortColumn === "business_name" ? (
                    <BiUpArrowAlt />
                  ) : (
                    <BiDownArrowAlt />
                  )}
                </span>
              </th>
              <th scope="col">Service</th>
              <th scope="col">Assessment Status</th>
              <th scope="col" className="text-center">
                Assessment
              </th>
            </tr>
          </thead>
          <tbody className="tablescrolling-tbody">
            {isLoading ? (
              // Array.from({ length: 7 }).map((_, rowIndex) => (
              //   <tr key={rowIndex}>
              //     {Array.from({ length: 5 }).map((_, colIndex) => (
              //       <td key={colIndex}>
              //         <p className="placeholder-glow">
              //           <span className="placeholder col-12 bg-secondary"></span>
              //         </p>
              //       </td>
              //     ))}
              //   </tr>
              // ))
              <Loader rows={7} cols={5} />
            ) : filteredUsers?.length > 0 ? (
              filteredUsers?.map((data, index) => (
                <tr key={data?.id || index}>
                  <td>
                    {(pageIndex?.meta?.current_page - 1) *
                      pageIndex?.meta?.per_page +
                      index +
                      1}
                  </td>
                  <td
                    dangerouslySetInnerHTML={{
                      __html: highlightText(
                        data?.business_name || "",
                        searchVal
                      ),
                    }}
                  ></td>
                  <td>
                    {data?.service_name.map((data) => (
                      <span className="me-2 bg-lightgreen-badge">
                        <small>{data}</small>
                      </span>
                    ))}
                  </td>

                  <td>
                    <span
                      className={`text-capitalize  ${
                        data.assessment_status === "completed"
                          ? "bg-success-badge "
                          : data.assessment_status === "invited"
                          ? " bg-processing-badge"
                          : "bg-primary-badge"
                      }`}
                    >
                      {data?.assessment_status}
                    </span>
                  </td>
                  <td className="table-td-center">
                    <div className="users-crud d-flex m-auto">
                      <Link
                        to={`/settings/pre-approved-assessment-view/${data.id}`}
                      >
                        <OverlayTrigger
                          overlay={
                            <Tooltip id="tooltip-disabled">
                              View Assessment
                            </Tooltip>
                          }
                        >
                          <button className="btn btn-sm px-lg-3 my-1 tableborder-right">
                            <RegulareyeIcon />
                          </button>
                        </OverlayTrigger>
                      </Link>

                      <DeleteComponent
                        handleShowDelete={handleShowDelete}
                        dataId={data?.id}
                        handleCloseDelete={handleCloseDelete}
                        showDelete={showDelete}
                        handleDelete={handleDelete}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
                  No Users Available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="d-flex flex-row bd-highlight mb-3 ">
        <div className=" bd-highlight pagennation-list">
          <LimitSelector
            onLimitChange={handleLimitChange}
            filteredLength={filteredLength}
          />
        </div>
        <div className="p-2 bd-highlight w-100">
          <Pagination
            dataFetchFunction={GetPreApprovedVendor}
            dataPaginationLinks={pageIndex?.meta}
            filteredLength={filteredLength}
            search={searchVal}
            sort_by={sortColumn}
            sort_direction={sortDirection}
            limit={limit}
          />
        </div>
      </div>

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Body className="p-4">
          <div className="text-center">
            <div className="mb-3">
              <div className="warning1-icon-wrapper">
                <i className="fa-solid text-warning fa-triangle-exclamation"></i>
              </div>
            </div>
            <h5 className="fw-bold mb-2 text-muted">No Questions Found</h5>
            <p className="mb-2">
              You haven’t <b>uploaded any questions</b>. Please upload
              questions.
            </p>
          </div>
        </Modal.Body>
        <div className="d-flex justify-content-center mb-3 gap-4">
          <Button
            onClick={handleCloseModal}
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
            Go to Question Page <RightarrowIcon className="ms-1" />
          </Button>
        </div>
      </Modal>
    </div>
  );
};
