import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import usePageTitle from "../../utils/usePageTitle";
import { getAuthToken } from "../../utils/UtilsGlobalData";

const UnAuthorized = () => {
  usePageTitle("Unauthorized Access");
  const [token, setToken] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    setToken(getAuthToken());
  }, []);

  return (
    <div
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 2,
      }}
    >
      <center>
        <img
          src="/images/UnauthorizedImg.svg"
          alt="Registration Not Found"
          style={{ maxWidth: "100%", height: "auto", marginTop: "40px" }}
        />
        <p variant="h4" sx={{ fontWeight: "700" }}>
          Error Unauthorized 401
        </p>
        <p variant="body1">
          The page you’re trying to access has restricted access <br /> Please
          refer to your system administrator
        </p>
        <div>
          <button className="ms-2 btn primary-btn" onClick={() => navigate(-1)}>
            Back
          </button>
          {token ? (
            <Link to="/dashboard" className="btn primary-btn ms-2">
              Dashboard Page
            </Link>
          ) : (
            <Link to="/login" className="btn primary-btn ms-2">
              Login Page
            </Link>
          )}
        </div>
      </center>
    </div>
  );
};

export default UnAuthorized;
