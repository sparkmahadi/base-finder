"use client";
import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Search, Plus, Eye, Trash2, X, Download, Check, Clock } from 'lucide-react'; // Import Lucide icons
import Modal from "./Modal";
import * as XLSX from "xlsx";
import { useAuth } from "../context/AuthContext";

export default function Styles() {
  const { userInfo } = useAuth();
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
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const router = useRouter();

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
    };
  }, []);

  // Helper: flatten nested objects into key: value
  const flattenObject = (obj, parentKey = "", res = {}) => {
    for (let key in obj) {
      if (!obj.hasOwnProperty(key)) continue;
      const newKey = parentKey ? `${parentKey}.${key}` : key;

      if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
        flattenObject(obj[key], newKey, res); // recurse
      } else {
        res[newKey] = obj[key];
      }
    }
    return res;
  };

  // Mapping: db field → pretty header
  const headerMap = {
    season: "Season",
    style: "Style Code",
    item: "Item",
    descr: "Style Description",
    version: "Version",
    fabrc: "Fabrication",
    status: "Style Status",
    sizes: "Selected Sizes",
    similar: "Similar Styles",
    prints: "No. of prints",
    testingdate: "TESTING",
    factory_code: "Factory Code",
    factory_name: "Factory Name",
  };



  // Download all fields dynamically
  const downloadExcel = () => {
    const exportData = data?.map((item, index) => {
      const flatItem = flattenObject(item);
      const renamed = {};

      Object.keys(flatItem).forEach((key) => {
        // Use decorated name if available, otherwise fallback to key
        const header = headerMap[key] || key;
        renamed[header] = flatItem[key];
      });

      return { SL: index + 1, ...renamed };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Styles");
    XLSX.writeFile(workbook, "styles_full.xlsx");
  };



  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/styles`, {
          headers: getAuthHeaders(),
        });
        console.log(res.data)
        if (res.data.success) {
          toast.success(res.data.message)
        } else { toast.info(res.data.message) }
        setData(res.data.data);
        setFilteredData(res.data.data);
      } catch (error) {
        toast.error("Failed to fetch styles.");
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [getAuthHeaders]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const clearFilters = () => {
    setSearch("");
    setFilters({
      buyer: "",
      season: "",
      status: "",
      fabrication: "",
      factory_name: ""
    });
  };

  const getUniqueValues = (field) => {
    if (field === "status") {
      return [...new Set(data?.map((item) => getStyleStatus(item)).filter(Boolean))];
    }

    if (field === "factory_name") {
      // 🔧 extract factory names from productionRecords array
      const allFactories = data.flatMap(item =>
        item.productionRecords?.map(r => r.factory_name) || []
      );
      return [...new Set(allFactories)];
    }

    return [...new Set(data?.map((item) => item[field]).filter(Boolean))];
  };


  useEffect(() => {
    let result = data;

    if (search.trim()) {
      result = result.filter((item) =>
        item.style?.toLowerCase().includes(search.toLowerCase())
      );
    }

    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        if (key === "status") {
          result = result.filter(
            (item) => getStyleStatus(item).toLowerCase() === filters.status.toLowerCase()
          );
        } else if (key === "fabrication") {
          result = result.filter((item) =>
            item.fabric
              ?.replace(/\s+/g, "")
              .toLowerCase() === filters.fabrication.replace(/\s+/g, "").toLowerCase()
          );
        } else if (key === "factory_name") {
          // ✅ check if any productionRecord matches selected factory
          result = result.filter(item =>
            item.productionRecords?.some(r =>
              r.factory_name?.toLowerCase() === filters.factory_name.toLowerCase()
            )
          );
        } else {
          result = result.filter(
            (item) => item[key]?.toLowerCase() === filters[key].toLowerCase()
          );
        }
      }
    });


    // ✅ Sort after filtering
    result = sortByStatusAndDate(result);

    setFilteredData(result);
  }, [search, filters, data]);


  const openDeleteModal = (item) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setItemToDelete(null);
    setDeleteModalOpen(false);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setLoading(true);
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/styles/${itemToDelete._id}`, {
        headers: getAuthHeaders(),
      });
      toast.success("Style deleted successfully!");
      const updatedData = data.filter((item) => item._id !== itemToDelete._id);
      setData(updatedData);
      setFilteredData(updatedData);
      closeDeleteModal();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      inquiry: "bg-gray-400",
      testing: "bg-yellow-600",
      fit: "bg-blue-400",
      "2nd fit": "bg-blue-500",
      pp: "bg-green-600",
      "pp screen": "bg-green-700",
      rpp: "bg-pink-400",
      "rpp screen": "bg-pink-600",
      pro: "bg-purple-500",
      "pro screen": "bg-purple-600",
    };

    const colorClass = statusMap[status?.toLowerCase()] || "bg-gray-500";

    return (
      <span
        className={`inline-block px-2 py-1 text-xs font-semibold text-white rounded-full ${colorClass}`}
      >
        {status}
      </span>
    );
  };


  const SAMPLING_STAGES = ["Inquiry", "TESTING", "Testing", "Fit", "2nd Fit", "PP", "PP Screen", "RPP", "RPP Screen", "Pro", "PRO", "Pro-Screen", "PRO_SCREEN"];

  const getStyleStatus = (style) => {
    // 1️⃣ Production check
    if (style.productionRecords?.length) return "Pro";
    if (
      style.pro?.date &&
      (style.pro.date.toLowerCase?.() === "done" || !isNaN(Date.parse(style.pro.date)))
    ) {
      return "Pro";
    }

    // 2️⃣ Sampling stages (dynamic & flexible)
    for (let i = SAMPLING_STAGES.length - 1; i >= 0; i--) {
      const stage = SAMPLING_STAGES[i];

      switch (stage) {
        case "TESTING":
          if (style.TESTING?.date || style.testing?.date) return "Testing";
          break;

        case "Fit":
          if (style.FIT?.date) return "Fit";
          break;

        case "2nd Fit":
          if (style.SECOND_FIT?.date) return "2nd Fit";
          break;

        case "PP":
          if (
            style.PP?.date ||
            style.pp?.date ||
            style.Pp?.date
          ) {
            if (
              ["done", "completed"].includes(
                (style.PP?.date || style.pp?.date || style.Pp?.date)?.toLowerCase?.()
              ) ||
              !isNaN(Date.parse(style.PP?.date || style.pp?.date || style.Pp?.date))
            ) {
              return "PP";
            }
          }
          break;

        case "PP Screen":
          if (style.PP?.screen || style.pp_sc?.date) return "PP Screen";
          break;

        case "RPP":
          if (style.RPP?.date) return "RPP";
          break;

        case "RPP Screen":
          if (style.RPP?.screen) return "RPP Screen";
          break;

        default:
          break;
      }
    }

    // 3️⃣ Default
    return "Inquiry";
  };

  const sortByStatusAndDate = (arr) => {
    return [...arr]?.sort((a, b) => {
      const aStatus = getStyleStatus(a);
      const bStatus = getStyleStatus(b);

      const aIndex = SAMPLING_STAGES.indexOf(aStatus) === -1 ? SAMPLING_STAGES.length : SAMPLING_STAGES.indexOf(aStatus);
      const bIndex = SAMPLING_STAGES.indexOf(bStatus) === -1 ? SAMPLING_STAGES.length : SAMPLING_STAGES.indexOf(bStatus);

      if (aIndex !== bIndex) return aIndex - bIndex;

      // Optional: sort by created/updated date (descending)
      const aDate = new Date(a.added_at || a.created_at || 0).getTime();
      const bDate = new Date(b.added_at || b.created_at || 0).getTime();

      return bDate - aDate;
    });
  };



  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-400 h-12 w-12"></div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-400 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-400 rounded"></div>
              <div className="h-4 bg-gray-400 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-extrabold text-gray-900">Styles Overview ✨</h2>
        {
          userInfo?.role === "admin" &&
          <button
            onClick={downloadExcel}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center shadow-lg transition duration-300 ease-in-out"
          >
            <Download className="mr-2 h-5 w-5" />
            Download Excel
          </button>
        }
        <button
          onClick={() => router.push('/styles/create-style')}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center shadow-lg transition duration-300 ease-in-out"
        >
          <Plus className="mr-2 h-5 w-5" />
          Create New Style
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
          <div className="col-span-1 md:col-span-2 lg:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search Style</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="text-gray-400 h-5 w-5" />
              </div>
              <input
                id="search"
                type="text"
                placeholder="Search by style name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="col-span-1">
            <label htmlFor="buyer" className="block text-sm font-medium text-gray-700 mb-1">Buyer</label>
            <select
              id="buyer"
              value={filters.buyer}
              onChange={(e) => handleFilterChange("buyer", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Buyers</option>
              {getUniqueValues("buyer").map((val) => (
                <option key={val} value={val}>
                  {val}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-1">
            <label htmlFor="season" className="block text-sm font-medium text-gray-700 mb-1">Season</label>
            <select
              id="season"
              value={filters.season}
              onChange={(e) => handleFilterChange("season", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Seasons</option>
              {getUniqueValues("season").map((val) => (
                <option key={val} value={val}>
                  {val}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-1">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              id="status"
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              {getUniqueValues("status").map((val) => (
                <option key={val} value={val}>
                  {val}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-1">
            <label htmlFor="fabrication" className="block text-sm font-medium text-gray-700 mb-1">Fabrication</label>
            <select
              id="fabrication"
              value={filters.fabrication}
              onChange={(e) => handleFilterChange("fabrication", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Fabrications</option>
              {getUniqueValues("fabric").map((val) => (
                <option key={val} value={val}>
                  {val}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-1">
            <label htmlFor="factory_name" className="block text-sm font-medium text-gray-700 mb-1">Factory</label>
            <select
              id="factory_name"
              value={filters.factory_name}
              onChange={(e) => handleFilterChange("factory_name", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Factory</option>
              {getUniqueValues("factory_name").map((val) => (
                <option key={val} value={val}>
                  {val}
                </option>
              ))}
            </select>
          </div>
        </div>
        {(search || Object.values(filters).some(f => f)) && (
          <div className="mt-4 text-right">
            <button
              onClick={clearFilters}
              className="text-sm font-semibold text-gray-600 hover:text-red-500 flex items-center justify-end w-max ml-auto"
            >
              <X className="mr-1 h-4 w-4" />
              Clear Filters
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {filteredData?.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg">No styles found matching your criteria. 😟</p>
            <button onClick={clearFilters} className="mt-4 text-blue-500 hover:underline">
              Clear all filters to see all styles.
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">SL</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Buyer</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Season</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Style</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fabrication</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Versions</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Factory</th>
                  {userInfo?.role === "admin" &&
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Screen</th>}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData?.map((item, idx) => (
                  <tr key={item._id.$oid || item._id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{idx + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.buyer}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.season}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer" onClick={() => router.push(`/styles/${item._id}`)}>
                      {item.style}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.fabric}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.version}</td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getStatusBadge(getStyleStatus(item))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.productionRecords?.map((r, idx) => `${idx + 1}: ${r.factory_name}`).join(", ")}
                    </td>


                    {userInfo?.role === "admin" && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {(() => {
                          // ✅ Safely parse prints
                          const printsValue = isNaN(parseInt(item.prints)) ? 0 : parseInt(item.prints);
                          if (printsValue <= 0) {
                            return <div className="text-gray-500 italic">-n/a</div>;
                          }

                          // ✅ PRO-SCREEN Logic
                          let proScreenElement = null;
                          if (Array.isArray(item?.productionRecords)) {
                            const hasFactories =
                              Array.isArray(item?.productionRecords) &&
                              item?.productionRecords.length > 0 &&
                              item?.productionRecords.every(record => !!record.factory_name);

                            const hasProScreenDate = !!item["PRO-SCREEN"]?.date;
                            const proScreenDone =
                              hasFactories && printsValue > 0 && hasProScreenDate;

                            proScreenElement = (
                              <div className={`font-medium ${proScreenDone ? "text-green-600" : "text-orange-600"} flex items-center gap-1`}>
                                {proScreenDone ? <Check size={16} /> : <Clock size={16} />}
                                PRO-SCREEN
                              </div>
                            );
                          }

                          // ✅ PP-SCREEN Logic
                          let ppScreenElement = null;
                          if (item.PP) {
                            const hasPPDate = !!item?.PP?.date;
                            const hasPPScreenDate = !!item["PP-SCREEN"]?.date;
                            const ppScreenDone = hasPPDate && hasPPScreenDate;

                            ppScreenElement = (
                              <div className={`font-medium ${ppScreenDone ? "text-green-600" : "text-orange-600"} flex items-center gap-1`}>
                                {ppScreenDone ? <Check size={16} /> : <Clock size={16} />}
                                PP-SCREEN
                              </div>
                            );
                          }

                          // ✅ Fallback if neither exists
                          if (!proScreenElement && !ppScreenElement) {
                            return <div className="text-gray-500 italic">-n/a</div>;
                          }

                          return (
                            <div className="flex flex-col gap-1">
                              {proScreenElement}
                              {ppScreenElement}
                            </div>
                          );
                        })()}
                      </td>
                    )}








                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => router.push(`/styles/${item._id}`)}
                          className="text-blue-600 hover:text-blue-900 transition duration-150 ease-in-out p-1 rounded-full hover:bg-gray-200"
                          title="View Details"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        {
                          userInfo?.role === "admin" &&
                          <button
                            onClick={() => openDeleteModal(item)}
                            className="text-red-600 hover:text-red-900 transition duration-150 ease-in-out p-1 rounded-full hover:bg-gray-200"
                            title="Delete Style"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal show={deleteModalOpen} onClose={closeDeleteModal}>
        <div className="p-4">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Deletion</h3>
          <p className="text-gray-700 mb-6">Are you sure you want to delete the style <span className="font-semibold">{itemToDelete?.style}</span>? This action cannot be undone.</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={closeDeleteModal}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}