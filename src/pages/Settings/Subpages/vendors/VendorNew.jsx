import  { useEffect, useMemo, useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useNavigate, Link } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { BiUpArrowAlt, BiDownArrowAlt } from "react-icons/bi";
import { getApi, postApi } from "../../../../services/apiService";
import Pagination from "../../../../components/Pagination/Pagination";
import Searchbar from "../../../../components/Search/Searchbar";
import EditVendor from "../../../../components/Modal/EditVendor";
import AddVendor from "./modals/AddVendor";
import ListedVendor from "./modals/ListedVendor";
import {
  createDebouncedSearch,
  fetchSearchResults,
  highlightText,
  LimitSelector,
} from "../../components/useSearchAndSort";

const Vendor = () => {
  const navigate = useNavigate();
  const [showModalResend, setShowModalResend] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(null);
  const [meta, setMeta] = useState(null);
  const [sortColumn, setSortColumn] = useState("business_name");
  const [sortDirection, setSortDirection] = useState("desc");
  const [searchVal, setSearchVal] = useState("");
  const [limit, setLimit] = useState(10);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredLength, setFilteredLength] = useState([]);
  const [pageIndex, setPageIndex] = useState([]);
  const [showmodaltable, setShowmodaltable] = useState(false);
  const handleClosetable = () => setShowmodaltable(false);
  const handleShowtable = () => setShowmodaltable(true);
  const [addVendorShow, setaddVendorShow] = useState(false);
  const handleCloseAddVendor = () => setaddVendorShow(false);
  const handleShowAddVendor = () => setaddVendorShow(true);

  const handleButtonClick = () => {
    if (!questionCount || questionCount.length === 0) {
      setShowModal(true);
    } else {
      // navigate("../vendor-create");
      handleShowAddVendor();
    }
  };
  const handleGoToQuestionPage = () => {
    navigate("/settings/question");
    setShowModal(false);
  };
  const handleCloseModal = () => setShowModal(false);

  const GetQuestions = async () => {
    try {
      const response = await getApi("/vendor/list-questions");
      setQuestionCount(response?.data?.data?.data);
    } catch {}
  };

  const GetVendors = async (URI = "/vendor/vendor-list") => {
    try {
      setIsLoading(true);
      const response = await getApi(URI);
      setFilteredUsers(response?.data?.data?.data);
      setFilteredLength(response?.data?.data?.meta?.total);
      setMeta(response?.data?.data?.meta);
      setPageIndex(response?.data?.data);
    } catch {
    } finally {
      setIsLoading(false);
    }
  };
  const handleDelete = async () => {
    try {
      if (!userIdToDelete) return;
      await postApi(`/vendor/vendor-delete/${userIdToDelete}`);
      GetVendors();
      handleCloseDelete();
    } catch (error) {}
  };

  const handleResend = async (id) => {
    try {
      await postApi(`/vendor/vendor-resend-invite/${id}`);
      GetVendors();
    } catch (error) {
      console.error("Error resending invite:", error);
    }
  };

  const handleResendClick = (id) => {
    setSelectedVendorId(id);
    setShowModalResend(true);
  };

  const handleConfirm = () => {
    if (selectedVendorId) {
      handleResend(selectedVendorId);
      setShowModalResend(false);
    }
  };

  useEffect(() => {
    GetVendors();
  }, []);

  // Service data
  const [showDelete, setShowDelete] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState(null);

  const handleCloseDelete = () => {
    setShowDelete(false);
    setUserIdToDelete(null);
  };
  const handleShowDelete = (userId) => {
    setShowDelete(true);
    setUserIdToDelete(userId);
  };

  const GetService = async () => {
    try {
      await getApi("/vendor/get-vendor-service");
      // setSelectedDataAccess(response?.data?.data?.data_access);
    } catch (error) {}
  };

  useEffect(() => {
    GetService();
    GetQuestions();
  }, []);

  const Getreport = async (id) => {
    try {
      const response = await getApi(`vendor/assessment/report/${id}`);
      const byteCharacters = atob(response?.data?.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Vendor-Assessment-Report.pdf");
      document.body.appendChild(link);
      link.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading PDF:", error);
    }
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

  // const debouncedFetchSearchResults = useCallback(
  //   createDebouncedSearch((params) => {
  //     fetchSearchResults(
  //       "/vendor/vendor-list",
  //       params,
  //       setFilteredUsers,
  //       setIsLoading,
  //       setFilteredLength,
  //       setPageIndex
  //     );
  //   }, 300),
  //   []
  // );

  const debouncedFetchSearchResults = useMemo(
    () =>
      createDebouncedSearch((params) => {
        fetchSearchResults(
          "/vendor/vendor-list",
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

  return (
    <div>
      <div className="d-flex justify-content-between mb-3 flex-wrap">
        <h5 className="p-2 mb-0">
          Vendors{" "}
          {meta?.total !== 0 ? (
            <span className="badge user-active text-white">{meta?.total}</span>
          ) : (
            ""
          )}
        </h5>
        <div className="d-flex">
          <Searchbar onSearch={handleSearch} placeHolder={"Search"} />
          <button className="btn  ms-2 primary-btn " onClick={handleShowtable}>
            <i className="fa-solid fa-plus me-1"></i> Pre Approved
          </button>
          {/* <button className="btn  ms-2 primary-btn " onClick={handleShow}>
            <i className="fa-solid fa-plus me-1"></i> New Vendor
          </button> */}

          <button
            className="btn  ms-2 primary-btn "
            onClick={handleButtonClick}
          >
            <i className="fa-solid fa-plus me-1"></i> Create Vendor
          </button>
        </div>
      </div>
      <div>
        <div className=" custom-table tabledata-scroll-second mb-3">
          <table className=" table users-table mb-0">
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
                    {sortDirection === "asc" &&
                    sortColumn === "business_name" ? (
                      <BiUpArrowAlt />
                    ) : (
                      <BiDownArrowAlt />
                    )}
                  </span>
                </th>
                <th
                  scope="col"
                  onClick={() => {
                    handleSort("name");
                  }}
                >
                  Contact Name
                  <span
                    style={{
                      color: "rgba(48, 188, 71)",
                      cursor: "pointer",
                      fontSize: "20px",
                    }}
                  >
                    {sortDirection === "asc" && sortColumn === "name" ? (
                      <BiUpArrowAlt />
                    ) : (
                      <BiDownArrowAlt />
                    )}
                  </span>
                </th>
                <th
                  scope="col"
                  onClick={() => {
                    handleSort("email");
                  }}
                >
                  Contact Email
                  <span
                    style={{
                      color: "rgba(48, 188, 71)",
                      cursor: "pointer",
                      fontSize: "20px",
                    }}
                  >
                    {sortDirection === "asc" && sortColumn === "email" ? (
                      <BiUpArrowAlt />
                    ) : (
                      <BiDownArrowAlt />
                    )}
                  </span>
                </th>
                <th
                  className="text-nowrap"
                  scope="col"
                  onClick={() => {
                    handleSort("contact_phone");
                  }}
                >
                  Contact Phone
                  <span
                    style={{
                      color: "rgba(48, 188, 71)",
                      cursor: "pointer",
                      fontSize: "20px",
                    }}
                  >
                    {sortDirection === "asc" &&
                    sortColumn === "contact_phone" ? (
                      <BiUpArrowAlt />
                    ) : (
                      <BiDownArrowAlt />
                    )}
                  </span>
                </th>
                <th scope="col" className="text-center">
                  Risk
                </th>
                <th
                  className="text-nowrap"
                  scope="col"
                  onClick={() => {
                    handleSort("data_access");
                  }}
                >
                  Data Access
                  <span
                    style={{
                      color: "rgba(48, 188, 71)",
                      cursor: "pointer",
                      fontSize: "20px",
                    }}
                  >
                    {sortDirection === "asc" && sortColumn === "data_access" ? (
                      <BiUpArrowAlt />
                    ) : (
                      <BiDownArrowAlt />
                    )}
                  </span>
                </th>
                <th scope="col" className="text-center">
                  Status
                </th>
                <th scope="col" className="text-center text-nowrap">
                  Assessment Status
                </th>
                <th scope="col" className="text-center">
                  Percentage
                </th>
                <th scope="col" className="text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="tablescrolling-tbody">
              {isLoading ? (
                Array.from({ length: 7 }).map((_, rowIndex) => (
                  <tr key={rowIndex}>
                    {Array.from({ length: 11 }).map((_, colIndex) => (
                      <td key={colIndex}>
                        <p className="placeholder-glow">
                          <span className="placeholder col-12 bg-secondary"></span>
                        </p>
                      </td>
                    ))}
                  </tr>
                ))
              ) : //  data?.length > 0 ? (
              //   data?.map((vendors, index) => (
              filteredUsers?.length > 0 ? (
                filteredUsers?.map((vendors, index) => (
                  <tr key={vendors?.id || index}>
                    {/* <th scope="row">{index + 1}</th> */}
                    {/* <td>{vendors?.business_name}</td>
                    <td>{vendors?.name}</td>
                    <td>{vendors?.email}</td>
                    <td>{vendors?.contact_phone}</td> */}
                    <th scope="row">
                      {(pageIndex?.meta?.current_page - 1) *
                        pageIndex?.meta?.per_page +
                        index +
                        1}
                    </th>
                    <td
                      dangerouslySetInnerHTML={{
                        __html: highlightText(
                          vendors?.business_name || "",
                          searchVal
                        ),
                      }}
                    ></td>

                    <td
                      dangerouslySetInnerHTML={{
                        __html: highlightText(vendors?.name || "", searchVal),
                      }}
                    ></td>
                    <td
                      dangerouslySetInnerHTML={{
                        __html: highlightText(vendors?.email || "", searchVal),
                      }}
                    ></td>
                    <td
                      dangerouslySetInnerHTML={{
                        __html: highlightText(
                          vendors?.contact_phone || "",
                          searchVal
                        ),
                      }}
                    ></td>

                    <td className="text-center">
                      {vendors?.risk_url !== null ? (
                        <img
                          src={vendors?.risk_url}
                          style={{ width: "55px" }}
                          alt=""
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                    {/* <td>{vendors?.data_access}</td> */}
                    <td
                      className="Capitalize"
                      dangerouslySetInnerHTML={{
                        __html: highlightText(
                          vendors?.data_access || "",
                          searchVal
                        ),
                      }}
                    ></td>
                    <td className="text-center">
                      {" "}
                      <span
                        className={`badge badge-fixedwidth Capitalize  ${
                          vendors.status === "active"
                            ? " user-active"
                            : vendors.status === "invited"
                            ? " user-invit"
                            : "bg-secondary"
                        }`}
                      >
                        {vendors?.status?.replace("-", " ")}
                      </span>
                    </td>
                    <td className="text-center">
                      {" "}
                      <span
                        className={`badge badge-fixedwidth Capitalize  ${
                          vendors.status === "active"
                            ? " user-active"
                            : vendors.assessment_status === "in-progress"
                            ? "bg-warning"
                            : "bg-secondary"
                        }`}
                      >
                        {/* {vendors?.assessment_status?.replace("-", " ")} */}
                        {vendors?.type === "pre_approved_vendor" &&
                        vendors?.assessment_status.toLowerCase() === "completed"
                          ? "Pre Approved"
                          : vendors?.assessment_status?.replace("-", " ")}
                      </span>
                    </td>
                    <td className="table-td-center">
                      <div style={{ width: 40, height: 40 }}>
                        <CircularProgressbar
                          value={vendors?.percentage}
                          text={`${vendors?.percentage}%`}
                          styles={buildStyles({
                            pathColor: `orange
                             
                           `,
                            textColor: "orange",
                          })}
                        />
                      </div>
                    </td>
                    <td className="table-td-center">
                      <div className="users-crud d-flex">
                        <OverlayTrigger
                          overlay={
                            <Tooltip id="tooltip-disabled">
                              Assessment View
                            </Tooltip>
                          }
                        >
                          <Link to={`/vendors/assessment-view/${vendors?.id}`}>
                            <button
                              className="btn btn-sm my-1 tableborder-right"
                              // onClick={() => handleView(vendors?.id)}
                            >
                              <i className="fa-regular fa-eye"></i>
                            </button>
                          </Link>
                        </OverlayTrigger>
                        <OverlayTrigger
                          overlay={
                            <Tooltip id="tooltip-disabled">Edit</Tooltip>
                          }
                        >
                          {vendors?.type === "pre_approved_vendor" ? (
                            <span className="tableborder-right ">
                              <button className="btn btn-sm my-1">
                                <i
                                  className={"fa-solid fa-ban not-allowed"}
                                ></i>
                              </button>
                            </span>
                          ) : (
                            <EditVendor
                              Vendordata={vendors}
                              GetVendors={GetVendors}
                            />
                          )}
                        </OverlayTrigger>

                        {vendors?.status === "invited" ||
                        vendors?.status === "resent_invited" ? (
                          <OverlayTrigger
                            overlay={
                              <Tooltip id="tooltip-resend">
                                Resent Invite
                              </Tooltip>
                            }
                          >
                            <span className="tableborder-right ">
                              <button
                                className="btn btn-sm my-1"
                                onClick={() => handleResendClick(vendors?.id)}
                              >
                                <i className={"fa-solid fa-repeat"}></i>
                              </button>
                            </span>
                          </OverlayTrigger>
                        ) : (
                          <OverlayTrigger
                            overlay={
                              <Tooltip id="tooltip-resend">Resend</Tooltip>
                            }
                          >
                            <span className="tableborder-right ">
                              <button className="btn btn-sm my-1">
                                <i
                                  className={"fa-solid fa-ban not-allowed"}
                                ></i>
                              </button>
                            </span>
                          </OverlayTrigger>
                        )}
                        {vendors?.assessment_status === "completed" ? (
                          <OverlayTrigger
                            overlay={
                              <Tooltip id="tooltip-resend">
                                Genarate report
                              </Tooltip>
                            }
                          >
                            <span
                              className="tableborder-right py-2 px-2"
                              type="button"
                              onClick={() => Getreport(vendors?.id)}
                            >
                              <i className={"fa-solid fa-print"}></i>
                            </span>
                          </OverlayTrigger>
                        ) : (
                          <OverlayTrigger
                            overlay={
                              <Tooltip id="tooltip-resend">
                                Genarate report
                              </Tooltip>
                            }
                          >
                            <span className="tableborder-right btn btn-sm my-1">
                              <i className={"fa-solid fa-ban not-allowed"}></i>
                            </span>
                          </OverlayTrigger>
                        )}

                        {/* <OverlayTrigger
                          overlay={
                            <Tooltip id="tooltip-delete">Enable</Tooltip>
                          }
                        >
                          <span className="tableborder-right">
                            <button
                              className="btn btn-sm py-0 my-1 "
                              // onClick={() => handleDelete(vendors?.id)}
                            >
                              <i className="fa-solid fa-user-check"></i>
                            </button>
                          </span>
                        </OverlayTrigger> */}
                        <OverlayTrigger
                          overlay={
                            <Tooltip id="tooltip-delete">Delete</Tooltip>
                          }
                        >
                          <button
                            className="btn btn-sm py-0  "
                            onClick={() => handleShowDelete(vendors?.id)}
                          >
                            <i className="fa-solid fa-trash text-danger "></i>
                          </button>
                        </OverlayTrigger>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="text-center">
                    No Data Available...
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* ----------------edit-off-canvas-------------------------- */}

          {/* <Modal
            show={showModalResend}
            onHide={() => setShowModalResend(false)}
            backdrop="static"
            centered
          >
            <Modal.Body>Are you sure you want to resend the invite?</Modal.Body>
            <div className="d-flex justify-content-center p-2">
              <Button
                variant="secondary"
                onClick={() => setShowModalResend(false)}
                className="me-2"
              >
                Cancel
              </Button>
              <Button variant="success" onClick={handleConfirm}>
                Invite
              </Button>
            </div>
          </Modal> */}

          {/*  Warning message for invite Link */}
          <Modal
            show={showModalResend}
            onHide={() => setShowModalResend(false)}
            centered
          >
            <Modal.Body className="p-4">
              <div className="text-center">
                <div className="mb-3">
                  <div className="warning1-icon-wrapper">
                    <i className="fa-solid text-muted fa-repeat"></i>
                  </div>
                </div>
                <h5 className="fw-bold mb-2 text-muted">Resend Invitation</h5>
                <p className="mb-2">
                  Are you sure you want to <b>" resend the invitation "</b> link
                  to this vendor?
                </p>
              </div>
            </Modal.Body>
            <div className="d-flex justify-content-center mb-3 gap-4">
              <Button
                onClick={() => setShowModalResend(false)}
                className="bg-transparent border-1 text-dark px-4"
                style={{ borderColor: "#cccc" }}
              >
                No, Keep it
              </Button>
              <Button
                variant="warning"
                onClick={handleConfirm}
                className="px-4"
              >
                Resend Link
              </Button>
            </div>
          </Modal>

          {/* <Modal show={showDelete} onHide={handleCloseDelete} centered>
            <Modal.Body>
              <div className="text-center">
                Do you want to remove this vendor
              </div>
            </Modal.Body>
            <div className="d-flex justify-content-center mb-3">
              <Button
                variant="secondary"
                onClick={handleCloseDelete}
                className="me-2"
              >
                Close
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </Modal> */}

          {/* delete Modal ui */}

          <Modal show={showDelete} onHide={handleCloseDelete} centered>
            <Modal.Body className="p-4">
              <div className="text-center">
                <div className="mb-3">
                  <div className="warning-icon-wrapper">
                    <i className="fa-solid text-danger fa-triangle-exclamation"></i>
                  </div>
                </div>
                <h5 className="fw-bold mb-2 text-muted">Delete Evidence</h5>
                <p className="mb-2">
                  You're going to <span className="fw-bold">"Delete this"</span>{" "}
                  evidence. Are you sure?{" "}
                </p>
              </div>
              <div className="d-flex justify-content-center mb-3 gap-4">
                <Button
                  onClick={handleCloseDelete}
                  className="bg-light border-1 text-dark px-4"
                  style={{ borderColor: "#cccc" }}
                >
                  No, Keep it
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDelete}
                  className="px-4"
                >
                  Yes, Delete!
                </Button>
              </div>
            </Modal.Body>
          </Modal>

          {/* <Offcanvas
            show={show}
            onHide={handleClose}
            backdrop="static"
            placement="end"
            style={{ width: "50%" }}
          >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title>Edit vendor</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <form>
                <div className="row mb-3">
                  <div className="col-md-6 mb-3">
                    <label className="mb-2">
                      Business Name<span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="mb-2">
                      Contact Name<span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="mb-2">
                      Contact Email<span className="text-danger">*</span>
                    </label>
                    <input
                      disabled
                      type="email"
                      className="form-control"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6 countycode-select mb-3">
                    <label className="mb-2">
                      Contact Phone<span className="text-danger">*</span>
                    </label>
                    <PhoneInput
                      defaultCountry="in"
                      value={phone}
                      onChange={(phone) => setPhone(phone)}
                      className="w-100"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="mb-2">
                      Address<span className="text-danger">*</span>
                    </label>
                    <textarea
                      className="form-control"
                      rows="1"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="mb-2">
                      City<span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="mb-2">
                      Country<span className="text-danger">*</span>
                    </label>
                    <Select
                      options={options}
                      value={country}
                      onChange={changeHandler}
                    />
                  </div>
                  <div className="col-md-6 mb-3 d-grid date-select-vendor">
                    <label className="mb-2">
                      Contract Expiry<span className="text-danger">*</span>
                    </label>
                    <DatePicker
                      selected={contractExpiry}
                      onChange={(date) => {
                        const formattedDate = date.toISOString().split("T")[0];
                        setContractExpiry(formattedDate);
                      }}
                      dateFormat="dd/MM/yyyy"
                    />
                  </div>
                </div>

               
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="mb-2">
                      Services Offered<span className="text-danger">*</span>
                    </label>
                    <Select
                      isMulti
                      name="service_names"
                      options={service_names.map((name) => ({
                        value: name,
                        label: name,
                      }))}
                      value={selectedServices}
                      onChange={setSelectedServices}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="mb-2">
                      Type<span className="text-danger">*</span>
                    </label>
                    <Select
                      isMulti
                      name="Service_type"
                      // options={Object.entries(service_types).map(
                      //   ([key, value]) => ({
                      //     value: key,
                      //     label: value,
                      //   })
                      // )}
                      value={selectedType}
                      onChange={setSelectedType}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="mb-2">
                      Category<span className="text-danger">*</span>
                    </label>
                    <Select
                      isMulti
                      name="service_category"
                      options={Object.entries(service_categories).map(
                        ([key, value]) => ({
                          value: key,
                          label: value,
                        })
                      )}
                      className="basic-multi-select"
                      classNamePrefix="select"
                      value={selectedCategory}
                      onChange={setSelectedCategory}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="mb-2">
                      Location<span className="text-danger">*</span>
                    </label>
                    <Select
                      options={Object.entries(service_locations).map(
                        ([key, value]) => ({
                          value: key,
                          label: value,
                        })
                      )}
                      value={selectedLocation}
                      onChange={setSelectedLocation}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="mb-2">
                      SOC Compliant<span className="text-danger">*</span>
                    </label>
                    <Select
                      options={service_compliant.map((value) => ({
                        value: value,
                        label: value,
                      }))}
                      value={selectedCompliantType}
                      onChange={setSelectedCompliantType}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="mb-2">
                      Data Access<span className="text-danger">*</span>
                    </label>
                    <Select
                      disabled={true}
                      // options={selectedDataAccess}
                      value={selectedDataAccess}
                      onChange={setSelectedDataAccess}
                    />
                  </div>
                </div>
              

                <div className="d-flex justify-content-end my-3">
                  <button
                    className="btn primary-btn"
                    type="submit"
                    onClick={handleSubmit}
                  >
                    Update
                  </button>
                </div>
              </form>
            </Offcanvas.Body>
          </Offcanvas> */}

          {/* Incause of no question move to add question page  */}

          {/* <Modal show={showModal} onHide={handleCloseModal} centered>
            <Modal.Body>
              <div className="text-center">
                You don't have questions. Please upload questions.
              </div>
            </Modal.Body>
            <div className="d-flex justify-content-center mb-3">
              <Button
                variant="secondary"
                onClick={handleCloseModal}
                className="me-2"
              >
                Close
              </Button>
              <Button variant="success" onClick={handleGoToQuestionPage}>
                Go to Question Page
              </Button>
            </div>
          </Modal> */}

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
                Go to Question Page{" "}
                <i className="fa-solid fa-arrow-right ms-1"></i>
              </Button>
            </div>
          </Modal>

          {/* <Modal
            show={showmodaltable}
            onHide={handleClose}
            backdrop="static"
            keyboard={false}
            style={{ alignItems: "baseline" }}
          >
            <Modal.Header closeButton>
              <Modal.Title>
                <div className="create-vendormodel ">
                  <h4 className="mb-1">Create a Vendor</h4>
                  <p className="mb-1">
                    Complete the following forms to create a vendor
                  </p>
                </div>
              </Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <p>text</p>
            </Modal.Body>
          </Modal> */}
          <Modal
            show={showmodaltable}
            onHide={handleClosetable}
            backdrop="static"
            keyboard={false}
            size="xl"
            style={{ alignItems: "baseline" }}
            centered
          >
            <Modal.Header closeButton className="border-0 shadow-sm mb-3">
              <Modal.Title>
                <div className="create-vendormodel ">
                  <h6 className="fw-bold mb-0">
                    {" "}
                    <i className="fa-solid fa-list me-1"> </i> Listed Vendors
                  </h6>
                </div>
              </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ minHeight: "500px" }}>
              <ListedVendor GetVendors={GetVendors} />
            </Modal.Body>
          </Modal>

          {/* Add Vendor Modal */}
          <Modal
            show={addVendorShow}
            onHide={handleCloseAddVendor}
            backdrop="static"
            keyboard={false}
            size="lg"
            style={{ alignItems: "baseline" }}
            centered
          >
            <Modal.Header closeButton className="border-0 shadow-sm mb-3">
              <Modal.Title>
                <div className="create-vendormodel ">
                  <h6 className="fw-bold mb-0">
                    {" "}
                    <i className="fa-solid fa-user-plus me-1"> </i> Create
                    Vendor
                  </h6>
                </div>
              </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ minHeight: "500px" }}>
              <AddVendor
                handleCloseAddVendor={handleCloseAddVendor}
                GetVendors={GetVendors}
              />
            </Modal.Body>
          </Modal>
          {/* ----------------edit-off-canvas-ended-------------------------- */}
        </div>
      </div>
      {/* <div className="float-end me-5 pe-3">
        <Pagination
          dataFetchFunction={GetVendors}
          dataPaginationLinks={meta}
        />
      </div> */}
      <div className="d-flex flex-row bd-highlight mb-3 ">
        <div className=" bd-highlight pagennation-list">
          <LimitSelector
            onLimitChange={handleLimitChange}
            filteredLength={filteredLength}
          />
        </div>
        <div className="p-2 bd-highlight w-100">
          <Pagination
            dataFetchFunction={GetVendors}
            // dataPaginationLinks={meta}
            dataPaginationLinks={pageIndex?.meta}
            filteredLength={filteredLength}
            search={searchVal}
            sort_by={sortColumn}
            sort_direction={sortDirection}
            limit={limit}
          />
        </div>
      </div>

      {/* <div className="vendor-list-wrapper outer-wapper position-relative">
        <div className="vendor-list ">
          <div className="vendor-list-header d-flex flex-wrap gap-2 justify-content-between">
            <div className="list-header-left d-flex flex-wrap gap-2">
              <h5 className="list-header-title mb-0 fw-bold">
                Vendor List users
              </h5>
              <div className="list-header-process badge-success">
                <div>
                  <i className="fa-solid fa-address-card  me-1"></i>
                  <span>ARNVDR02</span>
                </div>
              </div>
              <div className="list-header-process badge-waring">
                <div>
                  <i className="fa-solid fa-clock me-1"></i>
                  <span>In progress</span>
                </div>
              </div>
            </div>
            <div className="list-header-right d-flex gap-lg-3 gap-2 flex-wrap">
              <div className="header-right-data">
                <div>
                  <span className="lable-text d-none d-md-inline-block">
                    Data access:{" "}
                  </span>
                  <span className="badge-high text-captalize">High</span>
                </div>
              </div>
              <div className="header-right-risk">
                <div>
                  <span className="lable-text d-none d-md-inline-block">
                    Risk:{" "}
                  </span>
                  <span className="badge-critical">
                    {" "}
                    <span className="small-circle"></span> Critical
                  </span>
                </div>
              </div>
              <div className="header-right-dots">
                <div
                  className={`dots-icon  ${isModalOpen ? "blur-effect" : ""}`}
                  onClick={handleCardClick}
                  style={{
                    cursor: "pointer",
                    transition: "filter 0.3s ease",
                    position: "relative",
                  }}
                >
                  <i className="fa-solid fa-ellipsis-vertical"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="vendor-list-body  mt-3">
            <div className="d-flex gap-3  flex-wrap justify-content-between outer-sub-wapper">
              <div className="list-details d-flex gap-lg-4 gap-3 flex-wrap gap-xxl-5 flex-fill  ">
                <div>
                  <label>Name</label>
                  <p className="text-capitalize fw-bold">arul Manikandan </p>
                </div>
                <div>
                  <label>Email</label>
                  <p className="fw-bold email-text-wrap">arul.m@sq1.security</p>
                </div>
                <div>
                  <label>Phone</label>
                  <p className="fw-bold">+917094589658</p>
                </div>
                <div>
                  <label>Initated on</label>
                  <p className="text-capitalize">14 sep, 2025</p>
                </div>
                <div>
                  <label>Started on</label>
                  <p className="text-capitalize">15 sep, 2025</p>
                </div>
                <div>
                  <label>Completed on</label>
                  <p className="text-capitalize">26 feb, 2026</p>
                </div>
              </div>
              <div className="list-button">
                <button type="button" className="btn primary-btn py-2">
                  {" "}
                  View Assessment{" "}
                  <i className="fa-solid fa-arrow-right ms-1"></i>
                </button>
              </div>
            </div>
          </div>
          {isModalOpen && (
            <div className="plicy-modal-overlay rounded-4">
              <div className="card p-4 rounded-4 policy-card02">
                <button onClick={handleCloseModals} className="close-btn">
                  <i className="fa-solid fa-xmark"></i>
                </button>
                <div>
                  <h4 className="mb-3 text-center">Actions</h4>
                  <div className="d-flex justify-content-center">
                    <Link to={`/vendors/assessment-view/{vendors?.id}`}>
                      <button
                        className="btn btn-sm my-1 policy-buttons"
                        // onClick={() => handleView(vendors?.id)}
                      >
                        <i className="fa-regular fa-eye"></i> View
                      </button>
                    </Link>
                    <button className="policy-buttons">Logs</button>
                    <button className="policy-buttons">Queries</button>
                    <button className="policy-buttons">Review</button>
                    <button className="policy-buttons">Retire</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div> */}
    </div>
  );
};

export default Vendor;
