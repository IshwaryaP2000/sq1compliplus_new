import { ucFirst } from "../../utils/UtilsGlobalData";
import { TriangleExclamationIcon } from "../Icons/Icons";

const EnableDisableModal = ({ status, msg = "text" }) => {
  const isActive = status?.toLowerCase() === "active";
  const action = isActive ? "disable" : "enable";

  return (
    <div className="text-center">
      <div className="mb-3">
        <div className="warning-icon-wrapper">
          <TriangleExclamationIcon />
        </div>
      </div>
      <h5 className="fw-bold mb-2 text-muted">
        {ucFirst(action)} {msg}?
      </h5>

      <p className="mb-2">
        You're going to <span className="fw-bold">"{action}"</span> this {msg}.
        Are you sure?
      </p>
    </div>
  );
};

export default EnableDisableModal;
