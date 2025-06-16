import { useMemo, useRef } from "react";
import { Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import JoditEditor from "jodit-react";
import Offcanvas from "react-bootstrap/Offcanvas";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useState, useEffect } from "react";
import Searchbar from "../../../../components/Search/Searchbar";
import { getApi, postApi } from "../../../../services/apiService";
import Pagination from "../../../../components/Pagination/Pagination";
import AddPolicyTemplate from "../../../../components/Modal/AddPolicyTemplate";
import {
  createDebouncedSearch,
  fetchSearchResults,
  highlightText,
} from "../../../../components/Search/useSearchAndSort";
import {
  PenToSquareIcon,
  TrashIcon,
  TriangleExclamationIcon,
} from "../../../../components/Icons/Icons";
import { Loader } from "../../../../components/Table/Loader";

const PolicyTemplate = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [metaData, setMetaData] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [sortColumn, setSortColumn] = useState("type");
  const [sortDirection, setSortDirection] = useState("desc");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [limit, setLimit] = useState(10);
  const [filteredLength, setFilteredLength] = useState([]);
  const [pageIndex, setPageIndex] = useState([]);
  const [show, setShow] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const DESCRIPTION_MAX_LENGTH = 50;
  const COLUMN_WIDTH = "200px";
  const [showEdit, setShowEdit] = useState(false);
  const editor = useRef(null);
  const [policyId, setPolicyId] = useState("");
  const [location, setLocation] = useState("");
  const [stateType, setStateType] = useState("");
  const [initialValues, setInitialValues] = useState({
    title: "",
    category: "",
    description: "",
    select: "",
    content: "",
    pdfContent: "",
  });

  const handleClose = () => {
    setShow(false);
  };

  const handleShow = (id) => {
    setShow(true);
    setDeleteId(id);
  };

  const handleCloseEdit = () => {
    setShowEdit(false);
    setInitialValues({
      title: "",
      category: "",
      description: "",
      select: "",
      content: "",
      pdfContent: "",
    });
  };

  const handleShowEdit = (
    id,
    title,
    category,
    description,
    content,
    type,
    location
  ) => {
    setPolicyId(id);
    setLocation(location);
    if (type === "upload") {
      setStateType(1);
    } else {
      setStateType(0);
    }
    setInitialValues({
      title: title || "",
      category: category || "",
      description: description || "",
      select: type || "",
      content: content || "",
      pdfContent: "",
    });
    setShowEdit(true);
  };

  const GetPolicy = async (URI = "policy/policy-template") => {
    try {
      setIsLoading(true);
      const response = await getApi(URI);
      setMetaData(response?.data?.data?.template?.meta);
      setFilteredUsers(response?.data?.data?.template?.data);
      setFilteredLength(response?.data?.data?.template?.meta.total);
    } catch (err) {
      console.error("error getting a data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    GetPolicy();
  }, []);

  const handleDownload = async (datafile_location) => {
    try {
      const downloadUrl = datafile_location;
      if (!downloadUrl) {
        throw new Error("Download URL is missing in the response.");
      }
      if (downloadUrl.startsWith("http")) {
        window.open(downloadUrl, "_blank");
      } else {
        throw new Error("Invalid URL provided for downloading.");
      }
    } catch (error) {
      console.error("Error downloading the file:", error);
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

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await postApi(`policy/delete-policy-template/${deleteId}`);
      GetPolicy();
      setShow(false);
    } catch (err) {
      console.error("Error in deletepolicytemplate:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedFetchSearchResults = useMemo(
    () =>
      createDebouncedSearch((params) => {
        fetchSearchResults(
          "/policy/policy-template",
          params,
          setFilteredUsers,
          setIsLoading,
          setFilteredLength,
          setPageIndex
        );
      }, 300),
    []
  );

  const truncateText = (text, maxLength) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const toggleDescription = (id) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const useValidation = Yup.object({
    title: Yup.string()
      .min(3, "Title must be at least 3 characters")
      .required("Please Enter Template Title")
      .trim(),
    category: Yup.string()
      .min(3, "Category must be at least 3 characters")
      .required("Please Enter Policy Category")
      .trim(),
    content: Yup.string().when("select", {
      is: (val) => val === "create",
      then: () => Yup.string().required("Please Provide Template Data"),
      otherwise: () => Yup.string().notRequired(),
    }),
    pdfContent: Yup.mixed().when("select", {
      is: (val) => stateType !== 1 && val === "upload",
      then: () => Yup.mixed().required("Please Provide Template PDF"),
      otherwise: () => Yup.mixed().notRequired(),
    }),
  });

  const {
    values,
    handleSubmit,
    handleBlur,
    handleChange,
    setFieldValue,
    touched,
    errors,
  } = useFormik({
    enableReinitialize: true,
    initialValues,
    validationSchema: useValidation,
    onSubmit: async (values) => {
      if (values.select === "create") {
        const payload = {
          title: values.title,
          category: values.category,
          description: values.description,
          template_type: "create",
          [`data_${policyId}`]: values.content,
          type: "save",
        };
        try {
          setIsLoading(true);
          await postApi(`/policy/template/save/docs/${policyId}`, payload);
          setShowEdit(false);
          GetPolicy();
        } catch (error) {
          console.error("error: ", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        const payload = {
          title: values.title,
          category: values.category,
          description: values.description,
          template_type: "upload",
          template_file: values.pdfContent,
          type: "save",
        };
        try {
          setIsLoading(true);
          await postApi(`/policy/template/save/docs/${policyId}`, payload);
          setShowEdit(false);
          GetPolicy();
        } catch (error) {
          console.error("error: ", error);
        } finally {
          setIsLoading(false);
        }
      }
    },
  });

  return (
    <>
      <div className="d-flex justify-content-between mb-3 flex-wrap">
        <h5>
          Policy and Procedures
          {metaData.total > 0 && (
            <span className="badge user-active text-white ms-1">
              {metaData.total}
            </span>
          )}
        </h5>
        <div className="d-flex">
          <Searchbar onSearch={handleSearch} placeHolder={"Search"} />
          <AddPolicyTemplate GetPolicy={GetPolicy} />
        </div>
      </div>
      <div className="tabledata-scroll mb-3">
        <table className="table users-table mb-0">
          <thead className="tablescrolling-thead-tr">
            <tr>
              <th scope="col">#</th>
              <th scope="col">Title</th>
              <th scope="col">Category</th>
              <th scope="col">Description</th>
              <th scope="col" className="text-center">
                Status
              </th>
              <th scope="col" className="text-center">
                Template
              </th>
            </tr>
          </thead>
          <tbody className="tablescrolling-tbody">
            {isLoading ? (
              // Array.from({ length: 3 }).map((_, rowIndex) => (
              //   <tr key={rowIndex}>
              //     {Array.from({ length: 6 }).map((_, colIndex) => (
              //       <td key={colIndex}>
              //         <p className="placeholder-glow">
              //           <span className="placeholder col-12 bg-secondary"></span>
              //         </p>
              //       </td>
              //     ))}
              //   </tr>
              // ))
              <Loader rows={3} cols={6} />
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((item, id) => (
                <tr key={id}>
                  <td>{metaData.current_page * 10 - 10 + id + 1}</td>
                  <td
                    className="Capitalize"
                    dangerouslySetInnerHTML={{
                      __html: highlightText(item?.title || "", searchVal),
                    }}
                  />
                  <td
                    className="Capitalize"
                    dangerouslySetInnerHTML={{
                      __html: highlightText(item?.category || "", searchVal),
                    }}
                  />
                  <td
                    style={{
                      maxWidth: COLUMN_WIDTH,
                      wordWrap: "break-word",
                      overflowWrap: "break-word",
                      whiteSpace: "normal",
                      verticalAlign: "top",
                    }}
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: expandedDescriptions[item?.id || id]
                          ? highlightText(item?.description || "", searchVal)
                          : truncateText(
                              highlightText(item?.description || "", searchVal),
                              DESCRIPTION_MAX_LENGTH
                            ),
                      }}
                    />
                    {item?.description?.length > DESCRIPTION_MAX_LENGTH && (
                      <button
                        className="btn btn-link p-0 mt-1 text-decoration-none"
                        onClick={() => toggleDescription(item?.id || id)}
                        style={{ fontSize: "0.8rem" }}
                      >
                        {expandedDescriptions[item?.id || id]
                          ? "View Less"
                          : "View More"}
                      </button>
                    )}
                  </td>
                  <td className="text-center">
                    <span className="badge user-active p-2">Implemented</span>
                  </td>
                  <td className="table-td-center">
                    <div className="users-crud d-flex">
                      <OverlayTrigger
                        overlay={<Tooltip id="tooltip-disabled">Edit</Tooltip>}
                      >
                        <button
                          className="btn btn-sm py-0 my-1 tableborder-right"
                          type="button"
                          onClick={() =>
                            handleShowEdit(
                              item.id,
                              item.title,
                              item.category,
                              item.description,
                              item.data,
                              item.type,
                              item.file_location
                            )
                          }
                        >
                          <PenToSquareIcon />
                        </button>
                      </OverlayTrigger>
                      <OverlayTrigger
                        overlay={
                          <Tooltip id="tooltip-disabled">Download</Tooltip>
                        }
                      >
                        <button
                          className="btn btn-sm py-0 my-1 tableborder-right"
                          onClick={() => handleDownload(item.file_location)}
                        >
                          <i className="fa-solid fa-cloud-arrow-down text-success"></i>
                        </button>
                      </OverlayTrigger>
                      <OverlayTrigger
                        overlay={
                          <Tooltip id="tooltip-disabled">Delete</Tooltip>
                        }
                      >
                        <button
                          type="button"
                          className="btn btn-sm py-0 my-1"
                          onClick={() => handleShow(item.id)}
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
                <td colSpan="8" className="text-center">
                  No Data Available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="float-end me-5 pe-3">
        <Pagination
          dataFetchFunction={GetPolicy}
          dataPaginationLinks={metaData}
          filteredLength={filteredLength}
          search={searchVal}
          sort_by={sortColumn}
          sort_direction={sortDirection}
          limit={limit}
        />
      </div>
      <Offcanvas show={showEdit} onHide={handleCloseEdit} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Edit Policy Template</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-6">
              <label htmlFor="title" className="form-label">
                Policy Template Title <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                name="title"
                value={values.title}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {touched.title && errors.title && (
                <div className="text-danger Capitalize">{errors.title}</div>
              )}
            </div>
            <div className="col-md-6">
              <label htmlFor="category" className="form-label">
                Policy Category <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                id="category"
                name="category"
                value={values.category}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.category && touched.category && (
                <div className="text-danger Capitalize">{errors.category}</div>
              )}
            </div>
            <div className="col-12">
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                className="form-control"
                id="description"
                name="description"
                rows="3"
                value={values.description}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>
            <div className="col-12">
              <label className="form-label">
                Template Data
                <span className="text-danger">*</span>
              </label>
              <select
                className="form-select"
                aria-label="Default select example"
                id="select"
                value={values.select}
                onChange={handleChange}
                onBlur={handleBlur}
              >
                <option value="create">Edit Policy Template</option>
                <option value="upload">Update Template PDF</option>
              </select>
            </div>
            {values.select === "upload" ? (
              <div className="col-12">
                {errors.pdfContent && touched.pdfContent && (
                  <div className="text-danger">{errors.pdfContent}</div>
                )}
                <input
                  className="styled-file-upload w-100"
                  type="file"
                  id="formFile"
                  accept=".pdf"
                  onChange={(event) =>
                    setFieldValue("pdfContent", event.target.files[0])
                  }
                  onBlur={handleBlur}
                />
              </div>
            ) : (
              <div className="col-12">
                {errors.content && touched.content && (
                  <div className="text-danger">{errors.content}</div>
                )}
                <JoditEditor
                  ref={editor}
                  value={values.content}
                  onChange={(newContent) =>
                    setFieldValue("content", newContent)
                  }
                  onBlur={handleBlur}
                />
              </div>
            )}
            <div className="d-flex justify-content-end">
              {values.select === "upload" && (
                <span
                  className="primary-btn me-2"
                  onClick={() => handleDownload(location)}
                >
                  <i className="fa-solid fa-file-pdf"></i>
                </span>
              )}
              <button type="submit" className="btn primary-btn me-1">
                {isLoading ? (
                  <div
                    className="spinner-border p-0 text-white spinner-border-sm"
                    role="status"
                  ></div>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </Offcanvas.Body>
      </Offcanvas>
      <Modal show={show} onHide={handleClose} backdrop="static" centered>
        <Modal.Body className="p-4">
          <div className="text-center">
            <div className="mb-3">
              <div className="warning-icon-wrapper">
                <TriangleExclamationIcon />
              </div>
            </div>
            <h5 className="fw-bold mb-2 text-muted">Delete Policy Template</h5>
            <p className="mb-2">
              You're going to <span className="fw-bold">"Delete this"</span>
              Policy Template. Are you sure?
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer className="justify-content-center border-0 m-0 p-2">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleClose}
          >
            No, Keep it
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleDelete}
          >
            {isLoading ? (
              <div
                className="spinner-border p-0 text-white spinner-border-sm"
                role="status"
              ></div>
            ) : (
              "Yes, Delete!"
            )}
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PolicyTemplate;
