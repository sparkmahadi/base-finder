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
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const loaderRef = useRef(null); // 👈 for intersection observer

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

  const [dropdownOptions, setDropdownOptions] = useState({
    category: [""],
    no_of_sample: [""],
    shelf: [""],
    division: [""],
    position: [""],
    availability: [""],
    added_by: [""],
    released: [""],
    style: [""],
    date: [""],
    added_at: [""],
    last_taken_by: [""],
  });


  const extractDropdownOptions = (samplesData) => {
    const getUnique = (key) =>
      ["", ...Array.from(new Set(samplesData.map((s) => s[key]).filter(Boolean)))];

    return {
      category: getUnique("category"),
      no_of_sample: getUnique("no_of_sample"),
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
      const data = res.data.samples || [];
      setSamples(data);
      setDropdownOptions(extractDropdownOptions(data));
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
      console.log(res.data);
      if (res?.data?.success) {
        const updatedSamples = [...samples];
        updatedSamples.forEach((s, i) => {
          if (s._id === id) updatedSamples[i].taken = res.data.taken_at || body.taken;
        });
        setSamples(updatedSamples);
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

      if (key === "availability") {
        const actual = sample.availability === "no" ? "Taken /Not Available" : "Yes";
        return actual.toLowerCase() === value.toLowerCase();
      }

      return sample[key]?.toString().toLowerCase().includes(value.toLowerCase());
    });

    return matchesSearch && matchesFilters;
  });


  // const tableHeadings = [
  //   "SL", "Date", "Category", "Style", "No. of sample", "Shelf", "Division", "Position",
  //   "Availability", "Added at", "Last Taken By", "Released", "Actions",
  // ];

  const tableHeadings = [
    { label: "SL" },
    { label: "Date", key: "date" },
    { label: "Category", key: "category" },
    { label: "Style", key: "style" },
    { label: "No. of sample", key: "no_of_sample" },
    { label: "Shelf", key: "shelf" },
    { label: "Division", key: "division" },
    { label: "Position", key: "position" },
    { label: "Availability", key: "availability" },
    { label: "Added at", key: "added_at" },
    { label: "Last Taken By", key: "last_taken_by" },
    { label: "Released", key: "released" },
    { label: "Actions" }
  ];

  const searchSampleData = async () => {
    setLoading(true);
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples?search=${searchTerm}`);
    const samples = res?.data?.samples;
  
    if (samples?.length > 0) {
      setSamples(samples);
      setDropdownOptions(extractDropdownOptions(samples)); // ✅ ADD THIS LINE
      setLoading(false);
    } else {
      toast.info("No matching samples found!!!");
      setSamples([]); // Optional: Clear samples if not found
      setDropdownOptions(extractDropdownOptions([])); // ✅ Reset options
      setLoading(false);
    }
  };
  

  return (
    <div className="max-w-10/12 mx-auto">
      {(funcLoading || loading ) && <Loader />}
      <div className="flex gap-2 justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search by style, category or added by"
          className="border p-2 rounded-md w-6/12 mb-2 sm:mb-0"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={searchSampleData} className="bg-red-600 text-white px-2 py-1 w-1/12 rounded text-xs cursor-pointer" >Search Database</button>
        <button className="bg-red-600 text-white px-2 py-1 w-1/12 rounded text-xs mt-1 cursor-pointer" onClick={clearAllFilters}>Clear filters</button>
      </div>

      {/* Table render */}
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {tableHeadings.map(({ label, key }, idx) => (
              <th key={idx} className="border p-2">
                <div className="flex flex-col">
                  <span>{label}</span>
                  {key && dropdownOptions[key] ? (
                    <select
                      name={key}
                      value={filters[key] || ""}
                      onChange={handleFilterChange}
                      className="mt-1 border rounded text-xs p-1"
                    >
                      {dropdownOptions[key].map((option, i) => (
                        <option key={i} value={option}>
                          {option || "All"}
                        </option>
                      ))}
                    </select>
                  ) : null}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {filteredSamples.map((sample, index) => (
            <SampleListRow
            key={sample._id}
            sample={sample}
            index={index}
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
