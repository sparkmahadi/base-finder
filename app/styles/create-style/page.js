"use client";
import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAuth } from "@/app/context/AuthContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function StyleBasicForm() {
  const router = useRouter();
  const { userInfo } = useAuth();

  const [formData, setFormData] = useState({
    buyer: "",
    season: "",
    style: "",
    version: "",
    descr: "",
    item: "",
    status: "",
    fabric: "",
    prints: "",
  });

  // Sampling + Production
  const [selectedSampling, setSelectedSampling] = useState("");
  const [samplingDate, setSamplingDate] = useState("");
  const [customSamplingName, setCustomSamplingName] = useState("");
  const [customSamplingDate, setCustomSamplingDate] = useState("");

  const [selectedFactory, setSelectedFactory] = useState("");
  const [customFactoryName, setCustomFactoryName] = useState("");

  // Options
  const [buyerOptions, setBuyerOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);

  const [seasonOptions, setSeasonOptions] = useState([]);
  const [fabricationOptions, setFabricationOptions] = useState([
    "SJ 180gsm",
    "Rib 200gsm",
    "PK 220gsm",
  ]);
  const [printingOptions, setPrintingOptions] = useState([0, 1, 2, 3, 4, 5]);

  // Custom fields
  const [customFields, setCustomFields] = useState([]);

  // Auth headers
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  }, []);

  // Fetch buyers
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

  // Existing API calls
  const apiFetchCategories = async () => {
    const response = await axios.get(`${API_BASE_URL}/utilities/categories`, {
      headers: getAuthHeaders(),
    });
    if (response.data.success) {
      const data = response.data.data.map((item) => item.value);
      console.log(response.data)
      setItemOptions(data);
    } else {
      toast.info(response.data.message);
    }
  };

  const apiFetchSeasons = async () => {
    const response = await axios.get(`${API_BASE_URL}/utilities/seasons`, {
      headers: getAuthHeaders(),
    });
    if (response.data.success) {
      const data = response.data.data.map((item) => item.value);
      setSeasonOptions(data);
    } else {
      toast.info(response.data.message);
    }
  };

  const apiFetchFabrications = async () => {
    const response = await axios.get(`${API_BASE_URL}/utilities/fabrications`, {
      headers: getAuthHeaders(),
    });
    if (response.data.success) {
      const data = response.data.data.map((item) => item.value);
      setFabricationOptions(data);
    } else {
      toast.info(response.data.message);
    }
  };

  useEffect(() => {
    apiFetchBuyers();
    apiFetchCategories();
    apiFetchSeasons();
    apiFetchFabrications();
  }, []);

  // Handle form field change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Save new option to DB
  const addNewOption = async (optionType, value) => {
    console.log(optionType, value)
    if (!value) return;

    let endpoint = "";
    if (optionType === "buyer") endpoint = "buyers";
    if (optionType === "item") endpoint = "categories";
    if (optionType === "status") endpoint = "statuses";
    if (optionType === "season") endpoint = "seasons";
    if (optionType === "fabrication") endpoint = "fabrications";

    try {
      await axios.post(`${API_BASE_URL}/utilities/${endpoint}`, {
        value, createdBy: userInfo?.username
      }, {
        headers: getAuthHeaders(),
      });
      console.log(`Saved new ${optionType}: ${value}`);
    } catch (err) {
      console.error(`Error saving ${optionType}:`, err);
      toast.error(`Failed to save new ${optionType} to database.`);
    }
  };


  // Add new dropdown option
  const handleAddOption = async (type) => {
    const newOption = prompt(`Enter new ${type}:`);
    if (!newOption) return;

    // Update local state
    if (type === "buyer") setBuyerOptions((prev) => [...prev, newOption]);
    if (type === "season") setSeasonOptions((prev) => [...prev, newOption]);
    if (type === "fabrication") setFabricationOptions((prev) => [...prev, newOption]);
    if (type === "item") setItemOptions((prev) => [...prev, newOption]);

    // Persist to DB
    await addNewOption(type, newOption);
  };

  // Add custom field
  const handleAddField = () => {
    const fieldName = prompt("Enter new field name:");
    if (!fieldName) return;
    setCustomFields((prev) => [...prev, fieldName]);
    setFormData((prev) => ({ ...prev, [fieldName]: "" }));
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    await addNewOption("buyer", formData.buyer);
    await addNewOption("item", formData.item);

    const payload = { ...formData };
    console.log(payload);
    try {
      const res = await axios.post(`${API_BASE_URL}/styles`, payload, {
        headers: getAuthHeaders(),
      });

      console.log("Response from server:", res.data);
      alert("Form submitted successfully!");
      router.push("/styles");
    } catch (err) {
      console.error("Error submitting form:", err);
      alert("Failed to submit form!");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-md rounded-2xl">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Fill Up Style Info
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

        {/* Item */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-1">item</label>
          <div className="flex gap-2">
            <select
              name="item"
              value={formData.item}
              onChange={handleChange}
              className="border rounded-lg p-2 flex-1"
            >
              <option value="">-- Select item --</option>
              {itemOptions.map((item, idx) => (
                <option key={idx} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => handleAddOption("item")}
              className="px-2 bg-green-500 text-white rounded-lg"
            >
              +
            </button>
          </div>
        </div>


        {/* Versions */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-1">Versions</label>
          <input
            type="text"
            name="version"
            value={formData.version}
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
            name="descr"
            value={formData.descr}
            onChange={handleChange}
            className="border rounded-lg p-2"
          />
        </div>

        {/* Fabrication */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-1">
            Fabrication
          </label>
          <div className="flex gap-2">
            <select
              name="fabric"
              value={formData.fabric}
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
            name="prints"
            value={formData.prints}
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

      <button
        onClick={() => router.push("/styles/create-style/excel-upload")}
        className="mt-4 px-4 py-2 bg-gray-600 text-white rounded"
      >
        Upload Excel
      </button>
    </div>
  );
}
