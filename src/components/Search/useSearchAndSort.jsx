import { getApi } from "../../services/apiService";
import debounce from "lodash.debounce";
import { useState } from "react";

export const fetchSearchResults = async (
  endpoint,
  params,
  setFilteredUsers,
  setIsLoading,
  setFilteredLength,
  setPageIndex
) => {
  try {
    setIsLoading(true);
    const queryParams = new URLSearchParams(params).toString();
    const response = await getApi(`${endpoint}?${queryParams}`);
    let data;
    if (endpoint === "/policy/pending-approval") {
      data = response?.data?.data?.pending_approval || [];
    } else if (endpoint === "/policy/waiting") {
      const docData = response?.data?.data?.doc_data || [];
      const templateData = response?.data?.data?.template_data || [];
      data = [...docData, ...templateData];
    } else if (endpoint === "/policy/policy-template") {
      data = response?.data?.data?.template?.data || [];
    } else if (endpoint === "/policy/admin-policy") {
      data = response?.data?.data?.policy?.data || [];
    } else {
      data = response?.data?.data?.data || response?.data?.data || [];
    }

    const length =
      response?.data?.data?.meta?.total ||
      response?.data?.data?.template?.meta.total ||
      response?.data?.data?.policy?.meta.total ||
      data.length;
    setFilteredUsers(data);
    setPageIndex(response?.data?.data);
    setFilteredLength(length);
  } catch (error) {
    console.error("Error in fetchAndSetData:", error);
    setFilteredUsers([]);
    setFilteredLength(0);
  } finally {
    setIsLoading(false);
  }
};

export const createDebouncedSearch = (searchFunction, delay = 300) => {
  return debounce(searchFunction, delay);
};

export const highlightText = (text, searchVal) => {
  if (!searchVal) return text;
  const regex = new RegExp(`(${searchVal})`, "gi");
  return text.replace(
    regex,
    (match) => `<span class="highlight">${match}</span>`
  );
};

export const LimitSelector = ({ onLimitChange, filteredLength }) => {
  const allLimits = [10, 20, 30, 40, 50];
  const [selectedLimit, setSelectedLimit] = useState(allLimits[0]);

  const handleChange = (event) => {
    const limit = Number(event.target.value);
    setSelectedLimit(limit);
    onLimitChange(limit);
  };

  const limits =
    filteredLength > 40
      ? allLimits
      : filteredLength > 30
      ? allLimits.slice(0, 4)
      : filteredLength > 20
      ? allLimits.slice(0, 3)
      : filteredLength > 10
      ? allLimits.slice(0, 2)
      : [];

  return limits?.length ? (
    <div>
      <select
        id="limit"
        value={selectedLimit}
        onChange={handleChange}
        style={{ padding: "2px" }}
      >
        {limits.map((limit) => (
          <option key={limit} value={limit}>
            {limit}
          </option>
        ))}
      </select>
    </div>
  ) : null;
};
