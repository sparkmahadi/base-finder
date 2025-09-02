import React from "react";
import DownloadButton from "./DownloadButton";

const FilterBar = ({
  searchTerm,
  setSearchTerm,
  showOnlyMine,
  setShowOnlyMine,
  handleClearSearch,
  showAddForm,
  setShowAddForm,
  cancelEditing,
  userInfo,
  logs,
}) => {
  return (
    <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
      <div className="flex-grow w-full md:w-auto">
        <input
          type="text"
          placeholder="Search by any field..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search logs"
        />
      </div>
      <div className="flex gap-4 items-center w-full md:w-auto">
        <button
          onClick={handleClearSearch}
          className="px-5 py-2 w-full md:w-auto bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200 shadow-md"
        >
          Clear Search
        </button>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            if (showAddForm) {
              cancelEditing();
            }
          }}
          className="px-5 py-2 w-full md:w-auto bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200 shadow-md"
        >
          {showAddForm ? "Hide Form" : "Add New Log"}
        </button>
      </div>
      <div className="flex flex-col md:flex-row gap-4 items-center w-full md:w-auto mt-4 md:mt-0">
        <div className="flex items-center space-x-2">
          <span className="text-gray-700 text-sm font-medium">All Patterns</span>
          <button
            onClick={() => setShowOnlyMine((prev) => !prev)}
            className={`relative inline-flex items-center h-8 w-16 rounded-full p-1 transition-colors duration-300 ${
              showOnlyMine ? "bg-green-600" : "bg-gray-400"
            }`}
            aria-label={showOnlyMine ? "Show all patterns" : "Show my patterns"}
          >
            <span
              className={`inline-block w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                showOnlyMine ? "translate-x-8" : "translate-x-0"
              }`}
            />
          </button>
          <span className="text-gray-700 text-sm font-medium">My Patterns</span>
        </div>
        {userInfo?.role === "admin" && <DownloadButton data={logs} />}
      </div>
    </div>
  );
};

export default FilterBar;