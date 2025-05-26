"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import Loader from "./Loader";

// --- Helper Functions for API Calls (kept within the same file) ---

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const apiFetchCategories = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/utilities/categories`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

const apiFetchBuyers = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/utilities/buyers`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

const apiFetchUniqueStatuses = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/samples/unique?fields=status`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

const apiFetchSamplesByLocation = async (shelf, division) => {
  const response = await axios.get(`${API_BASE_URL}/api/samples-by-location?shelf=${shelf}&division=${division}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

const apiSubmitSample = async (sampleData) => {
  const response = await axios.post(`${API_BASE_URL}/api/samples`, sampleData, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// --- InputSampleForm Component ---

const InputSampleForm = () => {
  const { isAuthenticated, userInfo } = useAuth();

  // --- States ---
  const [loading, setLoading] = useState(true);
  const [samplesInLocation, setSamplesInLocation] = useState([]);
  const [loadingSamples, setLoadingSamples] = useState(false);

  // New states for custom buyer/status input
  const [showCustomBuyerInput, setShowCustomBuyerInput] = useState(false);
  const [showCustomStatusInput, setShowCustomStatusInput] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    category: "",
    style: "",
    no_of_sample: "",
    shelf: "",
    division: "",
    position: "",
    status: "ok", // Default status
    comments: "",
    added_at: new Date().toISOString(),
    buyer: "",
    released: ""
  });

  const [options, setOptions] = useState({
    categories: [],
    no_of_samples: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    shelfs: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    divisions: [1, 2, 3],
    statuses: [],
    buyers: []
  });

  // --- Effects ---

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);

      const [categoriesRes, buyersRes, statusesRes] = await Promise.allSettled([
        apiFetchCategories(),
        apiFetchBuyers(),
        apiFetchUniqueStatuses(),
      ]);

      setOptions((prev) => {
        const newOptions = { ...prev };

        if (categoriesRes.status === 'fulfilled') {
          newOptions.categories = categoriesRes.value.categories || categoriesRes.value || [];
        } else {
          toast.error("Failed to load sample categories.");
          console.error("Category fetch error:", categoriesRes.reason);
        }

        if (buyersRes.status === 'fulfilled') {
          const uniqueBuyers = Array.isArray(buyersRes.value.buyers)
            ? [...new Set(buyersRes.value.buyers.map(b => b.name || b))]
            : [];
          newOptions.buyers = uniqueBuyers.map(name => ({ name, _id: name }));
        } else {
          toast.error("Failed to load buyers.");
          console.error("Buyer fetch error:", buyersRes.reason);
        }

        if (statusesRes.status === 'fulfilled') {
          newOptions.statuses = statusesRes.value.values || statusesRes.value || [];
        } else {
          toast.error("Failed to load sample statuses.");
          console.error("Status fetch error:", statusesRes.reason);
        }

        return newOptions;
      });

      setLoading(false);
    };

    fetchInitialData();
  }, [isAuthenticated]);

  useEffect(() => {
    const fetchSamplesForLocation = async () => {
      const { shelf, division } = formData;

      if (String(shelf) && String(division) && !isNaN(parseInt(shelf)) && !isNaN(parseInt(division))) {
        setLoadingSamples(true);
        setSamplesInLocation([]);

        try {
          const res = await apiFetchSamplesByLocation(shelf, division);
          setSamplesInLocation(res.samples || []);
          if (res.samples && res.samples.length > 0) {
            toast.info(`Found ${res.samples.length} samples in Shelf ${shelf}, Division ${division}.`, {
              position: "top-right",
              autoClose: 3000,
            });
          } else {
            toast.info(`No samples found in Shelf ${shelf}, Division ${division}.`, {
              position: "top-right",
              autoClose: 3000,
            });
          }
        } catch (err) {
          toast.error("Failed to fetch samples for this location.");
          console.error("Error fetching samples by location:", err);
          setSamplesInLocation([]);
        } finally {
          setLoadingSamples(false);
        }
      } else {
        setSamplesInLocation([]);
      }
    };

    fetchSamplesForLocation();
  }, [formData.shelf, formData.division, isAuthenticated]);

  // --- Handlers ---

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      let updatedFormData = { ...prev };

      if (name === "buyer") {
        if (value === "ADD_NEW_BUYER") {
          setShowCustomBuyerInput(true);
          updatedFormData.buyer = ""; // Clear buyer when switching to custom input
        } else {
          setShowCustomBuyerInput(false);
          updatedFormData.buyer = value; // Set value from dropdown
        }
      } else if (name === "status") {
        if (value === "ADD_NEW_STATUS") {
          setShowCustomStatusInput(true);
          updatedFormData.status = ""; // Clear status when switching to custom input
        } else {
          setShowCustomStatusInput(false);
          updatedFormData.status = value; // Set value from dropdown
        }
      } else if (name === "category" && value) {
        const cat_values = value.split("—");
        updatedFormData.category = value; // Update category
        // Only auto-fill buyer if custom buyer input is NOT currently shown
        if (!showCustomBuyerInput) {
            updatedFormData.buyer = cat_values[cat_values.length - 1].trim();
        }
      } else {
        // For all other regular inputs, just update the state
        updatedFormData = { ...prev, [name]: value };
      }
      return updatedFormData;
    });
  }, [showCustomBuyerInput, showCustomStatusInput]); // Dependencies for useCallback

  const handleCustomBuyerChange = useCallback((e) => {
      setFormData(prev => ({ ...prev, buyer: e.target.value }));
  }, []);

  const handleCustomStatusChange = useCallback((e) => {
      setFormData(prev => ({ ...prev, status: e.target.value }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Validation for custom inputs
      if (showCustomBuyerInput && !formData.buyer.trim()) {
        toast.error("Please enter a custom buyer name.");
        setLoading(false);
        return;
      }
      if (showCustomStatusInput && !formData.status.trim()) {
        toast.error("Please enter a custom status.");
        setLoading(false);
        return;
      }

      const payload = { ...formData, added_by: userInfo?.username };
      console.log("Submitting formData:", payload);

      const res = await apiSubmitSample(payload);

      if (res.success) {
        toast.success("Sample saved successfully!");
        // Reset form after successful submission
        setFormData({
          date: new Date().toISOString().split("T")[0],
          category: "",
          style: "",
          no_of_sample: "",
          shelf: "",
          division: "",
          position: "",
          status: "ok", // Default status again
          comments: "",
          added_at: new Date().toISOString(),
          buyer: "",
          released: ""
        });
        setSamplesInLocation([]); // Clear samples in location after successful submission
        setShowCustomBuyerInput(false); // Hide custom inputs
        setShowCustomStatusInput(false);
      }
    } catch (err) {
      toast.error("Failed to save sample.");
      console.error("Submission error:", err);
    } finally {
      setLoading(false);
    }
  }, [formData, userInfo, showCustomBuyerInput, showCustomStatusInput]);

  // Show a full-page loader while initial data is being fetched
  if (loading) return <Loader />;

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white text-black shadow rounded grid gap-4 max-w-xl mx-auto">
      {/* Category Dropdown */}
      <label htmlFor="category" className="sr-only">Select Category</label>
      <select
        id="category"
        name="category"
        value={formData.category}
        onChange={handleChange}
        className="border p-2 rounded focus:ring-blue-500 focus:border-blue-500"
        required
      >
        <option value="">Select Category</option>
        {options.categories.map((cat) => (
          <option key={cat._id} value={cat.cat_name + "—" + cat.buyer_name}>
            {cat.cat_name} — {cat.buyer_name}
          </option>
        ))}
      </select>

      {/* Style Input */}
      <label htmlFor="style" className="sr-only">Style</label>
      <input
        id="style"
        type="text"
        name="style"
        value={formData.style}
        onChange={handleChange}
        placeholder="Style"
        className="border p-2 rounded focus:ring-blue-500 focus:border-blue-500"
        required
      />

      {/* No. of Samples Dropdown */}
      <label htmlFor="no_of_sample" className="sr-only">No. of Samples</label>
      <select
        id="no_of_sample"
        name="no_of_sample"
        value={formData.no_of_sample}
        onChange={handleChange}
        className="border p-2 rounded focus:ring-blue-500 focus:border-blue-500"
        required
      >
        <option value="">No. of Samples</option>
        {options.no_of_samples.map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>

      {/* Shelf Dropdown */}
      <label htmlFor="shelf" className="sr-only">Select Shelf</label>
      <select
        id="shelf"
        name="shelf"
        value={formData.shelf}
        onChange={handleChange}
        className="border p-2 rounded focus:ring-blue-500 focus:border-blue-500"
        required
      >
        <option value="">Select Shelf</option>
        {options.shelfs.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {/* Division Dropdown */}
      <label htmlFor="division" className="sr-only">Select Division</label>
      <select
        id="division"
        name="division"
        value={formData.division}
        onChange={handleChange}
        className="border p-2 rounded focus:ring-blue-500 focus:border-blue-500"
        required
      >
        <option value="">Select Division</option>
        {options.divisions.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      {/* Display Samples in Location */}
      {(formData.shelf && formData.division) && (
        <div className="mt-2 mb-4 p-3 bg-gray-100 rounded border border-gray-300">
          {loadingSamples ? (
            <p className="text-center text-gray-700">Loading samples for this location...</p>
          ) : samplesInLocation.length > 0 ? (
            <>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Samples in Shelf {formData.shelf}, Division {formData.division}: Total - {samplesInLocation.length} Packets</h3>
              <ul className="list-disc pl-5 text-gray-700 max-h-40 overflow-y-auto custom-scrollbar">
                {samplesInLocation.map((sample) => (
                  <li key={sample._id.$oid || sample._id}>
                    <strong>Style:</strong> {sample.style} | <strong>Category:</strong> {sample.category} | <strong>Buyer:</strong> {sample.buyer} | <strong>Status:</strong> {sample.status}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-center text-gray-600">No samples found in Shelf {formData.shelf}, Division {formData.division}.</p>
          )}
        </div>
      )}

      {/* Position Input */}
      <label htmlFor="position" className="sr-only">Position</label>
      <input
        id="position"
        name="position"
        type="number"
        value={formData.position}
        onChange={handleChange}
        placeholder="Position"
        className="border p-2 rounded focus:ring-blue-500 focus:border-blue-500"
        required
      />

      {/* Status Dropdown / Custom Status Input */}
      <div key={showCustomStatusInput ? "custom-status-input" : "status-select"}>
        {!showCustomStatusInput ? (
          <>
            <label htmlFor="status" className="sr-only">Select Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="border p-2 rounded focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select Status</option>
              {options.statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
              <option value="ADD_NEW_STATUS">-- Add New Status --</option>
            </select>
          </>
        ) : (
          <>
            <label htmlFor="status" className="sr-only">Enter Custom Status</label>
            <input
              id="status"
              type="text"
              name="status"
              value={formData.status}
              onChange={handleCustomStatusChange}
              placeholder="Enter New Status"
              className="border p-2 rounded focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </>
        )}
      </div>

      {/* Comments Input */}
      <label htmlFor="comments" className="sr-only">Comments</label>
      <input
        id="comments"
        name="comments"
        type="text"
        value={formData.comments}
        onChange={handleChange}
        placeholder="Comments (optional)"
        className="border p-2 rounded focus:ring-blue-500 focus:border-blue-500"
      />

      {/* Buyer Dropdown / Custom Buyer Input */}
      <div key={showCustomBuyerInput ? "custom-buyer-input" : "buyer-select"}>
        {!showCustomBuyerInput ? (
          <>
            <label htmlFor="buyer" className="sr-only">Select Buyer</label>
            <select
              id="buyer"
              name="buyer"
              value={formData.buyer}
              onChange={handleChange}
              className="border p-2 rounded focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select Buyer</option>
              {options.buyers.map((p) => (
                <option key={p._id || p.name} value={p.name || p}>
                  {p.name || p}
                </option>
              ))}
              <option value="ADD_NEW_BUYER">-- Add New Buyer --</option>
            </select>
          </>
        ) : (
          <>
            <label htmlFor="buyer" className="sr-only">Enter Custom Buyer</label>
            <input
              id="buyer"
              type="text"
              name="buyer"
              value={formData.buyer}
              onChange={handleCustomBuyerChange}
              placeholder="Enter New Buyer Name"
              className="border p-2 rounded focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </>
        )}
      </div>

      {/* Released Input */}
      <label htmlFor="released" className="sr-only">Released</label>
      <input
        id="released"
        name="released"
        type="text"
        value={formData.released}
        onChange={handleChange}
        placeholder="Released (optional)"
        className="border p-2 rounded focus:ring-blue-500 focus:border-blue-500"
      />

      {/* Submit Button */}
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
        Submit Sample
      </button>
    </form>
  );
};

export default InputSampleForm;