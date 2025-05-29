import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const usePreserveQueryParams = (keys = []) => {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const newParams = {};

    keys.forEach((key) => {
      const value = searchParams.get(key);
      if (value) {
        newParams[key] = value;
      }
    });

    if (Object.keys(newParams).length > 0) {
      setSearchParams(newParams);
    }
  }, []);
};

export default usePreserveQueryParams;
