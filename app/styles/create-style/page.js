"use client";
import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL; // <-- change to your API

export default function StyleBasicForm() {

  const router = useRouter();
  const [formData, setFormData] = useState({
    buyer: "",
    season: "",
    style: "",
    versions: "",
    description: "",
    status: "",
    fabrication: "",
    noOfPrinting: "",
  });

  // Options state
  const [buyerOptions, setBuyerOptions] = useState([]);
  const [seasonOptions, setSeasonOptions] = useState(["SS25", "SS26", "FW25"]);
  const [fabricationOptions, setFabricationOptions] = useState([
    "SJ 180gsm",
    "Rib 200gsm",
    "PK 220gsm",
  ]);
  const [statusOptions, setStatusOptions] = useState([
    "active",
    "closed",
    "sampling",
  ]);
  const [printingOptions, setPrintingOptions] = useState([0, 1, 2, 3, 4, 5]);

  // Custom user fields
  const [customFields, setCustomFields] = useState([]);

  // Auth headers
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
    };
  }, []);

  // API Fetch for buyers
  const apiFetchBuyers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/utilities/buyers`, {
        headers: getAuthHeaders(),
      });
      const data = response.data.data.map((item) => item.value);
      setBuyerOptions(data);
    } catch (err) {
      console.error("Error fetching buyers:", err);
    }
  };

  useEffect(() => {
    apiFetchBuyers();
  }, []);

  // Handle field change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Add new custom option for a dropdown
  const handleAddOption = (type) => {
    const newOption = prompt(`Enter new ${type}:`);
    if (!newOption) return;
    if (type === "buyer") setBuyerOptions((prev) => [...prev, newOption]);
    if (type === "season") setSeasonOptions((prev) => [...prev, newOption]);
    if (type === "fabrication") setFabricationOptions((prev) => [...prev, newOption]);
    if (type === "status") setStatusOptions((prev) => [...prev, newOption]);
  };

  // Add custom field
  const handleAddField = () => {
    const fieldName = prompt("Enter new field name:");
    if (!fieldName) return;
    setCustomFields((prev) => [...prev, fieldName]);
    setFormData((prev) => ({ ...prev, [fieldName]: "" }));
  };

  // Submit form
  const handleSubmit = async(e) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);

    try {
      // POST request to backend
      const res = await axios.post(`${API_BASE_URL}/styles`, formData, {headers: getAuthHeaders()});

      console.log("Response from server:", res.data);
      alert("Form submitted successfully!");
    } catch (err) {
      console.error("Error submitting form:", err);
      alert("Failed to submit form!");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-md rounded-2xl">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Fill Up Basic Style Info
      </h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        {/* Buyer */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-1">Buyer</label>
          <div className="flex gap-2">
            <select
              name="buyer"
              value={formData.buyer}
              onChange={handleChange}
              className="border rounded-lg p-2 flex-1"
            >
              <option value="">-- Select Buyer --</option>
              {buyerOptions.map((buyer, idx) => (
                <option key={idx} value={buyer}>
                  {buyer}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => handleAddOption("buyer")}
              className="px-2 bg-green-500 text-white rounded-lg"
            >
              +
            </button>
          </div>
        </div>

        {/* Season */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-1">Season</label>
          <div className="flex gap-2">
            <select
              name="season"
              value={formData.season}
              onChange={handleChange}
              className="border rounded-lg p-2 flex-1"
            >
              <option value="">-- Select Season --</option>
              {seasonOptions.map((season, idx) => (
                <option key={idx} value={season}>
                  {season}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => handleAddOption("season")}
              className="px-2 bg-green-500 text-white rounded-lg"
            >
              +
            </button>
          </div>
        </div>

        {/* Style */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-1">Style</label>
          <input
            type="text"
            name="style"
            value={formData.style}
            onChange={handleChange}
            className="border rounded-lg p-2"
          />
        </div>

        {/* Versions */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-1">Versions</label>
          <input
            type="text"
            name="versions"
            value={formData.versions}
            onChange={handleChange}
            className="border rounded-lg p-2"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col col-span-2">
          <label className="text-sm font-medium text-gray-600 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="border rounded-lg p-2"
          />
        </div>

        {/* Status */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-1">Status</label>
          <div className="flex gap-2">
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="border rounded-lg p-2 flex-1"
            >
              <option value="">-- Select Status --</option>
              {statusOptions.map((status, idx) => (
                <option key={idx} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => handleAddOption("status")}
              className="px-2 bg-green-500 text-white rounded-lg"
            >
              +
            </button>
          </div>
        </div>

        {/* Fabrication */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-1">
            Fabrication
          </label>
          <div className="flex gap-2">
            <select
              name="fabrication"
              value={formData.fabrication}
              onChange={handleChange}
              className="border rounded-lg p-2 flex-1"
            >
              <option value="">-- Select Fabrication --</option>
              {fabricationOptions.map((fab, idx) => (
                <option key={idx} value={fab}>
                  {fab}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => handleAddOption("fabrication")}
              className="px-2 bg-green-500 text-white rounded-lg"
            >
              +
            </button>
          </div>
        </div>

        {/* No. of Printing */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-1">
            No. of Printing
          </label>
          <select
            name="noOfPrinting"
            value={formData.noOfPrinting}
            onChange={handleChange}
            className="border rounded-lg p-2"
          >
            <option value="">-- Select --</option>
            {printingOptions.map((num, idx) => (
              <option key={idx} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>

        {/* Custom Fields */}
        {customFields.map((field, idx) => (
          <div key={idx} className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">
              {field}
            </label>
            <input
              type="text"
              name={field}
              value={formData[field] || ""}
              onChange={handleChange}
              className="border rounded-lg p-2"
            />
          </div>
        ))}

        {/* Add field button */}
        <div className="col-span-2 flex justify-start mt-2">
          <button
            type="button"
            onClick={handleAddField}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg"
          >
            + Add Custom Field
          </button>
        </div>

        {/* Submit */}
        <div className="col-span-2 flex justify-end mt-4">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            Submit
          </button>
        </div>
      </form>

      <button onClick={()=>router.push('/styles/create-style/excel-upload')}>Upload Excel</button>
    </div>
  );
}
