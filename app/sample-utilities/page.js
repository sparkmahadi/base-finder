"use client"

import React, { useState, useEffect } from 'react';
import axios from 'axios';

// --- Mock API Base URL and Auth Headers ---
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/utilities`; // IMPORTANT: Replace with your actual backend URL

const getAuthHeaders = () => {
  return {}; // Placeholder for actual auth headers
};

// --- Confirmation Modal Component ---
const ConfirmationModal = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
        <p className="text-lg font-semibold mb-4">{message}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Confirm
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main UtilityManager Component ---
export default function UtilityManager() {
  const [utilityType, setUtilityType] = useState('category'); // Default to 'category'
  const [inputValue, setInputValue] = useState('');
  const [categoryStatus, setCategoryStatus] = useState('active'); // For category specific input
  const [categoryTotalSamples, setCategoryTotalSamples] = useState(''); // For category specific input
  const [utilities, setUtilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' }); // type: 'success' or 'error'
  const [editingUtility, setEditingUtility] = useState(null); // Stores the utility object being edited
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null); // Stores the item to be deleted

  // Mock user info for 'createdBy' field
  const userInfo = { name: 'Demo User' };
  const createdBy = userInfo.name;

  // Utility types configuration
  const utilityTypesConfig = [
    { id: 'category', value:'categories', label: 'Category', placeholder: 'Enter category name' },
    { id: 'buyer', value:'buyers', label: 'Buyer', placeholder: 'Enter buyer name' },
    { id: 'status',  value:'statuses',label: 'Status', placeholder: 'Enter status name' },
    { id: 'shelf', label: 'Shelf', value:'shelfs', placeholder: 'Enter shelf number (e.g., A1, 101)' },
    { id: 'division', label: 'Division',  value:'divisions', placeholder: 'Enter division number (e.g., D1, 205)' },
  ];

  // Function to fetch utilities based on selected type
  const fetchUtilities = async (type) => {
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      let endpoint = '';
      if (type === 'category') {
        endpoint = `${API_BASE_URL}/categories`;
      } else {
        endpoint = `${API_BASE_URL}/${type}s`;
      }

      const response = await axios.get(endpoint, {
        headers: getAuthHeaders(),
      });

      if (response.data.success) {
        setUtilities(response.data.data);
      } else {
        setUtilities([]);
        setMessage({ text: response.data.message || `Failed to fetch ${type}s.`, type: 'error' });
      }
    } catch (error) {
      console.error(`Error fetching ${type}s:`, error);
      setUtilities([]);
      setMessage({ text: `Server error fetching ${type}s.`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch utilities whenever utilityType changes
  useEffect(() => {
    fetchUtilities(utilityType);
  }, [utilityType]);

  // Function to handle adding or updating a utility
  const handleSaveUtility = async () => {
    if (!createdBy) {
      setMessage({ text: 'Creator information is missing. Please log in.', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      let payload = {};
      let endpoint = '';
      let method = '';

      if (utilityType === 'category') {
        if (!inputValue.trim() || !categoryStatus.trim() || categoryTotalSamples === '' || categoryTotalSamples === null || categoryTotalSamples === undefined) {
          setMessage({ text: 'Category name, status, and total samples are required.', type: 'error' });
          setLoading(false);
          return;
        }
        endpoint = `${API_BASE_URL}/categories`;
        payload = {
          cat_name: inputValue.trim(),
          status: categoryStatus.trim(),
          totalSamples: Number(categoryTotalSamples),
          createdBy: createdBy,
        };
        if (editingUtility) {
          payload._id = editingUtility._id; // Add ID for update
          method = 'put';
        } else {
          method = 'post';
        }
      } else {
        if (!inputValue.trim()) {
            setMessage({ text: 'Please enter a value.', type: 'error' });
          setLoading(false);
          return;
        }
        endpoint = `${API_BASE_URL}/${utilityType}s`;
        if (utilityType === 'buyer' || utilityType === 'status') {
          payload = { name: inputValue.trim(), createdBy: createdBy };
        } else { // shelf or division
          payload = { number: inputValue.trim(), createdBy: createdBy };
        }
        payload.utility_type = utilityType; // Add utility_type for generic update
        if (editingUtility) {
          payload._id = editingUtility._id; // Add ID for update
          method = 'put';
        } else {
          method = 'post';
        }
      }

      const response = await axios[method](endpoint, payload, { // Use axios[method] for dynamic POST/PUT
        headers: getAuthHeaders(),
      });

      if (response.data.success) {
        setMessage({ text: response.data.message, type: 'success' });
        setInputValue(''); // Clear input on success
        setCategoryStatus('active'); // Reset category specific inputs
        setCategoryTotalSamples('');
        setEditingUtility(null); // Clear editing state
        fetchUtilities(utilityType); // Re-fetch list to show the new/updated item
      } else {
        setMessage({ text: response.data.message || `Failed to ${editingUtility ? 'update' : 'add'} utility.`, type: 'error' });
      }
    } catch (error) {
      console.error(`Error ${editingUtility ? 'updating' : 'adding'} ${utilityType}:`, error);
      setMessage({ text: `Server error ${editingUtility ? 'updating' : 'adding'} ${utilityType}.`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Function to set up editing mode
  const handleEditClick = (utility) => {
    setEditingUtility(utility);
    setMessage({ text: '', type: '' }); // Clear messages
    if (utilityType === 'category') {
      setInputValue(utility.cat_name);
      setCategoryStatus(utility.status);
      setCategoryTotalSamples(utility.totalSamples);
    } else {
      setInputValue(utility.value);
    }
  };

  // Function to handle deletion confirmation
  const handleDeleteClick = (utility) => {
    setItemToDelete(utility);
    setShowConfirmModal(true);
  };

  // Function to perform deletion after confirmation
  const confirmDelete = async () => {
    if (!itemToDelete) return;

    setLoading(true);
    setMessage({ text: '', type: '' });
    setShowConfirmModal(false); // Close modal
    try {
      let endpoint = '';
      if (utilityType === 'category') {
        endpoint = `${API_BASE_URL}/categories/${itemToDelete._id}`;
      } else {
        endpoint = `${API_BASE_URL}/utilities/${utilityType}/${itemToDelete._id}`;
      }

      const response = await axios.delete(endpoint, {
        headers: getAuthHeaders(),
      });

      if (response.data.success) {
        setMessage({ text: response.data.message, type: 'success' });
        fetchUtilities(utilityType); // Re-fetch list
      } else {
        setMessage({ text: response.data.message || 'Failed to delete utility.', type: 'error' });
      }
    } catch (error) {
      console.error(`Error deleting ${utilityType}:`, error);
      setMessage({ text: `Server error deleting ${utilityType}.`, type: 'error' });
    } finally {
      setLoading(false);
      setItemToDelete(null); // Clear item to delete
    }
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
    setItemToDelete(null);
  };

  // Get current utility type config
  const currentConfig = utilityTypesConfig.find(config => config.id === utilityType);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 w-full max-w-2xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-6 text-center">
          Utility Manager
        </h1>

        {/* Utility Type Selector */}
        <div className="mb-6">
          <label htmlFor="utility-type-select" className="block text-sm font-medium text-gray-700 mb-2">
            Select Utility Type:
          </label>
          <select
            id="utility-type-select"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
            value={utilityType}
            onChange={(e) => {
              setUtilityType(e.target.value);
              setInputValue(''); // Clear input when changing type
              setCategoryStatus('active'); // Reset category specific inputs
              setCategoryTotalSamples('');
              setMessage({ text: '', type: '' }); // Clear messages
              setEditingUtility(null); // Exit editing mode
            }}
          >
            {utilityTypesConfig.map((type) => (
              <option key={type.id} value={type.id}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Add/Edit New Utility Section */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            {editingUtility ? `Edit ${currentConfig.value}` : `Add New ${currentConfig.value}`}
          </h2>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              className="p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-gray-800"
              placeholder={currentConfig?.placeholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={loading}
            />

            {utilityType === 'category' && (
              <>
                <input
                  type="text"
                  className="p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-gray-800"
                  placeholder="Enter category status (e.g., active, inactive)"
                  value={categoryStatus}
                  onChange={(e) => setCategoryStatus(e.target.value)}
                  disabled={loading}
                />
                <input
                  type="number"
                  className="p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-gray-800"
                  placeholder="Enter total samples"
                  value={categoryTotalSamples}
                  onChange={(e) => setCategoryTotalSamples(e.target.value)}
                  disabled={loading}
                />
              </>
            )}

            <div className="flex gap-4">
              <button
                onClick={handleSaveUtility}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Saving...' : (editingUtility ? `Update ${currentConfig.value}` : `Add ${currentConfig.value}`)}
              </button>
              {editingUtility && (
                <button
                  onClick={() => {
                    setEditingUtility(null);
                    setInputValue('');
                    setCategoryStatus('active');
                    setCategoryTotalSamples('');
                    setMessage({ text: '', type: '' });
                  }}
                  className="px-6 py-3 bg-gray-400 text-white font-semibold rounded-lg shadow-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </div>
          {message.text && (
            <p className={`mt-4 text-sm font-medium ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {message.text}
            </p>
          )}
          <p className="mt-4 text-xs text-gray-500">
            Created By: <span className="font-semibold">{createdBy}</span> (This value is hardcoded for demo. In production, it comes from auth.)
          </p>
        </div>

        {/* Existing Utilities List */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Existing {currentConfig.value}s
          </h2>
          {loading && utilities.length === 0 ? (
            <p className="text-gray-600">Loading {currentConfig.value}s...</p>
          ) : utilities.length === 0 ? (
            <p className="text-gray-600">No {currentConfig.value}s found. Add one above!</p>
          ) : (
            <ul className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-60 overflow-y-auto">
              {utilities.map((utility) => (
                <li
                  key={utility._id}
                  className="p-3 bg-white rounded-md shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center text-gray-800 text-base border border-gray-100"
                >
                  <div className="flex-1">
                    {utilityType === 'category' ? (
                      <>
                        <span className="font-medium">{utility.cat_name}</span>
                        <p className="text-sm text-gray-600">
                          Status: {utility.status} | Samples: {utility.totalSamples}
                        </p>
                      </>
                    ) : (
                      <span className="font-medium">{utility.value}</span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2 sm:mt-0">
                    <button
                      onClick={() => handleEditClick(utility)}
                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(utility)}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-150 ease-in-out"
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
