"use client"

import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { getAuthHeaders } from "@/app/utils/getAuthHeaders";
import { Eye } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

const BasicStyleInfo = ({ style, setStyle, isEditing, setShowAddForm, showAddForm }) => {
  const {userInfo} = useAuth();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const styleInfoPoints = [
    "buyer",
    "season",
    "item",
    "style",
    "version",
    "fabric",
    "prints",
    "similar",
    "sampling_update_at",
    "sampling_updated_by",
    "added_at",
    "added_by",
    "team",
  ];

  // Sampling stages for status logic
  const SAMPLING_STAGES = ["TESTING", "Fit", "2nd Fit", "PP", "PP Screen", "RPP", "RPP Screen"];

  // Function to get style status dynamically
  const getStyleStatus = (style) => {
    // 1️⃣ Production check
    if (style.productionRecords?.length) return "Pro";
    if (
      style.pro?.date &&
      (style.pro.date.toLowerCase?.() === "done" || !isNaN(Date.parse(style.pro.date)))
    ) {
      return "Pro";
    }

    // 2️⃣ Sampling stages
    for (let i = SAMPLING_STAGES.length - 1; i >= 0; i--) {
      const stage = SAMPLING_STAGES[i];

      switch (stage) {
        case "TESTING":
          if (style.TESTING?.date || style.testing?.date) return "Testing";
          break;

        case "Fit":
          if (style.fit?.date) return "Fit";
          break;

        case "2nd Fit":
          if (style.second_fit?.date) return "2nd Fit";
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

  // Optional: Status badge component
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

  const [showAddProductionForm, setShowAddProductionForm] = useState(false);
  const [productionInfo, setProductionInfo] = useState({
    factory_name: "",
    factory_code: "",
    po_size_range: "",
    totalQuantity: "",
    updated_by: "",
    updated_at: null,
  });

  const [productionRecords, setProductionRecords] = useState(style?.productionRecords || []);
  const handleProductionInfoChange = (e) => {
    const { name, value } = e.target;
    setProductionInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApiUpdate = async (action, payload) => {
    const apiUrl = `${API_BASE_URL}/styles/update-style-production/${style._id}`;

    try {
      const result = await axios.put(apiUrl, { action, ...payload }, { headers: getAuthHeaders() });

      if (result.data?.success) {
        toast.success(result.data.message);

        setProductionRecords((prev) => {
          switch (action) {
            case "add":
              return [...prev, payload]; // add new record

            case "edit":
              return prev.map((rec) =>
                rec.added_at === payload.recordToEdit.added_at
                  ? { ...rec, ...payload.updatedData, updated_at: new Date().toISOString() }
                  : rec
              );

            case "delete":
              return prev.filter((rec) => rec.added_at !== payload.recordToDelete.added_at);

            default:
              return prev;
          }
        });
      } else {
        toast.info(result.data?.message || "Update failed");
      }
    } catch (error) {
      console.error("Error updating production record:", error);
      toast.error("Something went wrong while updating production records.");
    }
  };


  const handleProductionInfoSubmit = (e) => {
    e.preventDefault();
    const isEditingRecord = productionInfo.added_at !== null;
    const payload = isEditingRecord
      ? {
        recordToEdit: productionInfo,
        updatedData: { ...productionInfo, updated_by: userInfo?.username }, // keep editor info
      }
      : {
        ...productionInfo,
        added_by: userInfo?.username,  // ensure this is added when creating new record
        added_at: new Date().toISOString(),
      };

    handleApiUpdate(isEditingRecord ? "edit" : "add", payload);

    // Reset the form regardless of success or failure
    setProductionInfo({
      factory_name: "",
      factory_code: "",
      po_size_range: "",
      totalQuantity: "",
    });
    setShowAddProductionForm(false);
  };

  const handleEditRecord = (record) => {
    setProductionInfo(record);
    setShowAddProductionForm(true);
  };

  const handleDeleteRecord = (recordToDelete) => {
    handleApiUpdate("delete", { recordToDelete });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Basic Style Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-5 xl:grid-cols-7 gap-x-5 gap-y-15">
        {styleInfoPoints.map((field, idx) => (
          <div key={idx} className="flex flex-col border rounded-lg p-2">
            <label className="text-sm font-semibold text-gray-600 mb-1">
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </label>
            {isEditing ? (
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={style?.[field] || ""}
                onChange={(e) =>
                  setStyle((prev) => ({ ...prev, [field]: e.target.value }))
                }
              />
            ) : (
              <p className=" text-gray-900">
                {style?.[field] || "N/A"}
              </p>
            )}
          </div>
        ))}
        <div className="mt-4">
          <span className="font-semibold text-gray-700 mr-2">Style Status:</span>
          {getStatusBadge(getStyleStatus(style))}
        </div>
      </div>

      <div className="mt-4">
        <label className="text-sm font-semibold text-gray-600 mb-1">
          Description
        </label>
        {isEditing ? (
          <textarea
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            rows="4"
            value={style?.descr || ""}
            onChange={(e) =>
              setStyle((prev) => ({ ...prev, descr: e.target.value }))
            }
          />
        ) : (
          <p className="text-lg text-gray-900">
            {style?.descr || "No description provided."}
          </p>
        )}
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Production Records
        </h3>
        {productionRecords.length > 0 ? (
          <ul className="space-y-4">
            {productionRecords.map((record) => (
              <li
                key={record.added_at}
                className="p-4 border border-gray-200 rounded-lg shadow-sm"
              >
                <p>
                  <strong>Factory:</strong> {record.factory_name} ({record.factory_code})
                </p>
                <p>
                  <strong>Quantity:</strong> {record.totalQuantity}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Added by {record.added_by} on {new Date(record.added_at).toLocaleString()}
                </p>
                {record.updated_at && (
                  <p className="text-sm text-gray-500">
                    Updated by {record.updated_by} on {new Date(record.updated_at).toLocaleString()}
                  </p>
                )}
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => handleEditRecord(record)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteRecord(record)}
                    className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No production records added yet.</p>
        )}
      </div>

      <div className="flex items-center gap-5">
        <button
          onClick={() => {
            setShowAddProductionForm(true);
            setProductionInfo({
              factory_name: "",
              factory_code: "",
              po_size_range: "",
              totalQuantity: "",
              added_by: "",
              added_at: null,
              updated_by: "",
              updated_at: null,
            });
          }}
          className={`mt-6 px-4 py-2 text-white font-semibold rounded-lg shadow-md transition-all duration-300 flex items-center bg-blue-600 hover:bg-blue-700`}
        >
          Add Production Info
        </button>

        <div className="mt-4 lg:flex justify-center items-center gap-6">
          <button
            onClick={() => setShowAddForm((prev) => !prev)}
            className="w-full flex items-center justify-center py-2 px-4 bg-amber-600 text-white rounded-lg shadow-md hover:bg-amber-700 transition-all duration-300"
          >
            <Eye className="h-5 w-5 mr-2" />
            {showAddForm ? "Hide Pattern Release Form" : "Add Pattern Release"}
          </button>
        </div>
      </div>

      {showAddProductionForm && (
        <div>
          <form
            onSubmit={handleProductionInfoSubmit}
            className="mt-6 p-6 border border-gray-200 rounded-xl"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {productionInfo.added_at ? "Edit Production Info" : "Add Production Info"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label
                  htmlFor="factory_name"
                  className="text-sm font-semibold text-gray-600 mb-1"
                >
                  Factory Name
                </label>
                <input
                  type="text"
                  name="factory_name"
                  id="factory_name"
                  value={productionInfo.factory_name}
                  onChange={handleProductionInfoChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex flex-col">
                <label
                  htmlFor="factory_code"
                  className="text-sm font-semibold text-gray-600 mb-1"
                >
                  Factory Code
                </label>
                <input
                  type="text"
                  name="factory_code"
                  id="factory_code"
                  value={productionInfo.factory_code}
                  onChange={handleProductionInfoChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex flex-col">
                <label
                  htmlFor="po_size_range"
                  className="text-sm font-semibold text-gray-600 mb-1"
                >
                  PO Size Range
                </label>
                <input
                  type="text"
                  name="po_size_range"
                  id="po_size_range"
                  value={productionInfo.po_size_range}
                  onChange={handleProductionInfoChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex flex-col">
                <label
                  htmlFor="totalQuantity"
                  className="text-sm font-semibold text-gray-600 mb-1"
                >
                  Total Quantity
                </label>
                <input
                  type="number"
                  name="totalQuantity"
                  id="totalQuantity"
                  value={productionInfo.totalQuantity}
                  onChange={handleProductionInfoChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                {productionInfo.added_at ? "Save Changes" : "Add Record"}
              </button>
              <button
                type="button"
                onClick={() => setShowAddProductionForm(false)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default BasicStyleInfo;