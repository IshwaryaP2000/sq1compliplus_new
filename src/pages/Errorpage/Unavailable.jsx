const Unavailable = () => {
  return (
    <div
      sx={{
        height: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 2,
        background: "#fff",
      }}
    >
      <center>
        <img
          src="/images/error-images/service_unavailable.jpg"
          alt="Service Unavailable"
          style={{
            maxWidth: "100%",
            height: "75vh",
            marginTop: "5%",
          }}
        />
      </center>
    </div>
  );
};

export default Unavailable;
