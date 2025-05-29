import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const useQueryFilters = (keys = []) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, _setFilters] = useState(
    keys.reduce((acc, key) => ({ ...acc, [key]: null }), {})
  );

  useEffect(() => {
    const newFilters = {};
    const newParams = {};

    keys.forEach((key) => {
      const value = searchParams.get(key);
      if (value !== null) {
        newFilters[key] = value;
        newParams[key] = value;
      }
    });

    _setFilters((prev) => ({ ...prev, ...newFilters }));

    if (Object.keys(newParams).length > 0) {
      setSearchParams(newParams);
    }
  }, []);

  const setFilters = (updated) => {
    _setFilters(updated);

    const cleanParams = {};
    keys.forEach((key) => {
      const value = updated[key];
      if (value !== null && value !== "") {
        cleanParams[key] = value;
      }
    });

    setSearchParams(cleanParams);
  };

  return [filters, setFilters];
};

export default useQueryFilters;
