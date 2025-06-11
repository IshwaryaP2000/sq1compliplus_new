import { useState } from "react";

const Progressbar = () => {
  const [agreed, setAgreed] = useState(20);
  const [disagreed, setDisagreed] = useState(70);
  const [updateTrigger, setUpdateTrigger] = useState(0); // New state to force re-render

  // useEffect(() => {
  //     const interval = setInterval(() => {
  //         // Update values and trigger re-render
  //         setAgreed(21 + Math.floor(Math.random() * 5));
  //         setDisagreed(29 + Math.floor(Math.random() * 5));
  //         setUpdateTrigger(prev => prev + 1);
  //     }, 3000);

  //     return () => clearInterval(interval);
  // }, []);

  const total = agreed + disagreed;
  const agreedWidth = total > 0 ? (agreed / total) * 100 : 0;
  const disagreedWidth = total > 0 ? (disagreed / total) * 100 : 0;

  return (
    <div className="policy-progressbar-container">
      <div className="policy-progressbar">
        <div className="progress-fill">
          {/* Reset elements with keys to trigger animation */}
          <div
            key={`agreed-${updateTrigger}`}
            className="agreed-bar"
            style={{ width: `${agreedWidth}%` }}
          ></div>
          <div
            key={`disagreed-${updateTrigger}`}
            className="disagreed-bar"
            style={{ width: `${disagreedWidth}%` }}
          ></div>
        </div>
      </div>
      <div className="labels">
        <span className="text-gray-light">{agreed} Agreed</span>
        <span className="text-gray-light">{disagreed} Employees</span>
      </div>
    </div>
  );
};

export default Progressbar;
