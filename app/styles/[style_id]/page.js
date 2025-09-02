"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import AddEditForm from "./AddEditForm";
import { useAuth } from "@/app/context/AuthContext";

const StyleDetails = () => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const { style_id } = useParams();
  const {userInfo, loading: authLoading} = useAuth();
  const router = useRouter();
  const [style, setStyle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState(null);

  
      const [categoryOptions, setCategoryOptions] = useState([]);
      const [statusOptions, setStatusOptions] = useState([]);

  // Sampling states
  const [customSamplingName, setCustomSamplingName] = useState("");
  const [customSamplingDate, setCustomSamplingDate] = useState("");
  const [samplings, setSamplings] = useState([]);

  // Production states
  const [customFactoryName, setCustomFactoryName] = useState("");
  const [productions, setProductions] = useState([]);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  }, []);

  // Fetch style details
  useEffect(() => {
    const fetchStyle = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/styles/${style_id}`,
          { headers: getAuthHeaders() }
        );
        const styleInfo = res.data.data;
        setStyle(styleInfo);

        if (styleInfo.samplings) setSamplings(styleInfo.samplings);
        if (styleInfo.productions) {
          if (Array.isArray(styleInfo.productions)) setProductions(styleInfo.productions);
          else setProductions([styleInfo.productions]);
        }
      } catch (error) {
        console.error("Error fetching style:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStyle();
  }, [style_id, getAuthHeaders, API_BASE_URL]);

  // Add new sampling
  const addSampling = () => {
    if (!customSamplingName || !customSamplingDate) return;
    setSamplings([...samplings, { name: customSamplingName, date: customSamplingDate }]);
    setCustomSamplingName("");
    setCustomSamplingDate("");
  };

      const addNewOption = async (optionType, value) => {
        if (!value) return;

        let setOptions, options, endpoint;

        if (optionType === "buyer") {
            setOptions = setBuyerOptions;
            options = buyerOptions;
            endpoint = "buyers";
        } else if (optionType === "category") {
            setOptions = setCategoryOptions;
            options = categoryOptions;
            endpoint = "categories";
        } else if (optionType === "status") {
            setOptions = setStatusOptions;
            options = statusOptions;
            endpoint = "statuses";
        }

        if (!options.includes(value)) {
            setOptions((prev) => [...prev, value].sort());

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
        }
    };


  // Add new production
  const addProduction = () => {
    if (!customFactoryName) return;
    setProductions([...productions, { factory: customFactoryName }]);
    setCustomFactoryName("");
  };

      const handleSave = async (payload) => {
      setLoading(true);
      try {
        const response = editingLogId
          ? await axios.put(`${API_BASE_URL}/pattern-release-logs/${editingLogId}`, payload)
          : await axios.post(`${API_BASE_URL}/pattern-release-logs`, payload);
  
        if (editingLogId) {
          setLogs((prev) =>
            prev.map((log) => (log._id === editingLogId ? response.data : log))
          );
          toast.success("Log updated successfully!");
        } else {
          setLogs((prev) => [response.data, ...prev]);
          toast.success("Log added successfully!");
        }
        resetForm();
        setShowAddForm(false);
      } catch (error) {
        if (error.response?.status === 409) {
          toast.error(
            "A log with the same Date, Buyer, Style, Category, Body, and Size already exists."
          );
        } else {
          console.error("Error saving log:", error);
          toast.error("Failed to save log.");
        }
      } finally {
        setLoading(false);
      }
    };

  // Submit updated info to backend
  const handleSubmit = async () => {
    try {
      const payload = {
        ...style, // include editable fields
        samplings,
        productions,
      };

      await axios.put(
        `${API_BASE_URL}/styles/${style_id}`,
        payload,
        { headers: getAuthHeaders() }
      );
      alert("Style updated successfully!");
      router.refresh();
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating style:", error);
      alert("Failed to update style.");
    }
  };

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (!style) return <p className="text-center text-red-500">Style not found.</p>;

  return (
    <div className="p-6">
      <button
        onClick={() => router.back()}
        className="mb-4 bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
      >
        ← Back
      </button>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Style Details</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500"
        >
          {isEditing ? "Cancel Edit" : "Edit"}
        </button>
      </div>

      {/* Style Info */}
      <div className="space-y-2 mb-6">
        {["buyer", "season", "style", "versions", "description", "status", "fabrication", "noOfPrinting"].map((field) => (
          <div key={field} className="flex gap-2 items-center">
            <strong className="w-32">{field.charAt(0).toUpperCase() + field.slice(1)}:</strong>
            {isEditing ? (
              <input
                type="text"
                className="border rounded px-2 py-1 flex-1"
                value={style[field] || ""}
                onChange={(e) => setStyle({ ...style, [field]: e.target.value })}
              />
            ) : (
              <span>{style[field]}</span>
            )}
          </div>
        ))}
      </div>

      <button className="bg-amber-700" onClick={() => setShowAddForm(true)}>Add Pattern Release</button>

      {showAddForm &&
        <AddEditForm
          handleSave={handleSave}
          addNewOption={addNewOption}
          buyer={style.buyer}
          categoryOptions={categoryOptions}
          statusOptions={statusOptions}
          userInfo={userInfo}
        />}

      <h2>Sampling and Production Info</h2>

      {/* Samplings */}
      <div className="mb-6">
        <h3 className="font-bold mb-2">Samplings</h3>
        {samplings.length > 0 ? (
          samplings.map((s, idx) => (
            <div key={idx} className="flex gap-3 items-center mb-1">
              <span>{s.name}</span>
              <span>{s.date}</span>
            </div>
          ))
        ) : (
          <p>No samplings recorded.</p>
        )}

        {isEditing && (
          <div className="flex flex-col gap-2 mt-2">
            <input
              type="text"
              className="border rounded px-3 py-1"
              placeholder="New Sampling Name"
              value={customSamplingName}
              onChange={(e) => setCustomSamplingName(e.target.value)}
            />
            <input
              type="date"
              className="border rounded px-3 py-1"
              value={customSamplingDate}
              onChange={(e) => setCustomSamplingDate(e.target.value)}
            />
            <button
              onClick={addSampling}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 mt-1"
            >
              Add Sampling
            </button>
          </div>
        )}
      </div>

      {/* Productions */}
      <div className="mb-6">
        <h3 className="font-bold mb-2">Productions</h3>
        {productions.length > 0 ? (
          productions.map((p, idx) => (
            <div key={idx} className="flex gap-3 items-center mb-1">
              <span>{p.factory}</span>
            </div>
          ))
        ) : (
          <p>No productions recorded.</p>
        )}

        {isEditing && (
          <div className="flex flex-col gap-2 mt-2">
            <input
              type="text"
              className="border rounded px-3 py-1"
              placeholder="New Factory Name"
              value={customFactoryName}
              onChange={(e) => setCustomFactoryName(e.target.value)}
            />
            <button
              onClick={addProduction}
              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 mt-1"
            >
              Add Production
            </button>
          </div>
        )}
      </div>

      {/* Submit */}
      {isEditing && (
        <div>
          <button
            onClick={handleSubmit}
            className="bg-purple-600 text-white px-5 py-2 rounded hover:bg-purple-700"
          >
            Submit Updates
          </button>
        </div>
      )}
    </div>
  );
};

export default StyleDetails;
