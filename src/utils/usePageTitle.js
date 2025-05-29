import { useEffect } from "react";

const usePageTitle = (pageTitle) => {
  const appTitle = " - Stackflo Compliance Automated";

  useEffect(() => {
    document.title = `${pageTitle + appTitle}`;
  }, [pageTitle]);
};

export default usePageTitle;
