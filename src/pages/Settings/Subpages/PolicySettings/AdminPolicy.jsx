import { useMemo, useRef } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import JoditEditor from "jodit-react";
import { useState, useEffect } from "react";
import Offcanvas from "react-bootstrap/Offcanvas";
import Searchbar from "../../../../components/Search/Searchbar";
import { getApi, postApi } from "../../../../services/apiService";
import Pagination from "../../../../components/Pagination/Pagination";
import {
  createDebouncedSearch,
  fetchSearchResults,
  highlightText,
} from "../../../../components/Search/useSearchAndSort";
import { PenToSquareIcon } from "../../../../components/Icons/Icons";

const AdminPolicy = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [metaData, setMetaData] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [sortColumn, setSortColumn] = useState("type");
  const [sortDirection, setSortDirection] = useState("desc");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [limit, setLimit] = useState(10);
  const [filteredLength, setFilteredLength] = useState([]);
  const [pageIndex, setPageIndex] = useState([]);
  const editor = useRef(null);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [showEdit, setShowEdit] = useState(false);
  const [policyId, setPolicyId] = useState("");
  const [adminEditVal, setAdminEditVal] = useState("");
  const [veiwPdf, setveiwPdf] = useState("");

  const handleCloseEdit = () => {
    setShowEdit(false);
    setAdminEditVal(0);
  };

  const handleShowEdit = (id, title, content, location) => {
    setShowEdit(true);
    setTitle(title);
    setPolicyId(id);
    setContent(content);
    setveiwPdf(location);
  };

  const GetPolicy = async (URI = "policy/admin-policy") => {
    try {
      setIsLoading(true);
      const response = await getApi(URI);
      setMetaData(response?.data?.data?.policy?.meta);
      setFilteredUsers(response?.data?.data?.policy?.data);
      setFilteredLength(response?.data?.data?.policy?.meta.total);
    } catch(err) {
      console.error("error getting a data",err);
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

  function adminEdit() {
    setAdminEditVal(1);
  }

  function adminReturn() {
    setAdminEditVal(0);
    setContent("");
  }

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

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    debouncedFetchSearchResults({
      search: searchVal,
      sort_by: sortColumn || "",
      sort_direction: sortDirection,
      limit: newLimit,
    });
  };

  const debouncedFetchSearchResults = useMemo(
    () =>
      createDebouncedSearch((params) => {
        fetchSearchResults(
          "/policy/admin-policy",
          params,
          setFilteredUsers,
          setIsLoading,
          setFilteredLength,
          setPageIndex
        );
      }, 300),
    []
  );

  const handleSubmit = async (content) => {
    const payload = {
      [`data_${policyId}`]: content,
    };
    try {
      setIsLoading(true);
      await postApi(`/policy/save/docs/${policyId}`, payload);
      setShowEdit(false);
      GetPolicy();
    } catch (error) {
      console.error("error: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="d-flex justify-content-between mb-3 flex-wrap">
        <h5>
          Update Documents for policies
          {metaData.total > 0 && (
            <span className="badge user-active text-white ms-1">
              {metaData.total}
            </span>
          )}
        </h5>
        <div className="d-flex">
          <Searchbar onSearch={handleSearch} placeHolder={"Search"} />
        </div>
      </div>
      <div className="tabledata-scroll mb-3">
        <table className="table users-table mb-0">
          <thead className="tablescrolling-thead-tr">
            <tr>
              <th scope="col">#</th>
              <th scope="col">Name</th>
              <th scope="col">Title</th>
              <th scope="col" className="text-center">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="tablescrolling-tbody">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, rowIndex) => (
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
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((item, id) => (
                <tr key={id}>
                  <td>{metaData.current_page * 10 - 10 + id + 1}</td>
                  <td
                    className="Capitalize"
                    dangerouslySetInnerHTML={{
                      __html: highlightText(item.name || "", searchVal),
                    }}
                  />
                  <td
                    className="Capitalize"
                    dangerouslySetInnerHTML={{
                      __html: highlightText(item.title || "", searchVal),
                    }}
                  />
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
                              item.name,
                              item.data,
                              item.file_location
                            )
                          }
                        >
                          <PenToSquareIcon/>
                        </button>
                      </OverlayTrigger>
                      <OverlayTrigger
                        overlay={
                          <Tooltip id="tooltip-disabled">Download</Tooltip>
                        }
                      >
                        <button
                          className="btn btn-sm py-0 my-1"
                          onClick={() => handleDownload(item.file_location)}
                        >
                          <i className="fa-solid fa-cloud-arrow-down text-success"></i>
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
          <Offcanvas.Title className="Capitalize">{title}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="custom-title-edit">
            <label className="form-label">Template Data</label>
            <div>
              {adminEditVal === 1 ? (
                <>
                  <button className="admin-template-edit" onClick={adminReturn}>
                    <i className="fa-solid fa-arrow-left"></i>
                  </button>
                </>
              ) : (
                <>
                  <button className="admin-template-edit" onClick={adminEdit}>
                    <PenToSquareIcon/>
                  </button>
                </>
              )}
            </div>
          </div>
          {adminEditVal === 1 ? (
            <>
              <JoditEditor
                ref={editor}
                value={content}
                onChange={(newContent) => setContent(newContent)}
              />
            </>
          ) : (
            <>
              <iframe
                title="myFrame"
                src={veiwPdf}
                width="100%"
                height="80%"
                className="rounded border shadow-sm"
              ></iframe>
            </>
          )}
          <div className="d-flex justify-content-end">
            <button
              type="button"
              className="btn primary-btn mt-2 me-1"
              onClick={() => handleSubmit(content)}
            >
              {isLoading ? (
                <div
                  className="spinner-border p-0 text-white spinner-border-sm"
                  role="status"
                ></div>
              ) : (
                "Save and Approve"
              )}
            </button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default AdminPolicy;
