"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import AddEditForm from "./AddEditForm";
import { useAuth } from "@/app/context/AuthContext";
import { ChevronLeft, CloudCog, Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

const StyleDetails = () => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const { style_id } = useParams();
  const { userInfo, loading: authLoading } = useAuth();
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [samplings, setSamplings] = useState([]);

  // Production states
  const [customFactoryName, setCustomFactoryName] = useState("");
  const [productions, setProductions] = useState([]);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  }, []);

  const apiFetchStatuses = async () => {

  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/utilities/statuses`, {
          headers: getAuthHeaders(),
        });
        const statuses = response.data.data.map(item => item.value);
        setStatusOptions([...new Set(statuses)].sort());
        toast.success("Data loaded successfully!");
      } catch (error) {
        console.error("Error loading initial data:", error);
        toast.error("Failed to load initial data.");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [getAuthHeaders, API_BASE_URL]);

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
      const response = await axios.post(`${API_BASE_URL}/pattern-release-logs`, payload);
      const data1 = response.data.data;
      const message = response.data.message;
      console.log(data1)
      toast.info(message);
      if (response.data.success) {
        payload.pattern_id = data1._id;
        const sampling = {...payload};
        const res2 = await axios.put(`${API_BASE_URL}/styles/update-style-sampling/${style?._id}`, sampling);
        const data = res2.data;
        if (data.success) {
          toast.info(data.message);
        } else {
          toast.info(data.message)
        }
      }
      // resetForm();
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
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors font-semibold"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to Styles
        </button>
        <div className="flex space-x-2">
          {isEditing && (
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-300 transition-all duration-300 flex items-center"
            >
              <X className="h-5 w-5 mr-2" />
              Cancel
            </button>
          )}
          <button
            onClick={handleSubmit}
            className={`px-4 py-2 text-white font-semibold rounded-lg shadow-md transition-all duration-300 flex items-center ${isEditing ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700"
              }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              <>
                {isEditing ? <Save className="h-5 w-5 mr-2" /> : <Pencil className="h-5 w-5 mr-2" />}
                {isEditing ? "Save" : "Edit"}
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Style Info Card */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Style Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {["style", "buyer", "season", "versions", "status", "fabrication", "noOfPrinting"].map((field) => (
              <div key={field} className="flex flex-col">
                <label className="text-sm font-semibold text-gray-600 mb-1">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={style[field] || ""}
                    onChange={(e) => setStyle({ ...style, [field]: e.target.value })}
                  />
                ) : (
                  <p className="text-lg text-gray-900">{style[field] || "N/A"}</p>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4">
            <label className="text-sm font-semibold text-gray-600 mb-1">Description</label>
            {isEditing ? (
              <textarea
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                rows="4"
                value={style.description || ""}
                onChange={(e) => setStyle({ ...style, description: e.target.value })}
              ></textarea>
            ) : (
              <p className="text-lg text-gray-900">{style.description || "No description provided."}</p>
            )}
          </div>
        </div>

        {/* Sampling & Production Card */}
        <div className="lg:col-span-1 space-y-6">

          <div className="bg-white p-6 rounded-xl shadow-md">

            <h3 className="text-xl font-bold text-gray-800 mb-4">Samplings</h3>
            <ul className="space-y-3">
              {style.sampling.length > 0 ? (
                style.sampling.map((obj, idx) => {
                  const [key, value] = Object.entries(obj)[0];
                  return (
                    <li key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium">
                        <span className="capitalize">{key.replace(/_/g, ' ')}</span>: {value}
                      </p>
                    </li>
                  );
                })
              ) : (
                <p className="text-gray-500">No samplings recorded.</p>
              )}
            </ul>
          </div>


          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Productions</h3>
            <ul className="space-y-3">
              {style.prod.length > 0 ? (
                style.prod.map((obj, idx) => {
                  const [key, value] = Object.entries(obj)[0];
                  return (
                    <li key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium">
                        <span className="capitalize">{key.replace(/_/g, ' ')}</span>: {value}
                      </p>
                    </li>
                  );
                })
              ) : (
                <p className="text-gray-500">No productions recorded.</p>
              )}
            </ul>
          </div>

          <button
            onClick={() => setShowAddForm(prev => !prev)}
            className="w-full flex items-center justify-center py-2 px-4 bg-amber-600 text-white rounded-lg shadow-md hover:bg-amber-700 transition-all duration-300"
          >
            <Eye className="h-5 w-5 mr-2" />
            {showAddForm ? 'Hide Pattern Release Form' : 'Show Pattern Release Form'}
          </button>

          {showAddForm &&
            <AddEditForm
              handleSave={handleSave}
              addNewOption={addNewOption}
              buyer={style.buyer}
              category={style?.item}
              styleCode={style?.style}
              version={style?.version}
              statusOptions={statusOptions}
              userInfo={userInfo}
              styleId={style?._id}
              getAuthHeaders={getAuthHeaders}
              API_BASE_URL={API_BASE_URL}
            />}

        </div>
      </div>
    </div>
  );
};

export default StyleDetails;
