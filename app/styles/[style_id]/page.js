"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import AddEditForm from "./AddEditForm";
import { useAuth } from "@/app/context/AuthContext";
import { ChevronLeft, Pencil, Save, X } from "lucide-react";
import { toast } from "react-toastify";
import BasicStyleInfo from "./BasicStyleInfo";
import SamplingCard from "./SamplingCard";

const StyleDetails = () => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const { style_id } = useParams();
  const { userInfo, loading: authLoading } = useAuth();
  const router = useRouter();
  const [style, setStyle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);


  const [categoryOptions, setCategoryOptions] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);

  // Sampling states
  const [customSamplingName, setCustomSamplingName] = useState("");
  const [customSamplingDate, setCustomSamplingDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [samplings, setSamplings] = useState([]);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  }, []);

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

  // const handleSave = async (payload) => {
  //   setLoading(true);
  //   try {
  //     const response = await axios.post(`${API_BASE_URL}/pattern-release-logs`, payload);
  //     const data1 = response.data.data;
  //     const message = response.data.message;
  //     console.log(data1)
  //     toast.info(message);
  //     if (response.data.success) {
  //       payload.pattern_id = data1._id;
  //       const newSampling = { ...payload };
  //       const res2 = await axios.put(`${API_BASE_URL}/styles/update-style-sampling/${style?._id}`, {
  //         action: "add",
  //         ...newSampling,
  //         updated_by: userInfo?.username,
  //         updated_at: new Date(),
  //       });
  //       const data = res2.data;
  //       if (data.success) {
  //         toast.info(data.message);
  //       } else {
  //         toast.info(data.message)
  //       }
  //     }
  //     // resetForm();
  //     setShowAddForm(false);
  //   } catch (error) {
  //     if (error.response?.status === 409) {
  //       toast.error(
  //         "A log with the same Date, Buyer, Style, Category, Body, and Size already exists."
  //       );
  //     } else {
  //       console.error("Error saving log:", error);
  //       toast.error("Failed to save log.");
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Submit updated info to backend

  const handleSave = async (payload) => {
    setLoading(true);
    try {
      // 1. Save pattern release log
      const response = await axios.post(`${API_BASE_URL}/pattern-release-logs`, payload);
      const data1 = response.data.data;
      const message = response.data.message;
      console.log(data1);
      toast.info(message);

      if (response.data.success) {
        payload.pattern_id = data1._id;

        // 2. Add sampling info directly to style document
        const res2 = await axios.put(
          `${API_BASE_URL}/styles/update-style-sampling/${style?._id}`,
          {
            action: "add",
            status: payload.status,   // e.g. "pp"
            date: payload.date,       // the sampling date
            added_by: userInfo?.username,
            added_at: new Date(),
            comments: payload.comments || "",
            pattern_id: data1._id,
            updated_by: userInfo?.username,
            updated_at: new Date(),
          }
        );

        const data = res2.data;
        toast.info(data.message);
      }

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


  const handleSubmit = async () => {
    try {
      const payload = { ...style };

      const res = await axios.put(`${API_BASE_URL}/styles/${style_id}`, payload, { headers: getAuthHeaders() });
      if (res.data.success) {
        toast.success("Style updated successfully!");
      }
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
            onClick={() => {
              if (isEditing) {
                handleSubmit();   // save only when editing
              } else {
                setIsEditing(true); // enter edit mode
              }
            }}
            className={`px-4 py-2 text-white font-semibold rounded-lg shadow-md transition-all duration-300 flex items-center ${isEditing ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700"
              }`}
            disabled={isSubmitting}
          >
            {isEditing ? <Save className="h-5 w-5 mr-2" /> : <Pencil className="h-5 w-5 mr-2" />}
            {isEditing ? "Save" : "Edit Basic Info"}
          </button>

        </div>
      </div>

      <div className="lg:grid lg:grid-cols-2 gap-6">
        <div className="">
          <BasicStyleInfo
            style={style}
            setStyle={setStyle}
            isEditing={isEditing}
          />
          
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

        <div className=""><SamplingCard style={style} setShowAddForm={setShowAddForm} showAddForm={showAddForm} /></div>

      </div>
    </div>
  );
};

export default StyleDetails;
