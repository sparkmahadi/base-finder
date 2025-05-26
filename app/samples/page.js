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
    sample_date: [""],
    buyer: [""],
    category: [""],
    style: [""],
    shelf: [""],
    division: [""],
    position: [""],
    availability: [""],
    status: [""],
    added_by: [""],
  });

  const extractDropdownOptions = (samplesData) => {
    const getUnique = (key) => ["All", ...Array.from(new Set(samplesData.map((s) => s[key]).filter(Boolean)))];

    return {
      sample_date: getUnique("sample_date"),
      buyer: getUnique("buyer"),
      category: getUnique("category"),
      style: getUnique("style"),
      shelf: getUnique("shelf"),
      division: getUnique("division"),
      position: getUnique("position"),
      availability: getUnique("availability"),
      status: getUnique("status"),
      added_by: getUnique("added_by"),
    };
  };

  

  useEffect(() => {
    fetchSamples();
  }, [refetch]);

  const fetchSamples = async () => {
    try {
      setFuncLoading(true);
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples`);
      const data = res.data.samples || [];
      setSamples(data);
      setDropdownOptions(extractDropdownOptions(data));
    } catch {
      toast.error("Failed to fetch samples");
    } finally {
      setFuncLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(`Are you sure to delete sample no. ${id}?`);
    if (!confirmDelete) return toast.info("Cancelled command");

    setFuncLoading(true);
    try {
      const res = await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res?.data?.success) {
        setSamples((prev) => prev.filter((s) => s._id !== id));
        setRefetch((prev) => !prev);
        toast.success("Sample deleted successfully");
      }
    } catch {
      toast.error("Failed to delete sample");
    } finally {
      setFuncLoading(false);
    }
  };

  const handleTake = async (id, purpose) => {
    const body = {
      taken_by: userInfo?.username,
      purpose,
      taken: new Date().toISOString(),
    };

    try {
      const res = await axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/${id}/take`, body, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res?.data?.success) {
        setSamples((prev) => prev.filter((s) => s._id !== id));
        setRefetch((prev) => !prev);
        toast.success(res?.data?.message);
      }
    } catch (err) {
      toast.error("Failed to take sample", err.message);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setFilters({
      sample_date: "",
      buyer: "",
      category: "",
      style: "",
      shelf: "",
      division: "",
      position: "",
      availability: "",
      status: "",
      added_by: "",
    });
  };

const filteredSamples = samples
  ?.filter((sample) => {
    const matchesSearch =
      sample.style?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sample.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sample.added_by?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilters = Object.entries(filters).every(([key, value]) => {
      // Skip filtering if the value is "All" or empty
      if (!value.trim() || value === "All") return true;
      return sample[key]?.toString().toLowerCase().includes(value.toLowerCase());
    });

    return matchesSearch && matchesFilters;
  })
  .sort((a, b) => {
    // Sort by shelf
    if (a.shelf !== b.shelf) {
      return a.shelf - b.shelf;
    }
    // If shelf is the same, sort by division
    if (a.division !== b.division) {
      return a.division - b.division;
    }
    // If division is also the same, sort by position
    return a.position - b.position;
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

  const searchSampleData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples?search=${searchTerm}`);
      const samples = res?.data?.samples;
      setSamples(samples);
      setDropdownOptions(extractDropdownOptions(samples || []));
      if (!samples?.length) toast.info("No matching samples found!!!");
    } catch {
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  if (!userInfo || !isAuthenticated) {
    return <Loader />; // or any fallback UI while loading user info
  }


  return (
   <div className="max-w-screen-2xl mx-auto p-4">
  {(funcLoading || loading) && <Loader />}

  {/* Search & Filter */}
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
    <input
      type="text"
      placeholder="Search by style, category or added by"
      className="border p-2 rounded-md w-full md:w-1/2 text-sm"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
    <div className="flex flex-wrap gap-2">
      <button
        onClick={searchSampleData}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
      >
        Search
      </button>
      <button
        onClick={clearAllFilters}
        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm"
      >
        Clear
      </button>
    </div>
  </div>

  {/* Table */}
  <div className="overflow-x-auto">
    <table className="min-w-full border text-sm text-center whitespace-nowrap">
      <thead className="bg-gray-100 text-xs text-gray-700 uppercase">
        <tr>
          {tableHeadings.map(({ label, key }, idx) => (
            <th key={idx} className="px-1 py-3 border-1">
              <div className="flex flex-col gap-1">
                <span className="font-semibold truncate">{label}</span>
                {key && dropdownOptions[key] && (
                  <select
                    name={key}
                    value={filters[key] || "All"}
                    onChange={handleFilterChange}
                    className="text-xs border rounded px-1 py-0.5"
                  >
                    {dropdownOptions[key].map((option, i) => (
                      <option key={i} value={option}>{option}</option>
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
              handleDelete={handleDelete}
              handleTake={handleTake}
            />
          ))
        ) : (
          <tr>
            <td colSpan={tableHeadings.length} className="text-center p-4 text-gray-500">
              No samples found.
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
