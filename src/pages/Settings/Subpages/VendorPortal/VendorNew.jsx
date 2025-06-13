import { useEffect, useMemo, useState } from "react";
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
import {
  BanIconNotallowed,
  RepeatIcon,
  TrashIcon,
  TriangleExclamationIcon,
} from "../../../../components/Icons/Icons";

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
  const [showDelete, setShowDelete] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState(null);
  const handleClosetable = () => setShowmodaltable(false);
  const handleShowtable = () => setShowmodaltable(true);
  const [addVendorShow, setaddVendorShow] = useState(false);
  const handleCloseAddVendor = () => setaddVendorShow(false);
  const handleShowAddVendor = () => setaddVendorShow(true);

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
      console.error(error);
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
          Vendors
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
              ) : filteredUsers?.length > 0 ? (
                filteredUsers?.map((vendors, index) => (
                  <tr key={vendors?.id || index}>
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
                      <span
                        className={`badge badge-fixedwidth Capitalize  ${
                          vendors.status === "active"
                            ? " user-active"
                            : vendors.assessment_status === "in-progress"
                            ? "bg-warning"
                            : "bg-secondary"
                        }`}
                      >
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
                            <button className="btn btn-sm my-1 tableborder-right">
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
                                <BanIconNotallowed />
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
                                <RepeatIcon />
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
                                <BanIconNotallowed />
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
                              <BanIconNotallowed />
                            </span>
                          </OverlayTrigger>
                        )}

                        <OverlayTrigger
                          overlay={
                            <Tooltip id="tooltip-delete">Delete</Tooltip>
                          }
                        >
                          <button
                            className="btn btn-sm py-0  "
                            onClick={() => handleShowDelete(vendors?.id)}
                          >
                            <TrashIcon />
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

          {/* delete Modal ui */}

          <Modal show={showDelete} onHide={handleCloseDelete} centered>
            <Modal.Body className="p-4">
              <div className="text-center">
                <div className="mb-3">
                  <div className="warning-icon-wrapper">
                    <TriangleExclamationIcon />
                  </div>
                </div>
                <h5 className="fw-bold mb-2 text-muted">Delete Evidence</h5>
                <p className="mb-2">
                  You're going to <span className="fw-bold">"Delete this"</span>
                  evidence. Are you sure?
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
                <i className="fa-solid fa-arrow-right ms-1"></i>
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
        </div>
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

export default Vendor;
