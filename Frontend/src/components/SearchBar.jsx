import React from "react";
import "remixicon/fonts/remixicon.css";

const SearchBar = () => {
  return (
    <div className="w-full h-12">
      <input
        type="text"
        placeholder="Search For problem"
        className="w-full h-full outline-none border-none bg-transparent appearance-none focus:outline-none focus:ring-0"
      />
    </div>
  );
};

export default SearchBar;