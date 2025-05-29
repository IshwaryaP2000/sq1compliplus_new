let navigateFunction = null;

export const setNavigator = (navigate) => {
  navigateFunction = navigate;
};

export const navigateTo = (path) => {
  if (navigateFunction) {
    navigateFunction(path);
  } else {
    console.error("Navigator is not set yet.");
  }
};
