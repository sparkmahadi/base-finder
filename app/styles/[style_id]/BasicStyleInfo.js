import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const BasicStyleInfo = ({ style, setStyle, isEditing }) => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const styleInfoPoints = [
    "buyer",
    "season",
    "item",
    "style",
    "version",
    "status",
    "fabric",
    "prints",
    "similar",
  ];

  const [showAddProductionForm, setShowAddProductionForm] = useState(false);
  const [productionInfo, setProductionInfo] = useState({
    factory_name: "",
    factory_code: "",
    po_size_range: "",
    totalQuantity: "",
    added_by: "",
    added_at: null,
    updated_by: "",
    updated_at: null,
  });

  const [productionRecords, setProductionRecords] = useState(style?.productionRecords || []);
  const currentUser = "sparkm"; // In a real app, this would come from an authenticated user session

  const handleProductionInfoChange = (e) => {
    const { name, value } = e.target;
    setProductionInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApiUpdate = (action, payload) => {
    const apiUrl = `${API_BASE_URL}/styles/update-style-production/${style._id}`;

    const apiPromise = axios.put(apiUrl, { action, ...payload });

    toast.promise(apiPromise, {
      loading: "Updating record...",
      success: (response) => {
        // Update local state and parent state after successful API call
        let updatedRecords;
        switch (action) {
          case "add":
            updatedRecords = [...productionRecords, response.data.newRecord];
            break;
          case "edit":
            updatedRecords = productionRecords.map((record) =>
              record.added_at === payload.recordToEdit.added_at && record.added_by === payload.recordToEdit.added_by
                ? response.data.updatedRecord
                : record
            );
            break;
          case "delete":
            updatedRecords = productionRecords.filter(
              (record) =>
                !(record.added_at === payload.recordToDelete.added_at && record.added_by === payload.recordToDelete.added_by)
            );
            break;
          default:
            updatedRecords = productionRecords;
        }
        
        setProductionRecords(updatedRecords);
        setStyle((prev) => ({ ...prev, productionRecords: updatedRecords }));
        return response.data.message || "Update successful!";
      },
      error: (err) => {
        console.error("API update error:", err);
        return err.response?.data?.message || "Something went wrong.";
      },
    });
  };

  const handleProductionInfoSubmit = (e) => {
    e.preventDefault();
    const isEditingRecord = productionInfo.added_at !== null;
    const payload = isEditingRecord
      ? { recordToEdit: productionInfo, updatedData: productionInfo }
      : { ...productionInfo, added_by: currentUser };

    handleApiUpdate(isEditingRecord ? "edit" : "add", payload);
    
    // Reset the form regardless of success or failure
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
    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Basic Style Information
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {styleInfoPoints.map((field) => (
          <div key={field} className="flex flex-col">
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
              <p className="text-lg text-gray-900">
                {style?.[field] || "N/A"}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4">
        <label className="text-sm font-semibold text-gray-600 mb-1">
          Description
        </label>
        {isEditing ? (
          <textarea
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            rows="4"
            value={style?.description || ""}
            onChange={(e) =>
              setStyle((prev) => ({ ...prev, description: e.target.value }))
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