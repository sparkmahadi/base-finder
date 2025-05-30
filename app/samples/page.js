// components/SampleList.jsx
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import SampleListRow from "./components/SampleListRow";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";

const SampleList = () => {
  const { isAuthenticated, userInfo } = useAuth();
  const [refetch, setRefetch] = useState(false);
  const [samples, setSamples] = useState([]);
  const [funcLoading, setFuncLoading] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const [dropdownOptions, setDropdownOptions] = useState({
    sample_date: ["All"],
    buyer: ["All"],
    category: ["All"],
    style: ["All"],
    shelf: ["All"],
    division: ["All"],
    position: ["All"],
    availability: ["All"],
    status: ["All"],
    added_by: ["All"],
  });

  // Ensure dropdown options are unique and sorted, handling case and trimming
  const extractDropdownOptions = (samplesData) => {
    const getUniqueAndSorted = (key, type = "string") => {
      // Normalize values: trim whitespace and convert to lowercase for consistent uniqueness
      let uniqueValues = Array.from(new Set(
        samplesData.map((s) => (s[key] !== null && s[key] !== undefined ? String(s[key]).trim() : ''))
          .filter(Boolean) // Remove empty strings
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
  };

  useEffect(() => {
    fetchSamples();
  }, [refetch]);

  const fetchSamples = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples`);
      console.log(res);
      const data = res.data.samples || [];
      setSamples(data);
      setDropdownOptions(extractDropdownOptions(data));
    } catch {
      toast.error("Failed to fetch samples");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setFuncLoading(true);
    try {
      const res = await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res?.data?.success) {
        setRefetch((prev) => !prev);
        toast.success("Sample deleted successfully");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete sample");
    } finally {
      setFuncLoading(false);
    }
  };

  const handleTake = async (id, purpose) => {
    setFuncLoading(true);
    const body = {
      taken_by: userInfo?.username,
      purpose,
      taken_at: new Date().toISOString(),
    };

    try {
      const res = await axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/${id}/take`, body, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res?.data?.success) {
        setRefetch((prev) => !prev);
        toast.success(res?.data?.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to take sample");
    } finally {
      setFuncLoading(false);
    }
  };

    const handlePutBack = async (sampleId, newPosition) => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/putback/${sampleId}`, {
          method: "PUT",
          body: JSON.stringify({ position: newPosition, returned_by: userInfo?.username }),
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        if (res.ok && data.success) {
          toast.success(data?.message);
          setRefetch((prev) => !prev);
        } else {
          const errorMessage = data.message || "Failed to put back sample.";
          toast.error("Error: " + errorMessage);
          console.error("Put back error:", data);
        }
      } catch (err) {
        console.error("Put back API call failed:", err);
        toast.error("An unexpected error occurred while putting back the sample.");
      }
    };
  

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearAllFilters = () => {
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
    setRefetch((prev) => !prev);
  };

  const filteredSamples = samples
    ?.filter((sample) => {
      const matchesSearch =
        sample.style?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sample.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sample.added_by?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilters = Object.entries(filters).every(([key, value]) => {
        if (value === "All" || !value.trim()) return true;
        return String(sample[key]).toLowerCase().includes(value.toLowerCase());
      });

      return matchesSearch && matchesFilters;
    })
    .sort((a, b) => {
      if (a.shelf !== b.shelf) {
        return parseFloat(a.shelf) - parseFloat(b.shelf);
      }
      if (a.division !== b.division) {
        return parseFloat(a.division) - parseFloat(b.division);
      }
      return parseFloat(a.position) - parseFloat(b.position);
    });

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

  const handleSearchClick = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples`, {
        params: { search: searchTerm },
      });
      const data = res.data.samples || [];
      setSamples(data);
      setDropdownOptions(extractDropdownOptions(data));
      if (!data.length && searchTerm) {
        toast.info("No matching samples found for your search term.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  if (!userInfo || !isAuthenticated) {
    return <Loader />;
  }

  return (
    <div className="max-w-screen-2xl mx-auto p-4 relative">
      {(funcLoading || loading) && <Loader />}

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
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
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
                  handleDelete={handleDelete}
                  handleTake={handleTake}
                  handlePutBack={handlePutBack}
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

export default SampleList;