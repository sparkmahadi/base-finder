"use client";
import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function Styles() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    buyer: "",
    season: "",
    status: "",
    fabrication: "",
  });
  const [selectedItem, setSelectedItem] = useState(null);

  const router = useRouter();

  // Auth headers
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/v2/styles", {
          headers: getAuthHeaders(),
        });
        setData(res.data.data);
        setFilteredData(res.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getAuthHeaders]);

  // Handle search and filters
  useEffect(() => {
    let result = data;

    // Search by style
    if (search.trim()) {
      result = result.filter((item) =>
        item.style.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filter by dropdowns
    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        result = result.filter(
          (item) =>
            item[key] &&
            item[key].toLowerCase() === filters[key].toLowerCase()
        );
      }
    });

    setFilteredData(result);
  }, [search, filters, data]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) {
    return <p className="text-center text-gray-500">Loading...</p>;
  }

  if (!filteredData || filteredData.length === 0) {
    return <p className="text-center text-red-500">No records found.</p>;
  }

  // Extract unique values for dropdown filters
  const getUniqueValues = (field) => {
    return [...new Set(data.map((item) => item[field]).filter(Boolean))];
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const res = await axios.delete(`http://localhost:5000/api/v2/styles/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
    setLoading(false);
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Styles Data</h2>

      {/* Search + Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by style..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-60"
        />

        <select
          value={filters.buyer}
          onChange={(e) => handleFilterChange("buyer", e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Filter by Buyer</option>
          {getUniqueValues("buyer").map((val) => (
            <option key={val} value={val}>
              {val}
            </option>
          ))}
        </select>

        <select
          value={filters.season}
          onChange={(e) => handleFilterChange("season", e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Filter by Season</option>
          {getUniqueValues("season").map((val) => (
            <option key={val} value={val}>
              {val}
            </option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) => handleFilterChange("status", e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Filter by Status</option>
          {getUniqueValues("status").map((val) => (
            <option key={val} value={val}>
              {val}
            </option>
          ))}
        </select>

        <select
          value={filters.fabrication}
          onChange={(e) => handleFilterChange("fabrication", e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Filter by Fabrication</option>
          {getUniqueValues("fabrication").map((val) => (
            <option key={val} value={val}>
              {val}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <table className="w-full border border-gray-300 text-left">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Buyer</th>
            <th className="border p-2">Season</th>
            <th className="border p-2">Style</th>
            <th className="border p-2">Fabrication</th>
            <th className="border p-2">Versions</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item) => (
            <tr key={item._id.$oid || item._id} className="hover:bg-gray-100">
              <td className="border p-2">{item.buyer}</td>
              <td className="border p-2">{item.season}</td>
              <td className="border p-2">{item.style}</td>
              <td className="border p-2">{item.fabrication}</td>
              <td className="border p-2">{item.versions}</td>
              <td className="border p-2">{item.status}</td>
              <td className="border p-2">
                <button
                  onClick={() => router.push(`/styles/${item._id}`)}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Details
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}
