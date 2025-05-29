const Pagination = ({
  dataFetchFunction,
  dataPaginationLinks,
  id,
  filteredLength,
  search,
  sort_by,
  sort_direction,
  limit,
}) => {
  if (!dataPaginationLinks || filteredLength <= 10) {
    return null;
  }

  const params = new URLSearchParams({
    search: search || "",
    sort_by: sort_by || "",
    sort_direction: sort_direction || "",
    limit: limit || "",
  });

  // Function to parse and handle pagination URL
  // const paginateUrlParse = (parseUrl) => {
  //   if (parseUrl) {
  //     let relativeURI = parseUrl.replace(
  //       process.env.REACT_APP_BACKEND_BASE_URL + "/",
  //       ""
  //     );

  //     const separator = relativeURI.includes("?") ? "&" : "?";

  //     // Append query parameters
  //     relativeURI = `${relativeURI}${separator}${params.toString()}`;
  //     // Check if `id` is provided, if so, include it in the fetch URL with '/'
  //     if (id) {
  //       relativeURI = `/${relativeURI}&id=${id}`; // Prepend the `id` with '/'
  //       dataFetchFunction(relativeURI);
  //     } else {
  //       // Just call the fetch function normally
  //       dataFetchFunction(relativeURI);
  //     }
  //   }
  // };

  const paginateUrlParse = (parseUrl) => {
    if (parseUrl) {
      try {
        const url = new URL(parseUrl);
        const urlParams = Object.fromEntries(url.searchParams.entries());

        const mergedParams = {
          ...urlParams,
          search: search || "",
          sort_by: sort_by || "",
          sort_direction: sort_direction || "",
          limit: limit || "",
        };

        if (id) {
          mergedParams.id = id;
        }
        dataFetchFunction(mergedParams);
      } catch (error) {
        console.error("Error parsing pagination URL:", error);
      }
    }
  };

  return (
    <>
      <div className="d-flex justify-content-between ">
        <nav aria-label="Pagination Navigation">
          <ul className="pagination">
            {dataPaginationLinks.links?.map((paginate, index) => (
              <li
                key={index}
                className={`page-item ${paginate.active ? "active" : ""}`}
              >
                <button
                  onClick={() => paginateUrlParse(paginate.url)}
                  className="page-link"
                  disabled={!paginate.url}
                >
                  <span
                    dangerouslySetInnerHTML={{ __html: paginate.label }}
                  ></span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ms-auto p-2 bd-highlight" style={{ color: "#37c650" }}>
          {`Showing ${dataPaginationLinks.from} to ${dataPaginationLinks.to} of ${dataPaginationLinks.total} entries`}
        </div>
      </div>
    </>
  );
};

export default Pagination;
