import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuthToken } from "../../utils/UtilsGlobalData";

const InternalserverPage = () => {
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
          src="/images/error-images/InternalServerImg.svg"
          alt="Registration Not Found"
          style={{ maxWidth: "100%", height: "auto", marginTop: "40px" }}
        />
        <p variant="h4" sx={{ fontWeight: "700" }}>
          Internal Server Error 500
        </p>
        <p variant="body1">
          The server was unable to complete your request. Please try again
          later.
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

export default InternalserverPage;
