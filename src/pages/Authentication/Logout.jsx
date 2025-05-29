import { postApi } from "../../services/apiService";
import { navigateTo } from "../../utils/navigation";
import { logout } from "../../utils/UtilsGlobalData";

const Logout = async () => {
  const response = await postApi("logout");
  if (response.data.success) {
    logout();
    navigateTo("/login");
  } else {
    alert("Login Failed....");
  }
};

export default Logout;
