import { useRef, useEffect, useState } from "react";
import { ucFirst } from "../../utils/UtilsGlobalData";

const OverflowTooltips = ({ text, textType, areaType }) => {
  const textRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const el = textRef.current;
    if (el) {
      setIsOverflowing(el.scrollWidth > el.clientWidth);
    }
  }, [text]);

  return (
    <div className="tooltipss">
      {areaType === "vendorCartTitle" ? (
        <div
          className={`${
            textType === "title" ? "title-limited-text" : "des-limited-text"
          }`}
          ref={textRef}
        >
          <h5 className="list-header-title d-inline mb-0 fw-bold text-muted">
            {ucFirst(text)}
          </h5>
        </div>
      ) : (
        <div
          className={`${
            textType === "title" ? "title-limited-text" : "des-limited-text"
          }`}
          ref={textRef}
        >
          {text}
        </div>
      )}
      {isOverflowing && (
        <div className="tooltip-content">
          <p>{text}</p>
          <i></i>
        </div>
      )}
    </div>
  );
};

export default OverflowTooltips;
