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
    date: "All",
    category: "All",
    style: "All",
    buyer: "All",
    shelf: "All",
    division: "All",
    position: "All",
    availability: "All",
    added_at: "All",
    last_taken_by: "All",
    released: "All",
  });
  

  const [dropdownOptions, setDropdownOptions] = useState({
    category: [""],
    buyer: [""],
    shelf: [""],
    division: [""],
    position: [""],
    availability: [""],
    released: [""],
    style: [""],
    date: [""],
    added_at: [""],
    last_taken_by: [""],
  });

  const extractDropdownOptions = (samplesData) => {
    const getUnique = (key) => ["All", ...Array.from(new Set(samplesData.map((s) => s[key]).filter(Boolean)))];
  
    return {
      category: getUnique("category"),
      buyer: getUnique("buyer"),
      shelf: getUnique("shelf"),
      division: getUnique("division"),
      position: getUnique("position"),
      availability: getUnique("availability"),
      added_by: getUnique("added_by"),
      released: getUnique("released"),
      style: getUnique("style"),
      date: getUnique("date"),
      added_at: getUnique("added_at"),
      last_taken_by: getUnique("last_taken_by"),
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
    } catch {
      toast.error("Failed to take sample");
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setFilters({
      date: "",
      category: "",
      style: "",
      buyer: "",
      shelf: "",
      division: "",
      position: "",
      availability: "",
      added_at: "",
      last_taken_by: "",
      released: "",
    });
  };

  const filteredSamples = samples?.filter((sample) => {
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
  });
  

  const tableHeadings = [
    { label: "SL" },
    { label: "Date", key: "date" },
    { label: "Category", key: "category" },
    { label: "Style", key: "style" },
    { label: "Buyer", key: "buyer" },
    { label: "Shelf", key: "shelf" },
    { label: "Division", key: "division" },
    { label: "Position", key: "position" },
    { label: "Availability", key: "availability" },
    { label: "Added at", key: "added_at" },
    { label: "Last Taken By", key: "last_taken_by" },
    { label: "Released", key: "released" },
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

  return (
    <div className="max-w-10/12 mx-auto">
      {(funcLoading || loading) && <Loader />}

      <div className="flex gap-2 justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search by style, category or added by"
          className="border p-2 rounded-md w-6/12 mb-2 sm:mb-0"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={searchSampleData} className="bg-red-600 text-white px-2 py-1 w-1/12 rounded text-xs cursor-pointer">
          Search Database
        </button>
        <button className="bg-red-600 text-white px-2 py-1 w-1/12 rounded text-xs mt-1 cursor-pointer" onClick={clearAllFilters}>
          Clear filters
        </button>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            {tableHeadings.map(({ label, key }, idx) => (
              <th key={idx} className="border p-2">
                <div className="flex flex-col">
                  <span>{label}</span>
                  {key && dropdownOptions[key] && (
                    <select
                    name={key}
                    value={filters[key] || "All"}  // Default to "All"
                    onChange={handleFilterChange}
                    className="mt-1 text-xs border rounded"
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
                index={idx + 1}
                userRole={userInfo?.role}
                handleDelete={handleDelete}
                handleTake={handleTake}
              />
            ))
          ) : (
            <tr>
              <td colSpan={tableHeadings.length} className="text-center p-4">
                No samples found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SampleList;
