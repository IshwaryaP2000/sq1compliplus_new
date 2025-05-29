import { Icon } from "@iconify/react/dist/iconify.js";

// Function to get the browser icon based on the browser name
export const getBrowserIcon = (browser) => {
  switch (browser) {
    case "Chrome":
      return <Icon icon="devicon:chrome" width="20" height="20" />;
    case "Firefox":
      return <Icon icon="devicon:firefox" width="20" height="20" />;
    case "Safari":
      return <Icon icon="devicon:safari" width="20" height="20" />;
    default:
      return null;
  }
};

// Function to get the browser version (you can customize it if needed)
export const getBrowserVersion = (version) => {
  return version ? `- ${version}` : "";
};

// Function to get the OS icon based on the OS name
export const getOSIcon = (os) => {
  switch (os) {
    case "Windows":
      return <Icon icon="devicon:windows8" width="20" height="20" />;
    case "macOS":
      return <Icon icon="devicon:apple" width="20" height="20" />;
    case "Android":
      return <Icon icon="devicon:android-wordmark" width="20" height="20" />;
    case "iOS":
      return <Icon icon="devicon:apple" width="20" height="20" />;
    default:
      return null;
  }
};

// Function to get the OS version (you can customize it if needed)
export const getOSVersion = (version) => {
  return version ? `- ${version}` : "";
};
