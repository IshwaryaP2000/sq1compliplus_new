import { logoPath } from "../../utils/UtilsGlobalData";

const Logo = () => {
  return (
    <img src={logoPath()?.product_logo} alt="logo" className="logo-image-svg" />
  );
};

const clientLogo = () => {
  return (
    <img
      src={logoPath()?.client_logo}
      alt=" logo"
      className="logo-image-upload"
    />
  );
};

export { Logo, clientLogo };
