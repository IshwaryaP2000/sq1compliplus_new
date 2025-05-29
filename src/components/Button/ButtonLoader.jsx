const ButtonWithLoader = ({ name = "loading..." }) => {
  return (
    <>
      <span
        className="spinner-border spinner-border-sm"
        role="status"
        aria-hidden="true"
      ></span>
      &nbsp;{name}
    </>
  );
};
export default ButtonWithLoader;
