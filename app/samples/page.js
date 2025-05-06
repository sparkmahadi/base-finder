"use client";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import SampleListRow from "./components/SampleListRow";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";

const SampleList = () => {
  const { isAuthenticated, userInfo } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [samples, setSamples] = useState([]);
  const [funcLoading, setFuncLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const loaderRef = useRef(null); // 👈 for intersection observer

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
  const [filterTakenStatus, setFilterTakenStatus] = useState("not_taken");
  const [filters, setFilters] = useState({
    date: "",
    category: "",
    style: "",
    no_of_sample: "",
    shelf: "",
    division: "",
    position: "",
    availability: "",
    added_at: "",
    last_taken_by: "",
    released: "",
  });

  useEffect(() => {
    fetchSamples(currentPage);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !loadingMore && currentPage < totalPages) {
          loadMoreSamples();
        }
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0.1,
      }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [loaderRef.current, currentPage, totalPages, loadingMore]);

  const fetchSamples = async (page = 1) => {
    try {
      setFuncLoading(true);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples?page=${page}&limit=50`
      );
      setSamples(res.data.samples || []);
      setTotalPages(res?.data?.totalPages);
      setFuncLoading(false);
    } catch (err) {
      toast.error("Failed to fetch samples");
      setFuncLoading(false);
    }
  };

  const loadMoreSamples = async () => {
    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples?page=${nextPage}&limit=50`
      );
      if (res?.data?.samples?.length > 0) {
        setSamples((prev) => [...prev, ...res.data.samples]);
        setCurrentPage(nextPage);
        setTotalPages(res?.data?.totalPages);
      }
    } catch (err) {
      toast.error("Failed to load more samples");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleEdit = (index) => {
    const sample = samples[index];
    setEditingIndex(index);
    setEditedSample({ ...sample });
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedSample((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (id) => {
    const confirmSave = window.confirm(`Are you sure to save changes to sample no. ${id}?`);
    if (!confirmSave) return toast.info("Cancelled Saving Command");

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
    } catch {
      toast.error("Failed to update sample");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(`Are you sure to delete sample no. ${id}?`);
    if (!confirmDelete) return toast.info("Cancelled command");

    setFuncLoading(true);
    try {
      const res = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res?.data?.success) {
        setSamples((prev) => prev.filter((s) => s._id !== id));
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
    const matchesSearch =
      sample.style?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sample.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sample.added_by?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilters = Object.entries(filters).every(([key, value]) => {
      if (!value.trim()) return true;
      return sample[key]?.toString().toLowerCase().includes(value.toLowerCase());
    });

    return matchesSearch && matchesFilters;
  });

  const tableHeadings = [
    "SL", "Date", "Category", "Style", "No. of sample", "Shelf", "Division", "Position",
    "Availability", "Added at", "Last Taken By", "Released", "Actions",
  ];

  return (
    <div className="overflow-x-auto">
      {funcLoading && <Loader />}
      <div className="flex flex-wrap justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search by style, category or added by"
          className="border p-2 rounded-md w-full sm:w-1/2 mb-2 sm:mb-0"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table render */}
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {tableHeadings.map((heading, idx) => (
              <th key={idx} className="border p-2">{heading}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredSamples.map((sample, index) => (
            <SampleListRow
              key={sample._id}
              index={index}
              sample={sample}
              isEditing={editingIndex === index}
              editedSample={editedSample}
              handleEdit={handleEdit}
              handleCancelEdit={handleCancelEdit}
              handleChange={handleChange}
              handleSave={handleSave}
              handleDelete={handleDelete}
              handleTake={handleTake}
            />
          ))}
        </tbody>
      </table>

      {/* Scroll-trigger loader sentinel */}
      {loadingMore && <Loader />}
      <div ref={loaderRef} className="h-10"></div>
    </div>
  );
};

export default SampleList;
