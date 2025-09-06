"use client";

import React, { useState } from "react";
import Loader from "../components/Loader";
import ConfirmationModal from "./ConfirmationModal"; // You can extract this modal as a separate component
import { useAuth } from "../context/AuthContext";
import { useUtilityData } from "../hooks/useUtilityData";

/**
 * Features:
 * - Add, update, delete utilities
 * - Switch between utility types dynamically
 * - Display messages and loading state
 */
export default function UtilityManager() {
  const { userInfo } = useAuth();

  // ------------------------------
  // Local UI State
  // ------------------------------
  const [utilityType, setUtilityType] = useState("category"); // Default utility type
  const [inputValue, setInputValue] = useState("");           // Input field value
  const [editingUtility, setEditingUtility] = useState(null); // Stores the utility being edited
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);     // Stores item to delete

  // ------------------------------
  // Universal hook for fetching/managing utilities
  // ------------------------------
  const {
    data: utilities,
    isLoading,
    message,
    fetchData,
    saveData,
    deleteData,
  } = useUtilityData(utilityType);

  // ------------------------------
  // Utility types configuration for UI
  // ------------------------------
  const utilityTypesConfig = [
    { id: "category", label: "Category", placeholder: "Enter category name" },
    { id: "buyer", label: "Buyer", placeholder: "Enter buyer name" },
    { id: "status", label: "Status", placeholder: "Enter status name" },
    { id: "shelf", label: "Shelf", placeholder: "Enter shelf number (e.g., A1, 101)" },
    { id: "division", label: "Division", placeholder: "Enter division number (e.g., D1, 205)" },
  ];

  const currentConfig = utilityTypesConfig.find((config) => config.id === utilityType);

  // ------------------------------
  // Handlers
  // ------------------------------

  // Add or update utility
  const handleSaveUtility = async () => {
    if (!inputValue.trim()) return;

    await saveData({
      value: inputValue,
      createdBy: userInfo?.name,
      editingItem: editingUtility,
    });

    // Reset input and editing state
    setInputValue("");
    setEditingUtility(null);
  };

  // Prepare edit mode
  const handleEditClick = (utility) => {
    setEditingUtility(utility);
    if (utilityType === "category") setInputValue(utility.cat_name);
    else setInputValue(utility.value);
  };

  // Prepare delete confirmation
  const handleDeleteClick = (utility) => {
    setItemToDelete(utility);
    setShowConfirmModal(true);
  };

  // Confirm deletion
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    await deleteData(itemToDelete._id);
    setShowConfirmModal(false);
    setItemToDelete(null);
  };

  // Cancel deletion
  const cancelDelete = () => {
    setShowConfirmModal(false);
    setItemToDelete(null);
  };

  // ------------------------------
  // Render
  // ------------------------------
  if (isLoading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 w-full max-w-2xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-6 text-center">
          Utility Manager
        </h1>

        {/* ------------------------
            Utility Type Selector
        ------------------------ */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Utility Type:
          </label>
          <select
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={utilityType}
            onChange={(e) => {
              setUtilityType(e.target.value);
              setInputValue("");
              setEditingUtility(null);
            }}
          >
            {utilityTypesConfig.map((type) => (
              <option key={type.id} value={type.id}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* ------------------------
            Add/Edit Utility Section
        ------------------------ */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            {editingUtility ? `Edit ${currentConfig?.label}` : `Add New ${currentConfig?.label}`}
          </h2>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              className="p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-gray-800"
              placeholder={currentConfig?.placeholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <div className="flex gap-4">
              <button
                onClick={handleSaveUtility}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700"
              >
                {editingUtility ? `Update ${currentConfig?.label}` : `Add ${currentConfig?.label}`}
              </button>
              {editingUtility && (
                <button
                  onClick={() => {
                    setEditingUtility(null);
                    setInputValue("");
                  }}
                  className="px-6 py-3 bg-gray-400 text-white font-semibold rounded-lg shadow-md hover:bg-gray-500"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ------------------------
            Existing Utilities List
        ------------------------ */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Existing {currentConfig?.label}s
          </h2>
          {utilities.length === 0 ? (
            <p className="text-gray-600">No {currentConfig?.label}s found. Add one above!</p>
          ) : (
            <ul className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-60 overflow-y-auto">
              {utilities.map((utility) => (
                <li
                  key={utility._id}
                  className="p-3 bg-white rounded-md shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center border border-gray-100"
                >
                  <div className="flex-1">
                    <span className="font-medium">{utility.value}</span>
                  </div>
                  <div className="flex gap-2 mt-2 sm:mt-0">
                    <button
                      onClick={() => handleEditClick(utility)}
                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(utility)}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ------------------------
          Confirmation Modal
      ------------------------ */}
      {showConfirmModal && (
        <ConfirmationModal
          message={`Are you sure you want to delete this ${utilityType}?`}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </div>
  );
}
