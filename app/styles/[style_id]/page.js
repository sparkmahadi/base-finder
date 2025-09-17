"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import AddEditForm from "./AddEditForm";
import { useAuth } from "@/app/context/AuthContext";
import { ChevronLeft, CloudCog, Pencil, Save, X } from "lucide-react";
import { toast } from "react-toastify";
import BasicStyleInfo from "./BasicStyleInfo";
import SamplingCard from "./SamplingCard";
import { useSampleData } from "@/app/hooks/useSampleData";
import SampleListRow from "@/app/samples/components/SampleListRow";
import CloneStyleForm from "@/app/components/CloneStyleForm";

const StyleDetails = () => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const { style_id } = useParams();
  const { userInfo, loading: authLoading } = useAuth();
  const router = useRouter();
  const [style, setStyle] = useState(null);
  console.log("style", style);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const {
    searchedSamples,
    isLoading,
    isMutating,
    isSearching,
    refreshSamples,
    handleDelete,
    handleTake,
    handlePutBack,
    handleSearchSample,
    setIsSearching,
  } = useSampleData([]);



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
          },
          { headers: getAuthHeaders() }
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
    console.log("updated style", style)
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

  // const [isSearching, setIsSearching] = useState(false);
  const [showSearchForm, setShowSearchForm] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchClick = ((styleCode) => {
    setSearchTerm(styleCode);
    setShowSearchForm(true);
    handleSearchSample(styleCode);

  });

  const [showCloneStyleForm, setShowCloneStyleForm] = useState(false);

  const handleCopyStyle = () => {
    setShowCloneStyleForm(!showCloneStyleForm);
  }

  const tableHeadings = useMemo(() => [ // Memoize this array as well
    { label: "SL" },
    { label: "Sample Date", key: "sample_date" },
    { label: "Buyer", key: "buyer" },
    { label: "Category", key: "category" },
    { label: "Style", key: "style" },
    { label: "Shelf", key: "shelf" },
    { label: "Division", key: "division" },
    { label: "Position", key: "position" },
    { label: "Status", key: "status" },
    { label: "Availability", key: "availability" },
    { label: "Last Purpose", key: "last_purpose" },
    { label: "Added by", key: "added_by" },
  ], []);

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
          {isEditing || <button className={`px-4 py-2 text-white font-semibold rounded-lg shadow-md transition-all duration-300 flex items-center ${isEditing ? "bg-purple-400 hover:bg-purple-700" : "bg-blue-400 hover:bg-blue-700"
            }`}
            onClick={handleCopyStyle}
          >{showCloneStyleForm ? "Cancel Cloning" : "Clone This Style"}</button>}

        </div>
      </div>

      <div className="">
        {showCloneStyleForm &&
          <CloneStyleForm style={style}/>
        }


        <div className="">
          <BasicStyleInfo
            style={style}
            setStyle={setStyle}
            isEditing={isEditing}
            showAddForm={showAddForm}
            setShowAddForm={setShowAddForm}
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

        <div className="">
          <SamplingCard style={style} setShowAddForm={setShowAddForm} showAddForm={showAddForm} />
        </div>


      </div>

      <button
        onClick={() => handleSearchClick(style.style)}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-md text-base transition-colors duration-200 shadow-sm hover:shadow-md flex-grow md:flex-grow-0"
        disabled={isSearching}
      >
        {isSearching ? "Searching..." : "Search the Sample"}
      </button>



      {
        showSearchForm &&
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <input
            type="text"
            placeholder="Search by style, category, or added by..."
            className="border border-gray-300 p-2.5 rounded-md w-full md:flex-1 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") handleSearchClick(e.target.value);
            }}
            aria-label="Search samples"
          />

          <div>
            <table className="min-w-full border-collapse text-sm text-center whitespace-nowrap">
              <thead className="bg-gray-100 text-xs text-gray-700 uppercase">
                <tr>
                  {/* Only render table headings for display, not necessarily all export fields */}
                  {tableHeadings.map(({ label, key }, idx) => (
                    <th key={idx} className="px-3 py-3 border-b-2 border-gray-200 font-semibold lg:max-w-32">
                      <div className="flex flex-col gap-1 items-center justify-center lg:max-w-32">
                        <span className="font-semibold truncate">{label}</span>
                      </div>
                    </th>
                  ))}
                  {/* Add a specific Actions column heading back for display */}
                  <th className="px-3 py-3 border-b-2 border-gray-200 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {searchedSamples?.length > 0 ? (
                  searchedSamples.map((sample, idx) => (
                    <SampleListRow
                      key={sample._id}
                      sample={sample}
                      index={idx}
                      userRole={userInfo?.role}
                      userInfo={userInfo}
                      handleDelete={handleDelete}
                      handleTake={(id, purpose) => handleTake(id, purpose, userInfo)}
                      handlePutBack={(sampleId, newPosition, returnPurpose) => handlePutBack(sampleId, newPosition, returnPurpose, userInfo)}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={tableHeadings.length + 1} className="text-center p-6 text-gray-500 text-base"> {/* +1 for the Actions column */}
                      No samples found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

          </div>
        </div>

      }


    </div>
  );
};

export default StyleDetails;
