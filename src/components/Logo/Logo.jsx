import { logoPath } from "../../utils/UtilsGlobalData";

const Logo = () => {
  return (
    <img src={logoPath()?.product_logo} alt="logo" className="logo-image-svg" />
  );
};

export default Logo;
