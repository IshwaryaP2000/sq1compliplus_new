import  { useState } from "react";

function Searchbar({ onSearch, placeHolder }) {
  const [searchVal, setSearchVal] = useState("");

  const handleInput = (e) => {
    const value = e.target.value;
    setSearchVal(value);
    onSearch(value);
  };

  const handleClear = () => {
    setSearchVal("");
    onSearch("");
  };

  return (
    <div className="form-group has-search position-relative">
      <span
        className="fa fa-search form-control-feedback"
        style={{ left: "0", zIndex: 2 }}
      ></span>
      {searchVal && (
        <span
          className="fa fa-times form-control-feedback"
          onClick={handleClear}
          style={{
            cursor: "pointer",
            right: "0",
            left: "auto",
            zIndex: 2, // Above input
            pointerEvents: "auto", // Override Bootstrap's 'none'
          }}
        ></span>
      )}
      <input
        type="text"
        className="form-control py-2"
        placeholder={placeHolder}
        onChange={handleInput}
        value={searchVal}
      />
    </div>
  );
}

export default Searchbar;
