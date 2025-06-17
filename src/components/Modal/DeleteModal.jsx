import { TriangleExclamationIcon } from "../Icons/Icons";

const DeleteModal = ({ msg = "text" }) => {
  return (
    <div className="text-center">
      <div className="mb-3">
        <div className="warning-icon-wrapper">
          <TriangleExclamationIcon />
        </div>
      </div>
      <h5 className="fw-bold mb-2 text-muted">Delete {msg}?</h5>
      <p className="mb-2">
        You're going to <span className="fw-bold">"delete" </span>
        this {msg}. Are you sure?
      </p>
    </div>
  );
};
export default DeleteModal;
