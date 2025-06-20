import { useEffect, useMemo, useState } from "react";
import "react-circular-progressbar/dist/styles.css";
import { useNavigate, Link } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { toArray } from "lodash";
import { getApi, postApi } from "../../../../services/apiService";
import Pagination from "../../../../components/Pagination/Pagination";
import Searchbar from "../../../../components/Search/Searchbar";
import EditVendor from "../../../../components/Modal/EditVendor";
import AddVendor from "../../../../components/Modal/AddVendor";
import ListedVendor from "../../../../components/Modal/ListedVendor";
import { ucFirst } from "../../../../utils/UtilsGlobalData";
import {
  createDebouncedSearch,
  fetchSearchResults,
  LimitSelector,
} from "../../../../components/Search/useSearchAndSort";
import {
  BanIcon,
  BanIconNotallowed,
  CheckIcon,
  ClockIcon,
  DownloadIcon,
  EllipsisverticalIcon,
  ListIcon,
  MutedrepeatIcon,
  PlusIcon,
  RegulareyeIcon,
  RepeatIcon,
  RightarrowIcon,
  TrashIcon,
  TriangleExclamationIcon,
  UserplusIcon,
  XmarkIcon,
} from "../../../../components/Icons/Icons";

const VendorStartDate = ({ date }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const dateObj = new Date(dateStr);
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(dateObj);
  };

  return <span>{formatDate(date)}</span>;
};

const VendorSkeleton = () => (
  <div className="vendor-list-wrapper outer-wapper position-relative mb-3">
    <div className="vendor-list">
      <div className="vendor-list-header d-flex flex-wrap gap-2 justify-content-between">
        <div className="list-header-left d-flex flex-wrap gap-2">
          <div className="placeholder-glow">
            <p
              className="placeholder bg-secondary rounded  mb-0"
              style={{ width: "300px", height: "25px" }}
            ></p>
          </div>
        </div>

        <div className="list-header-right d-flex gap-lg-3 gap-2 flex-wrap">
          <div className="header-right-data">
            <div
              className="placeholder bg-secondary rounded w-100"
              style={{ width: "50px", height: "20px" }}
            ></div>
          </div>
          <div className="header-right-risk">
            <div
              className="placeholder bg-secondary rounded"
              style={{ width: "50px", height: "25px" }}
            ></div>
          </div>
          <div className="header-right-dots">
            <div
              className="placeholder bg-secondary rounded"
              style={{ width: "54px", height: "25px" }}
            ></div>
          </div>
          <div className="header-right-dots">
            <div
              className="placeholder bg-secondary rounded"
              style={{ width: "25px", height: "25px" }}
            ></div>
          </div>
        </div>
      </div>

      <div className="vendor-list-body mt-3">
        <div className="d-flex gap-3 flex-wrap justify-content-between  outer-sub-wapper">
          <div className="list-details d-flex gap-lg-4 gap-3 flex-wrap gap-xxl-5 flex-fill">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div className="d-flex flex-column" key={idx}>
                <div>
                  <label
                    className="placeholder bg-secondary rounded"
                    style={{ width: "50px", height: "16px" }}
                  ></label>
                </div>
                <p
                  className="placeholder bg-secondary rounded "
                  style={{ width: "120px", height: "16px" }}
                ></p>
              </div>
            ))}
          </div>
          <div className="list-button">
            <button
              type="button"
              className="btn primary-btn py-2 px-4 placeholder bg-secondary"
              style={{ width: "150px" }}
            ></button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const VendorNew = () => {
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
  const [openVendorId, setOpenVendorId] = useState(null);
  const [isresponse, setIsResponse] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState(null);

  const handleButtonClick = () => {
    if (!questionCount || questionCount.length === 0) {
      setShowModal(true);
    } else {
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
    } catch (err) {
      console.error("Error fetching questions:", err);
    }
  };

  const GetVendors = async (URI = "/vendor/vendor-list") => {
    try {
      setIsLoading(true);
      const response = await getApi(URI);
      setFilteredUsers(response?.data?.data?.data);
      setFilteredLength(response?.data?.data?.meta?.total);
      setMeta(response?.data?.data?.meta);
      setPageIndex(response?.data?.data);
    } catch (error) {
      console.error("Error fetching vendors:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsResponse(true);
    try {
      if (!userIdToDelete) return;
      await postApi(`/vendor/vendor-delete/${userIdToDelete}`);
      GetVendors();
      handleCloseDelete();
    } catch (error) {
    } finally {
      setIsResponse(false);
    }
  };

  const handleResend = async (id) => {
    try {
      await postApi(`/vendor/vendor-resend-invite/${id}`);
      GetVendors();
      handleCloseModals();
    } catch (error) {
      console.error("Error resending invite:", error);
    } finally {
      setIsResponse(false);
      setShowModalResend(false);
    }
  };

  const handleResendClick = (id) => {
    setSelectedVendorId(id);
    setShowModalResend(true);
  };

  const handleConfirm = () => {
    if (selectedVendorId) {
      setIsResponse(true);
      handleResend(selectedVendorId);
    }
  };

  useEffect(() => {
    GetVendors();
  }, []);

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
    } catch (error) {
      console.error("Error fetching services:", error);
    }
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
      handleCloseModals();
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

  const handleCardClick = (vendorId) => {
    setOpenVendorId((prevId) => (prevId === vendorId ? null : vendorId));
  };

  const handleCloseModals = (e) => {
    setOpenVendorId(null);
  };

  const VendorSkeletonCount = 4;
  const vendorLazyLoading = Array.from({ length: VendorSkeletonCount });

  return (
    <div>
      <div className="d-flex justify-content-between mb-3 flex-wrap">
        <h5 className="p-2 mb-0">
          Vendors
          {meta?.total !== 0 ? (
            <span className="badge user-active text-white">{meta?.total}</span>
          ) : (
            ""
          )}
        </h5>
        <div className="d-flex">
          <Searchbar onSearch={handleSearch} placeHolder={"Search..."} />

          <button className="btn  ms-2 primary-btn " onClick={handleShowtable}>
            <PlusIcon className="me-1" /> Pre Approved
          </button>

          <button
            className="btn  ms-2 primary-btn "
            onClick={handleButtonClick}
          >
            <PlusIcon className="me-1" /> Create Vendor
          </button>
        </div>
      </div>

      <div>
        {isLoading ? (
          <>
            {vendorLazyLoading.map((item, index) => (
              <VendorSkeleton key={index} />
            ))}
          </>
        ) : filteredUsers?.length > 0 ? (
          filteredUsers?.map((vendors, index) => (
            <>
              <div
                className="vendor-list-wrapper outer-wapper position-relative mb-2 "
                key={vendors?.id || index}
              >
                <div className="vendor-list ">
                  <div className="vendor-list-header d-flex flex-wrap gap-2 justify-content-between">
                    <div className="list-header-left d-flex flex-wrap gap-2">
                      <h6 className="list-header-title mb-0 fw-bold">
                        {ucFirst(vendors?.business_name)}
                      </h6>
                    </div>
                    <div className="list-header-right d-flex gap-lg-3 gap-2 flex-wrap">
                      <div className="header-right-data">
                        <div
                          className={` list-header-process ${
                            vendors.status === "active"
                              ? "badge-active"
                              : vendors.status === "invited"
                              ? " badge-invite"
                              : "badge-invite"
                          }`}
                        >
                          <div>
                            <span
                              className={`${
                                vendors.status === "active"
                                  ? " small-circle-success"
                                  : vendors.status === "invited"
                                  ? " small-circle-invite"
                                  : "small-circle-invite"
                              }`}
                            ></span>
                            <span>
                              {ucFirst(vendors?.status?.replace("-", " "))}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="header-right-risk">
                        <div
                          className={`list-header-process Capitalize  ${
                            vendors.assessment_status === "in-progress"
                              ? " badge-waring"
                              : vendors.assessment_status === "completed"
                              ? "badge-success2"
                              : "badge-asigned"
                          }`}
                        >
                          <div>
                            {vendors.assessment_status === "completed" ? (
                              <CheckIcon className="me-1" />
                            ) : (
                              <ClockIcon className="me-1" />
                            )}

                            <span>
                              {vendors?.type === "pre_approved_vendor" &&
                              vendors?.assessment_status.toLowerCase() ===
                                "completed"
                                ? "Pre Approved"
                                : ucFirst(
                                    vendors?.assessment_status?.replace(
                                      "-",
                                      " "
                                    )
                                  )}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="header-right-dots">
                        <div
                          className={`dots-icon  ${
                            openVendorId === vendors.id ? "blur-effect" : ""
                          }`}
                          onClick={() => handleCardClick(vendors.id)}
                          style={{
                            cursor: "pointer",
                            transition: "filter 0.3s ease",
                            position: "relative",
                          }}
                        >
                          <EllipsisverticalIcon />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="vendor-list-body  mt-2">
                    <div className="d-flex gap-3  flex-wrap justify-content-between outer-sub-wapper">
                      <div className="list-details d-flex gap-lg-4 gap-3 flex-wrap gap-xxl-5 flex-fill  ">
                        <div>
                          <label>Name</label>
                          {toArray(vendors?.name).length > 0 ? (
                            <p className="text-capitalize ">{vendors?.name}</p>
                          ) : (
                            <p
                              className="text-capitalize text-muted fs-6"
                              style={{ minWidth: "50px" }}
                            >
                              -
                            </p>
                          )}
                        </div>
                        <div>
                          <label>Email</label>
                          {toArray(vendors?.name).length > 0 ? (
                            <p className=" email-text-wrap">{vendors?.email}</p>
                          ) : (
                            <p
                              className="text-capitalize text-muted fs-6"
                              style={{ minWidth: "80px" }}
                            >
                              -
                            </p>
                          )}
                        </div>
                        <div>
                          <label>Phone</label>
                          {toArray(vendors?.name).length > 0 ? (
                            <p className="">{vendors?.contact_phone}</p>
                          ) : (
                            <p
                              className="text-capitalize text-muted fs-6"
                              style={{ minWidth: "60px" }}
                            >
                              -
                            </p>
                          )}
                        </div>
                        <div>
                          <label>Service Name</label>
                          {toArray(vendors?.service_name).length > 0 ? (
                            <p className="">
                              {vendors?.service_name?.length > 0 && (
                                <>
                                  {/* Always show first 2 items */}
                                  <span className="badge-success d-inline me-2">
                                    {vendors.service_name[0]}
                                  </span>
                                  {vendors.service_name.length > 1 && (
                                    <span className="badge-success d-inline me-2">
                                      {vendors.service_name[1]}
                                    </span>
                                  )}
                                  {vendors.service_name.length > 2 && (
                                    <span className="badge-success d-inline">
                                      ...
                                    </span>
                                  )}
                                </>
                              )}
                            </p>
                          ) : (
                            <p
                              className="text-capitalize text-muted fs-6"
                              style={{ minWidth: "60px" }}
                            >
                              -
                            </p>
                          )}
                        </div>
                        <div>
                          <label>Country</label>
                          {toArray(vendors?.country).length > 0 ? (
                            <p className="">{vendors?.country}</p>
                          ) : (
                            <p
                              className="text-capitalize text-muted fs-6"
                              style={{ minWidth: "60px" }}
                            >
                              -
                            </p>
                          )}
                        </div>
                        <div>
                          <label>City</label>
                          {toArray(vendors?.city).length > 0 ? (
                            <p className="">{vendors?.city}</p>
                          ) : (
                            <p
                              className="text-capitalize text-muted fs-6"
                              style={{ minWidth: "60px" }}
                            >
                              -
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="list-button">
                        <Link to={`/vendors/assessment-view/${vendors?.id}`}>
                          <button
                            type="button"
                            className="btn primary-btn py-2"
                          >
                            View Assessment
                            <RightarrowIcon className="ms-1" />
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                  {openVendorId === vendors.id && (
                    <div className="policy-modal-overlay rounded-3 vendor-modal">
                      <div className="row">
                        <div
                          className="card rounded-3 p-0 policy-card02"
                          style={{ width: "100%" }}
                        >
                          <div className="col-12 d-flex flex-wrap justify-content-between align-items-center shadow-sm p-2">
                            <h6 className="fw-bold flex-fill text-center mb-0">
                              Actions
                            </h6>
                            <button
                              onClick={handleCloseModals}
                              className="close-btn2 bg-white"
                            >
                              <XmarkIcon />
                            </button>
                          </div>
                          <div className="col-12 d-flex flex-wrap flex-lg-nowrap gap-2 align-items-center justify-content-center p-4">
                            <Link
                              to={`/vendors/assessment-view/${vendors?.id}`}
                            >
                              <button className="btn btn-sm my-1 policy-buttons">
                                <RegulareyeIcon className="me-1" /> View
                              </button>
                            </Link>

                            {vendors?.type === "pre_approved_vendor" ? (
                              <button
                                disabled={true}
                                className="btn btn-sm my-1 policy-buttons"
                              >
                                <i className="fa-regular fa-edit me-1 "></i>
                                Edit
                              </button>
                            ) : (
                              <EditVendor
                                Vendordata={vendors}
                                GetVendors={GetVendors}
                                areaType={"vendorEdit"}
                                handleCloseModals={handleCloseModals}
                              />
                            )}

                            {vendors?.status === "invited" ||
                            vendors?.status === "resent_invited" ? (
                              <button
                                className="btn btn-sm my-1 policy-buttons"
                                onClick={() => handleResendClick(vendors?.id)}
                              >
                                <RepeatIcon className="me-1" />
                                Resend
                              </button>
                            ) : (
                              <button
                                className="btn btn-sm my-1 policy-buttons not-allowed"
                                disabled={true}
                              >
                                <BanIcon className="me-1" />
                                Resend
                              </button>
                            )}

                            {vendors?.assessment_status === "completed" ? (
                              <button
                                className="btn btn-sm my-1 policy-buttons"
                                onClick={() => Getreport(vendors?.id)}
                              >
                                <DownloadIcon className="me-1" />
                                Report
                              </button>
                            ) : (
                              <button
                                className="btn btn-sm my-1 policy-buttons"
                                disabled={true}
                              >
                                <BanIconNotallowed className="me-1" />
                                Report
                              </button>
                            )}

                            <button
                              className="btn btn-sm my-1  btn-outline-danger"
                              onClick={() => handleShowDelete(vendors?.id)}
                            >
                              <TrashIcon className="me-1" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ))
        ) : (
          <div className="text-center align-items-center w-100 bg-white h-100">
            <img
              src="https://img.freepik.com/premium-vector/no-data-found_585024-42.jpg"
              style={{
                width: "500px",
                objectFit: "contain",
              }}
              alt=""
            />
          </div>
        )}
      </div>

      <div>
        <div className=" custom-table tabledata-scroll-second mb-3">
          {/* ----------------------------------------------------------------------- modul start ------------------------------------------------------------------------ */}

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
                    <MutedrepeatIcon />
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
                {isresponse === true ? (
                  <div
                    className="spinner-border p-0 text-white spinner-border-sm"
                    role="status"
                  ></div>
                ) : (
                  "Resend Link"
                )}
              </Button>
            </div>
          </Modal>

          <Modal show={showDelete} onHide={handleCloseDelete} centered>
            <Modal.Body className="p-4">
              <div className="text-center">
                <div className="mb-3">
                  <div className="warning-icon-wrapper">
                    <TriangleExclamationIcon />
                  </div>
                </div>
                <h5 className="fw-bold mb-2 text-muted">Delete Vendor</h5>
                <p className="mb-2">
                  You're going to <span className="fw-bold">"Delete this"</span>
                  Vendor. Are you sure?
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
                  {isresponse === true ? (
                    <div
                      className="spinner-border text-white spinner-border-sm"
                      role="status"
                    ></div>
                  ) : (
                    "Yes, Delete!"
                  )}
                </Button>
              </div>
            </Modal.Body>
          </Modal>

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
                Go to Question Page
                <RightarrowIcon className="ms-1" />
              </Button>
            </div>
          </Modal>

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
                    <ListIcon className="me-1" />
                    Listed Vendors
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
                    <UserplusIcon className="me-1" />
                    Create Vendor
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
      {/* ------------------------------------ pagination start ----------------------------------------- */}
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
            dataPaginationLinks={pageIndex?.meta}
            filteredLength={filteredLength}
            search={searchVal}
            sort_by={sortColumn}
            sort_direction={sortDirection}
            limit={limit}
          />
        </div>
      </div>
    </div>
  );
};

export default VendorNew;
