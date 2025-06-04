// components/SampleListClient.jsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import SampleListRow from "./components/SampleListRow";
import Loader from "../components/Loader";

const SampleListClient = ({ initialSamples }) => {
  const { isAuthenticated, userInfo } = useAuth();
  const [samples, setSamples] = useState(initialSamples);

  const [initialDataLoading, setInitialDataLoading] = useState(!initialSamples.length); // True if no initial data
  const [funcLoading, setFuncLoading] = useState(false); // For individual action loaders (delete, take, put back)
  const [searchLoading, setSearchLoading] = useState(false); // For search/filter-specific loader

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
    added_by: "All",
  });

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
      added_by: getUniqueAndSorted("added_by"),
    };
  }, [samples]); // Recompute only when 'samples' changes

  // Function to refresh the entire sample list from the API
  const refreshSamples = useCallback(async () => {
    let isMounted = true; // Flag to prevent state updates on unmounted component
    setSearchLoading(true); // Indicate loading for data refresh
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples`);
      if (isMounted) {
        const data = res.data.samples || [];
        setSamples(data);
      }
    } catch (err) {
      if (isMounted) {
        toast.error("Failed to refresh sample list.");
        console.error("Error refreshing samples:", err);
      }
    } finally {
      if (isMounted) {
        setSearchLoading(false);
      }
    }
    return () => { isMounted = false; }; // Cleanup function for useEffect
  }, []); // No dependencies as it fetches all samples

  useEffect(() => {
    if (!initialSamples.length) {
      refreshSamples().then(() => setInitialDataLoading(false));
    } else {
      setInitialDataLoading(false); // If initial data was provided, turn off loading immediately
    }
  }, [initialSamples.length, refreshSamples]); // Depend on initialSamples.length to handle cases where it might be empty


  // Centralized handleDelete function for SampleListRow
  const handleDelete = useCallback(async (id, reduceOtherPositions) => {
    setFuncLoading(true); // Show loader for this action
    let isMounted = true;
    try {
      const res = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/${id}?reducePositions=${reduceOtherPositions}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (isMounted && res?.data?.success) {
        toast.success("Sample deleted successfully");
        toast.success(res?.data?.message); // Show message from backend if available
        refreshSamples(); // Refresh data after successful delete
      } else {
        if (isMounted) {
            toast.error(res?.data?.message || "Failed to delete sample.");
        }
      }
    } catch (err) {
      if (isMounted) {
        toast.error(err.response?.data?.message || "Failed to delete sample: Frontend Error");
        console.error("Delete sample error:", err);
      }
    } finally {
      if (isMounted) {
        setFuncLoading(false); // Hide loader
      }
    }
    return () => { isMounted = false; };
  }, [refreshSamples]); // Dependency: refreshSamples (to re-fetch data)

  // Centralized handleTake function for SampleListRow
  const handleTake = useCallback(async (id, purpose) => {
    setFuncLoading(true);
    let isMounted = true;
    const body = {
      taken_by: userInfo?.username,
      purpose,
      taken_at: new Date().toISOString(),
    };

    try {
      const res = await axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/${id}/take`, body, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (isMounted && res?.data?.success) {
        toast.success(res?.data?.message);
        refreshSamples();
      } else {
        if (isMounted) {
            toast.error(res?.data?.message || "Failed to take sample.");
        }
      }
    } catch (err) {
      if (isMounted) {
        toast.error(err.response?.data?.message || "Failed to take sample");
        console.error("Take sample error:", err);
      }
    } finally {
      if (isMounted) {
        setFuncLoading(false); // Hide loader
      }
    }
    return () => { isMounted = false; };
  }, [userInfo, refreshSamples]); // Dependencies: userInfo, refreshSamples

  // Centralized handlePutBack function for SampleListRow
  const handlePutBack = useCallback(async (sampleId, newPosition, returnPurpose) => {
    setFuncLoading(true); // Show loader for this action
    let isMounted = true;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/putback/${sampleId}`, {
        method: "PUT",
        body: JSON.stringify({ position: newPosition, returned_by: userInfo?.username, return_purpose: returnPurpose }), // Pass purpose
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (isMounted && res.ok && data.success) {
        toast.success(data?.message);
        refreshSamples(); // Refresh data after successful put back

        // If your backend returns a new sample ID upon putback (e.g., for a new position entry)
        // and you want to navigate to its details immediately:
        // if (data.new_sample_id) {
        //   router.replace(`/samples/${data.new_sample_id}`);
        // }

      } else {
        if (isMounted) {
          const errorMessage = data.message || "Failed to put back sample.";
          toast.error("Error: " + errorMessage);
          console.error("Put back error:", data);
        }
      }
    } catch (err) {
      if (isMounted) {
        console.error("Put back API call failed:", err);
        toast.error("An unexpected error occurred while putting back the sample.");
      }
    } finally {
      if (isMounted) {
        setFuncLoading(false); // Hide loader
      }
    }
    return () => { isMounted = false; };
  }, [userInfo, refreshSamples]); // Dependencies: userInfo, refreshSamples


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
      added_by: "All",
    });
    refreshSamples(); // Refresh data after clearing filters
  }, [refreshSamples]);


  const handleSearchClick = useCallback(async () => {
    let isMounted = true;
    setSearchLoading(true); // Show loader specifically for search
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples`, {
        params: { search: searchTerm },
      });
      if (isMounted) {
        const data = res.data.samples || [];
        setSamples(data);
        if (!data.length && searchTerm) {
          toast.info("No matching samples found for your search term.");
        }
      }
    } catch (err) {
      if (isMounted) {
        toast.error(err.response?.data?.message || "Search failed");
      }
    } finally {
      if (isMounted) {
        setSearchLoading(false);
      }
    }
    return () => { isMounted = false; };
  }, [searchTerm]); // Dependency: searchTerm

  // Memoized filtered and sorted samples for rendering
  const filteredSamples = useMemo(() => {
    return samples
      ?.filter((sample) => {
        const matchesSearch =
          sample.style?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sample.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sample.added_by?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilters = Object.entries(filters).every(([key, value]) => {
          if (value === "All" || !value.trim()) return true;
          // Ensure comparison is consistent (e.g., convert numbers to string if filtering on string field)
          return String(sample[key]).toLowerCase().includes(value.toLowerCase());
        });
        return matchesSearch && matchesFilters;
      })
      .sort((a, b) => {
        // Numeric sort for shelf, division, position
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

        return 0; // If all are equal or not numbers, maintain original order
      });
  }, [samples, searchTerm, filters]); // Recompute when samples, searchTerm, or filters change


  const tableHeadings = [
    { label: "SL" },
    { label: "Sample Date", key: "sample_date" },
    { label: "Buyer", key: "buyer" },
    { label: "Category", key: "category" },
    { label: "Style", key: "style" },
    { label: "Shelf", key: "shelf" },
    { label: "Division", key: "division" },
    { label: "Position", key: "position" },
    { label: "Availability", key: "availability" },
    { label: "Status", key: "status" },
    { label: "Added by", key: "added_by" },
    { label: "Actions" },
  ];

  if (!userInfo || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-semibold text-red-600">
        <h2>System: You are not logged in properly. Please log out and log in again!!!</h2>
      </div>
    );
  }

  // Show initial loading state if data is still being fetched on the client side
  if (initialDataLoading) {
    return <Loader message="Loading Samples..." />;
  }

  return (
    <div className="max-w-screen-2xl mx-auto p-4 relative">
      {/* Conditional Loader for individual actions or search */}
      {(funcLoading || searchLoading) && <Loader message={funcLoading ? "Processing action..." : "Applying search/filters..."} />}


      {/* Search & Action Buttons */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <input
          type="text"
          placeholder="Search by style, category, or added by..."
          className="border border-gray-300 p-2.5 rounded-md w-full md:flex-1 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") handleSearchClick();
          }}
          aria-label="Search samples"
        />
        <div className="flex gap-3 w-full md:w-auto justify-end">
          <button
            onClick={handleSearchClick}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-md text-base transition-colors duration-200 shadow-sm hover:shadow-md flex-grow md:flex-grow-0"
            disabled={searchLoading} // Disable when search is loading
          >
            {searchLoading ? "Searching..." : "Search"}
          </button>
          <button
            onClick={clearAllFilters}
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-5 py-2.5 rounded-md text-base transition-colors duration-200 shadow-sm hover:shadow-md flex-grow md:flex-grow-0"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Table with integrated filters */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="min-w-full border-collapse text-sm text-center whitespace-nowrap">
          <thead className="bg-gray-100 text-xs text-gray-700 uppercase">
            <tr>
              {tableHeadings?.map(({ label, key }, idx) => (
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
                  handleDelete={handleDelete} // Pass the centralized delete handler
                  handleTake={handleTake}     // Pass the centralized take handler
                  handlePutBack={handlePutBack} // Pass the centralized put back handler
                />
              ))
            ) : (
              <tr>
                <td colSpan={tableHeadings.length} className="text-center p-6 text-gray-500 text-base">
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