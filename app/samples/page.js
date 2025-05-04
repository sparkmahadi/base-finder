"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import SampleListRow from "../components/sample/SampleListRow";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";

const SampleList = () => {
  const { isAuthenticated, userInfo } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);

  const [samples, setSamples] = useState([]);
  const [funcLoading, setFuncLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedSample, setEditedSample] = useState({
    date: "",
    category: "",
    style: "",
    no_of_sample: "",
    shelf: "",
    division: "",
    position: "",
    taken: "",
    added_at: "",
    added_by: "",
    released: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterTakenStatus, setFilterTakenStatus] = useState("not_taken"); // 'all', 'taken', 'not_taken'
  const [filters, setFilters] = useState({
    date: "",
    category: "",
    style: "",
    no_of_sample: "",
    shelf: "",
    division: "",
    position: "",
    taken: "",
    added_at: "",
    added_by: "",
    released: "",
  });


  useEffect(() => {
    fetchSamples(currentPage);
  }, [currentPage]);
  

  const fetchSamples = async (page = 1) => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples?page=${page}&limit=50`
      );
      setSamples(res.data.samples || []);
      setTotalPages(res?.data?.totalPages);
    } catch (err) {
      toast.error("Failed to fetch samples");
    }
  };
  
  const handleEdit = (index) => {
    const sample = samples[index];
    setEditingIndex(index);
    setEditedSample({ ...sample });
  };

  const handleCancelEdit = (index) => {
    setEditingIndex(null);
  };

  const handleChange = (e) => {

    const { name, value } = e.target;
    setEditedSample((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (id) => {
    const confirm = window.confirm(`Are you sure to save changes to sample no. ${id}?`);
    if (confirm) {
      try {
        const res = await axios.put(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/${id}`,
          editedSample,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (res?.data?.success) {
          const updatedSamples = [...samples];
          updatedSamples[editingIndex] = { ...updatedSamples[editingIndex], ...editedSample };
          setSamples(updatedSamples);
          setEditingIndex(null);
          toast.success("Sample updated successfully");
        }
      } catch (err) {
        toast.error("Failed to update sample");
      }
    }
    else toast.info("Cancelled Saving Command");
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm(`Are you sure to delete sample no. ${id}?`);
    if (confirm) {
      setFuncLoading(true);
      try {
        const res = await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (res?.data?.success) {
          setSamples(samples.filter((sample) => sample._id !== id));
          toast.success("Sample deleted successfully");
          setFuncLoading(false);
        }
      } catch (err) {
        toast.error("Failed to delete sample");
        setFuncLoading(false);
      }
    } else toast.info("Cancelled command");
  };

  const handleTake = async (id, purpose) => {
    const body = {
      taken_by: userInfo?.username, // assuming userInfo is accessible here
      purpose,
      taken: new Date().toISOString(),
    };

    try {
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/${id}/take`,
        body,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res?.data?.success) {
        const updatedSamples = [...samples];
        updatedSamples.forEach((s, i) => {
          if (s._id === id) updatedSamples[i].taken = res.data.taken_at || body.taken;
        });
        setSamples(updatedSamples);
        toast.success(res?.data?.success);
      }
    } catch (err) {
      toast.error("Failed to take sample");
    }
  };
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setFilterTakenStatus("not_taken");
    setFilters({
      date: "",
      category: "",
      style: "",
      no_of_sample: "",
      shelf: "",
      division: "",
      position: "",
      taken: "",
      added_at: "",
      added_by: "",
      released: "",
    });
  };

  const filteredSamples = samples?.filter((sample) => {
    // Search term match
    const matchesSearch =
      sample.style?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sample.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sample.added_by?.toLowerCase().includes(searchTerm.toLowerCase());

    // Taken status match
    const matchesTakenStatus =
      filterTakenStatus === "all"
        ? true
        : filterTakenStatus === "taken"
          ? !!sample.taken
          : !sample.taken;

    // Filter inputs match
    const matchesFilters = Object.entries(filters).every(([key, value]) => {
      if (!value.trim()) return true; // skip empty filters
      return sample[key]?.toString().toLowerCase().includes(value.toLowerCase());
    });

    return matchesSearch && matchesTakenStatus && matchesFilters;
  });


  const tableHeadings = [
    "SL", "Date", "Category", "Style", "No. of sample", "Shelf", "Division", "Position", "Taken", "Added at", "Added By", "Released", "Actions",
  ];


  return (
    <div className="overflow-x-auto">
      {funcLoading && <Loader />}
      {/* search inut */}
      <div className="flex flex-wrap justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search by style, category or added by"
          className="border p-2 rounded-md w-full sm:w-1/2 mb-2 sm:mb-0"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="border p-2 rounded-md ml-0 sm:ml-4 w-full sm:w-auto"
          value={filterTakenStatus}
          onChange={(e) => setFilterTakenStatus(e.target.value)}
        >
          <option value="all">All</option>
          <option value="taken">Taken</option>
          <option value="not_taken">Not Taken</option>
        </select>
        <button
          onClick={clearAllFilters}
          className="bg-gray-200 text-sm px-4 py-2 rounded-md hover:bg-gray-300 transition"
        >
          Clear Filters
        </button>
      </div>

      <table className="min-w-full bg-white border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            {tableHeadings.map((head) => (
              <th key={head} className="py-2 px-4 border-b font-medium">
                {head}
              </th>
            ))}
          </tr>
          <tr>
            <th><p>N/A</p></th> {/* For SL, no filter */}
            <th><input name="date" value={filters.date} onChange={handleFilterChange} className="w-full border px-1" placeholder="Filter" /></th>
            <th><input name="category" value={filters.category} onChange={handleFilterChange} className="w-full border px-1" placeholder="Filter" /></th>
            <th><input name="style" value={filters.style} onChange={handleFilterChange} className="w-full border px-1" placeholder="Filter" /></th>
            <th><input name="no_of_sample" value={filters.no_of_sample} onChange={handleFilterChange} className="w-full border px-1" placeholder="Filter" /></th>
            <th><input name="shelf" value={filters.shelf} onChange={handleFilterChange} className="w-full border px-1" placeholder="Filter" /></th>
            <th><input name="division" value={filters.division} onChange={handleFilterChange} className="w-full border px-1" placeholder="Filter" /></th>
            <th><input name="position" value={filters.position} onChange={handleFilterChange} className="w-full border px-1" placeholder="Filter" /></th>
            <th>
              <select name="taken" value={filters.taken} onChange={handleFilterChange} className="w-full border px-1">
                <option value="">All</option>
                <option value="yes">Taken</option>
                <option value="no">Not Taken</option>
              </select>
            </th>
            <th><input name="added_at" value={filters.added_at} onChange={handleFilterChange} className="w-full border px-1" placeholder="Filter" /></th>
            <th><input name="added_by" value={filters.added_by} onChange={handleFilterChange} className="w-full border px-1" placeholder="Filter" /></th>
            <th><input name="released" value={filters.released} onChange={handleFilterChange} className="w-full border px-1" placeholder="Filter" /></th>
            <th></th> {/* For actions */}
          </tr>
        </thead>

        <tbody>
          {filteredSamples?.map((sample, index) => (
            <SampleListRow
              key={sample._id}
              index={index}
              sample={sample}
              editingIndex={editingIndex}
              editedSample={editedSample}
              handleChange={handleChange}
              handleEdit={handleEdit}
              handleCancelEdit={handleCancelEdit}
              handleSave={handleSave}
              handleDelete={handleDelete}
              handleTake={handleTake}
            />
          ))}

        </tbody>



      </table>


{/* pagination controls */}
      <div className="mt-4 flex justify-center items-center gap-2">
  <button
    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
    disabled={currentPage === 1}
    className="px-2 py-1 border rounded disabled:opacity-50 text-xs"
  >
    Previous
  </button>
  <span className="text-xs">
    Page {currentPage} of {totalPages}
  </span>
  <button
    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
    disabled={currentPage === totalPages}
    className="px-2 py-1 border rounded disabled:opacity-50 text-xs"
  >
    Next
  </button>
</div>


    </div>
  );
};

export default SampleList;
