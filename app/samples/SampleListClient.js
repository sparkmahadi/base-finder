// components/SampleListClient.jsx
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { useSampleData } from "../hooks/useSampleData";
import SampleListRow from "./components/SampleListRow";
import Loader from "../components/Loader";

// Import xlsx and file-saver
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// Helper function to format dates (optional, but good for consistent export)
function formatDateForExcel(dateString) {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    // Format to YYYY-MM-DD HH:MM:SS for better Excel compatibility
    return date.toLocaleString('sv-SE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false, // Use 24-hour format
    }).replace(' ', 'T'); // Combine date and time with 'T' for ISO-like
  } catch (e) {
    console.error("Error formatting date for Excel:", dateString, e);
    return dateString; // Return original if formatting fails
  }
}

const SampleListClient = () => {
  const { isAuthenticated, userInfo } = useAuth();

  const {
    samples,
    isLoading,
    isMutating,
    isSearching,
    refreshSamples,
    handleDelete,
    handleTake,
    handlePutBack,
    handleSearchSample,
    setIsSearching,
  } = useSampleData([]);


  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    sample_date: "All",
    buyer: "All",
    category: "All",
    style: "All",
    shelf: "All",
    division: "All",
    position: "All",
    availability: "All",
    status: "All",
    last_purpose: "All",
    added_by: "All",
  });

  const [isDownloading, setIsDownloading] = useState(false); // New state for download loading

  const dropdownOptions = useMemo(() => {
    const getUniqueAndSorted = (key, type = "string") => {
      let uniqueValues = Array.from(new Set(
        samples.map((s) => (s[key] !== null && s[key] !== undefined ? String(s[key]).trim() : ''))
          .filter(Boolean)
      ));

      if (type === "number") {
        uniqueValues.sort((a, b) => parseFloat(a) - parseFloat(b));
      } else {
        uniqueValues.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
      }
      return ["All", ...uniqueValues];
    };

    return {
      sample_date: getUniqueAndSorted("sample_date"),
      buyer: getUniqueAndSorted("buyer"),
      category: getUniqueAndSorted("category"),
      style: getUniqueAndSorted("style"),
      shelf: getUniqueAndSorted("shelf", "number"),
      division: getUniqueAndSorted("division", "number"),
      position: getUniqueAndSorted("position", "number"),
      availability: getUniqueAndSorted("availability"),
      status: getUniqueAndSorted("status"),
      last_purpose: getUniqueAndSorted("last_purpose"),
      added_by: getUniqueAndSorted("added_by"),
    };
  }, [samples]);

  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchTerm("");
    setFilters({
      sample_date: "All",
      buyer: "All",
      category: "All",
      style: "All",
      shelf: "All",
      division: "All",
      position: "All",
      availability: "All",
      status: "All",
      last_purpose: "All",
      added_by: "All",
    });
    refreshSamples();
  }, [refreshSamples]);

  const handleSearchClick = useCallback(() => {
    setIsSearching(true);
    handleSearchSample(searchTerm)
  }, [searchTerm]);

  const filteredSamples = useMemo(() => {
    return samples
      ?.filter((sample) => {
        const matchesSearch =
          sample.style?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sample.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sample.added_by?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilters = Object.entries(filters).every(([key, value]) => {
          if (value === "All" || !value.trim()) return true;
          return String(sample[key]).toLowerCase().includes(value.toLowerCase());
        });

        if (userInfo?.role === "admin") {
          // Admin: must satisfy both search + filters
          return matchesSearch && matchesFilters;
        } else {
          // Non-admin: only filters matter
          return matchesFilters;
        }
      })
      .sort((a, b) => {
        const shelfA = parseFloat(a.shelf);
        const shelfB = parseFloat(b.shelf);
        if (!isNaN(shelfA) && !isNaN(shelfB) && shelfA !== shelfB) {
          return shelfA - shelfB;
        }

        const divA = parseFloat(a.division);
        const divB = parseFloat(b.division);
        if (!isNaN(divA) && !isNaN(divB) && divA !== divB) {
          return divA - divB;
        }

        const posA = parseFloat(a.position);
        const posB = parseFloat(b.position);
        if (!isNaN(posA) && !isNaN(posB) && posA !== posB) {
          return posA - posB;
        }

        return 0;
      });
  }, [samples, searchTerm, filters, userInfo?.role]);


  const tableHeadings = useMemo(() => [ // Memoize this array as well
    { label: "SL" },
    { label: "Sample Date", key: "sample_date" },
    { label: "Buyer", key: "buyer" },
    { label: "Category", key: "category" },
    { label: "Style", key: "style" },
    { label: "Shelf", key: "shelf" },
    { label: "Division", key: "division" },
    { label: "Position", key: "position" },
    { label: "Status", key: "status" },
    { label: "Availability", key: "availability" },
    { label: "Last Purpose", key: "last_purpose" },
    { label: "Added by", key: "added_by" },
    { label: "Taken By", key: "taken_by" }, // Add these if you want them in export
    { label: "Taken At", key: "taken_at" },
    { label: "Returned By", key: "returned_by" },
    { label: "Return Purpose", key: "return_purpose" },
    { label: "Returned At", key: "returned_at" },
    // { label: "Actions" }, // Exclude Actions from export
  ], []);

  // Function to handle Excel download
  const handleDownloadExcel = useCallback(() => {
    if (filteredSamples.length === 0) {
      toast.info("No samples to download.");
      return;
    }

    setIsDownloading(true);
    try {
      // Prepare data for export
      const dataToExport = filteredSamples.map((sample, index) => {
        const row = {};
        tableHeadings.forEach((heading) => {
          if (heading.label === "SL") {
            row[heading.label] = index + 1; // Serial number
          } else if (heading.key) {
            let value = sample[heading.key];
            // Special handling for date fields
            if (['sample_date', 'taken_at', 'returned_at'].includes(heading.key)) {
              value = formatDateForExcel(value);
            }
            row[heading.label] = value !== null && value !== undefined ? value : '';
          }
        });
        return row;
      });

      // Create a worksheet
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);

      // Create a workbook and add the worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Samples");

      // Generate a timestamp for the filename
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[^0-9]/g, ''); // YYYYMMDDTHHMMSS
      const filename = `samples_export_${timestamp}.xlsx`;

      // Write the workbook and trigger download
      XLSX.writeFile(workbook, filename);
      toast.success("Samples downloaded successfully!");
    } catch (error) {
      console.error("Error downloading Excel file:", error);
      toast.error("Failed to download samples as Excel.");
    } finally {
      setIsDownloading(false);
    }
  }, [filteredSamples, tableHeadings]); // Depend on filteredSamples and tableHeadings


  if (!userInfo || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-semibold text-red-600">
        <h2>System: You are not logged in properly. Please log out and log in again!!!</h2>
      </div>
    );
  }

    if (!userInfo?.approval) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-semibold text-red-600">
        <h2>System: Your account is not approved yet!!! Contact Admin...</h2>
      </div>
    );
  }

      if (!userInfo?.verification) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-semibold text-red-600">
        <h2>System: Your account is not verified yet!!! Contact Admin...</h2>
      </div>
    );
  }

  if (isLoading) {
    return <Loader message="Loading Samples..." />;
  }

  return (
    <div className="max-w-screen-2xl mx-auto p-4 relative">
      {(isMutating || isSearching || isDownloading) && <Loader message={isMutating ? "Processing action..." : isSearching ? "Applying search/filters..." : "Preparing download..."} />}

      <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <input
          type="text"
          placeholder="Search by style, category, or added by..."
          className="border border-gray-300 p-2.5 rounded-md w-full md:flex-1 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearchClick();
          }}
          aria-label="Search samples"
        />
        <div className="flex gap-3 w-full md:w-auto justify-end">
          <button
            onClick={handleSearchClick}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-md text-base transition-colors duration-200 shadow-sm hover:shadow-md flex-grow md:flex-grow-0"
            disabled={isSearching}
          >
            {isSearching ? "Searching..." : "Search"}
          </button>
          <button
            onClick={clearAllFilters}
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-5 py-2.5 rounded-md text-base transition-colors duration-200 shadow-sm hover:shadow-md flex-grow md:flex-grow-0"
          >
            Clear Filters
          </button>
          {
            userInfo?.role === "admin" &&
            <button
              onClick={handleDownloadExcel}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-md text-base transition-colors duration-200 shadow-sm hover:shadow-md flex-grow md:flex-grow-0"
              disabled={isDownloading || filteredSamples.length === 0} // Disable if downloading or no data
            >
              {isDownloading ? "Downloading..." : "Download"}
            </button>
          }
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="min-w-full border-collapse text-sm text-center whitespace-nowrap">
          <thead className="bg-gray-100 text-xs text-gray-700 uppercase">
            <tr>
              {/* Only render table headings for display, not necessarily all export fields */}
              {tableHeadings
                .filter(heading => heading.label !== "Taken By" && heading.label !== "Taken At" && heading.label !== "Returned By" && heading.label !== "Return Purpose" && heading.label !== "Returned At") // Exclude these from display if you don't want them
                .map(({ label, key }, idx) => (
                  <th key={idx} className="px-3 py-3 border-b-2 border-gray-200 font-semibold lg:max-w-32">
                    <div className="flex flex-col gap-1 items-center justify-center lg:max-w-32">
                      <span className="font-semibold truncate">{label}</span>
                      {key && dropdownOptions[key] && (
                        <select
                          name={key}
                          value={filters[key]}
                          onChange={handleFilterChange}
                          className="text-xs max-w-32 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring focus:ring-blue-300 bg-white"
                          aria-label={`Filter by ${label}`}
                        >
                          {dropdownOptions[key].map((option, i) => (
                            <option className="max-w-32" key={i} value={option}>
                              {option === null || option === "" ? "N/A" : option}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </th>
                ))}
              {/* Add a specific Actions column heading back for display */}
              <th className="px-3 py-3 border-b-2 border-gray-200 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSamples?.length > 0 ? (
              filteredSamples.map((sample, idx) => (
                <SampleListRow
                  key={sample._id}
                  sample={sample}
                  index={idx}
                  userRole={userInfo?.role}
                  userInfo={userInfo}
                  handleDelete={handleDelete}
                  handleTake={(id, purpose) => handleTake(id, purpose, userInfo)}
                  handlePutBack={(sampleId, newPosition, returnPurpose) => handlePutBack(sampleId, newPosition, returnPurpose, userInfo)}
                />
              ))
            ) : (
              <tr>
                <td colSpan={tableHeadings.length + 1} className="text-center p-6 text-gray-500 text-base"> {/* +1 for the Actions column */}
                  No samples found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SampleListClient;