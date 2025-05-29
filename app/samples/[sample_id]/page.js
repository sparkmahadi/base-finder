// components/SampleDetails.jsx
"use client";

import Loader from '@/app/components/Loader';
import { useAuth } from '@/app/context/AuthContext';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Modal from '../components/Modal';

// Helper function to format dates
function formatDate(dateString) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export default function SampleDetails({ params }) {
  const { sample_id: currentSampleId } = useParams(params);
  const { userInfo, isAuthenticated } = useAuth();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [editedSample, setEditedSample] = useState({});

  const [sample, setSample] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  // --- NEW STATE FOR SHIFTING PREFERENCE ---
  const [shiftPreference, setShiftPreference] = useState('none'); // 'none', 'makeSpace', 'adjustSequence'

  // State for Take Sample Modal
  const [isTakeModalOpen, setIsTakeModalOpen] = useState(false);
  const [takePurpose, setTakePurpose] = useState("");

  // State for Put Back Modal
  const [isPutBackModalOpen, setIsPutBackModalOpen] = useState(false);
  const [putBackPosition, setPutBackPosition] = useState("");
  const [putBackPurpose, setPutBackPurpose] = useState("");

  // State for Delete Confirmation Modal
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);


  useEffect(() => {
    if (currentSampleId) {
      fetchSample(currentSampleId);
    } else {
      setSample(null);
      setLoading(false);
    }
  }, [currentSampleId, refetchTrigger]);

  const fetchSample = async (idToFetch) => {
    setLoading(true);
    try {
      let res;
      try {
        res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/${idToFetch}`);
      } catch (mainError) {
        if (mainError.response && mainError.response.status === 404) {
          try {
            res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/taken/${idToFetch}`);
          } catch (takenError) {
            console.error("Error fetching from taken samples:", takenError);
            throw takenError;
          }
        } else {
          throw mainError;
        }
      }
      setSample(res?.data?.sample);
    } catch (err) {
      toast.error("Failed to fetch sample details.");
      setSample(null);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedSample({
      ...sample, // <-- This spreads the entire 'sample' object, including its '_id'
      sample_date: sample?.sample_date ? new Date(sample.sample_date).toISOString().split('T')[0] : '',
    });
    // Reset shift preference when starting an edit
    setShiftPreference('none');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedSample((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (id) => {
    setLoading(true);
    try {
      // Capture the original position before the update
      const oldPosition = sample?.position;

      const payload = {
        ...editedSample, // This spreads all properties from editedSample
        // Pass the old position and shift preference to the backend
        oldPosition: oldPosition, // Send original string position
        shiftPreference: shiftPreference,
        // Ensure shelf and division are explicitly passed for backend shifting context
        shelf: editedSample.shelf,
        division: editedSample.division,
      };

      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/${id}`,
        payload, // <-- This 'payload' likely contains _id
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // ... rest of the code
    } catch (err) {
      // ...
    } finally {
      // ...
    }
  };

  // --- Take Sample Modal Handlers (unchanged) ---
  const openTakeModal = () => setIsTakeModalOpen(true);
  const closeTakeModal = () => {
    setIsTakeModalOpen(false);
    setTakePurpose("");
  };

  const handleConfirmTake = async () => {
    if (!takePurpose.trim()) {
      toast.error("Please enter a purpose for taking the sample.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/${currentSampleId}/take`,
        { purpose: takePurpose, taken_by: userInfo?.username },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      if (res?.data?.success) {
        toast.success(res.data.message);
        closeTakeModal();
        if (res.data.new_sample_id) {
          router.replace(`/samples/${res.data.new_sample_id}`);
        } else {
          setRefetchTrigger((prev) => prev + 1);
        }
      } else {
        toast.error(res.data.message || "Failed to take sample.");
      }
    } catch (error) {
      console.error("Error taking sample:", error);
      toast.error("Failed to take sample.");
    } finally {
      setLoading(false);
    }
  };

  // --- Put Back Modal Handlers (unchanged) ---
  const openPutBackModal = () => setIsPutBackModalOpen(true);
  const closePutBackModal = () => {
    setIsPutBackModalOpen(false);
    setPutBackPosition("");
    setPutBackPurpose("");
  };

  const handleConfirmPutBack = async () => {
    if (!putBackPosition.trim()) {
      toast.error("Please enter the new position for the sample.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/putback/${currentSampleId}`,
        { position: putBackPosition, returned_by: userInfo?.username, return_purpose: putBackPurpose },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      if (res?.data?.success) {
        toast.success(res.data.message);
        closePutBackModal();
        if (res.data.new_sample_id) {
          router.replace(`/samples/${res.data.new_sample_id}`);
        } else {
          setRefetchTrigger((prev) => prev + 1);
        }
      } else {
        toast.error(res.data.message || "Failed to put back sample.");
      }
    } catch (error) {
      console.error("Error putting back sample:", error);
      toast.error("Failed to put back sample.");
    } finally {
      setLoading(false);
    }
  };

  // --- Delete Confirmation Modal Handlers (unchanged) ---
  const openDeleteConfirmModal = () => setIsDeleteConfirmModalOpen(true);
  const closeDeleteConfirmModal = () => setIsDeleteConfirmModalOpen(false);

  const handleConfirmDelete = async () => {
    setLoading(true);
    try {
      const res = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/${currentSampleId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      if (res?.data?.success) {
        toast.success(res.data.message);
        router.push('/samples');
      } else {
        toast.error(res.data.message || "Failed to delete sample.");
      }
    } catch (error) {
      console.error("Error deleting sample:", error);
      toast.error("Failed to delete sample.");
    } finally {
      closeDeleteConfirmModal();
      setLoading(false);
    }
  };


  if (loading) return <Loader />;

  if (!sample && !loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="text-center p-6 bg-white shadow-lg rounded-lg">
          <p className="text-red-600 text-xl font-semibold">
            No sample data available.
          </p>
          <p className="text-gray-500 mt-2">Please check the sample ID or try again later.</p>
        </div>
      </div>
    );
  }

  // Define editable fields
  const editableFields = [
    { key: 'sample_date', label: 'Sample Date', type: 'date', isDate: true },
    { key: 'buyer', label: 'Buyer', type: 'text' },
    { key: 'category', label: 'Category', type: 'text' },
    { key: 'style', label: 'Style', type: 'text' },
    { key: 'no_of_sample', label: 'Number of Samples', type: 'number' },
    { key: 'shelf', label: 'Shelf', type: 'text' },
    { key: 'division', label: 'Division', type: 'text' },
    { key: 'position', label: 'Position', type: 'text' },
    { key: 'status', label: 'Status', type: 'text' },
    { key: 'season', label: 'Season', type: 'text' },
    { key: 'comments', label: 'Comments', type: 'textarea' },
    { key: 'availability', label: 'Availability', type: 'text' },
  ];

  // Define non-editable fields
  const nonEditableFields = [
    { key: 'added_by', label: 'Added By' },
    { key: 'added_at', label: 'Added At', isDate: true },
    { key: 'released', label: 'Released', isDate: true },
    { key: 'last_taken_at', label: 'Last Taken At', isDate: true },
    { key: 'last_taken_by', label: 'Last Taken By' },
  ];

  const handleReducePositions = (shelf, division) => {
    console.log('under development');
  }
  const handleIncreasePositions = (shelf, division) => {
    console.log('under development');

  }

  return (
    <>
      <div className="p-8 max-w-5xl mx-auto bg-gray-50 min-h-screen">
        <div className="bg-white shadow-xl rounded-lg p-8">
          <h1 className="text-3xl font-extrabold text-gray-800 mb-6 border-b pb-4">
            Sample Details
          </h1>

          {/* Editable Fields Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-700 mb-4">
              {isEditing ? 'Edit Sample Information' : 'General Information'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {editableFields.map((field) => (
                <div key={field.key} className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 mb-1 capitalize">
                    {field.label}
                  </label>
                  {isEditing ? (
                    field.type === 'textarea' ? (
                      <textarea
                        name={field.key}
                        value={editedSample[field.key] ?? ''}
                        onChange={handleChange}
                        className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                        rows="3"
                      />
                    ) : (
                      <>
                        <input
                          type={field.type}
                          name={field.key}
                          value={editedSample[field.key] ?? ''}
                          onChange={handleChange}
                          className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                        />
                        {/* --- NEW: Shifting Options for Position Field --- */}
                        {field.key === 'position' && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-md border border-gray-200">
                            <p className="font-semibold text-gray-700 mb-2">How to adjust other samples?</p>
                            <label className="flex items-center mb-1">
                              <input
                                type="radio"
                                className="form-radio text-blue-600 h-4 w-4"
                                name="shiftOption"
                                value="none"
                                checked={shiftPreference === 'none'}
                                onChange={() => setShiftPreference('none')}
                              />
                              <span className="ml-2 text-gray-800">
                                No shifting (Only update this sample&apos;s position, may cause duplicates)
                              </span>
                            </label>
                            <label className="flex items-center mb-1">
                              <input
                                type="radio"
                                className="form-radio text-blue-600 h-4 w-4"
                                name="shiftOption"
                                value="makeSpace"
                                checked={shiftPreference === 'makeSpace'}
                                onChange={() => setShiftPreference('makeSpace')}
                              />
                              <span className="ml-2 text-gray-800">
                                Shift to make space (Push samples at or after new position down by 1)
                              </span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                className="form-radio text-blue-600 h-4 w-4"
                                name="shiftOption"
                                value="adjustSequence"
                                checked={shiftPreference === 'adjustSequence'}
                                onChange={() => setShiftPreference('adjustSequence')}
                              />
                              <span className="ml-2 text-gray-800">
                                Adjust sequence (Re-order samples between old and new positions)
                              </span>
                            </label>
                          </div>
                        )}
                      </>
                    )
                  ) : (
                    <p className="text-gray-800 font-semibold bg-gray-100 p-2 rounded-md">
                      {field.isDate ? formatDate(sample?.[field.key]) : sample?.[field.key] ?? '-'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons (unchanged) */}
          <div className="flex flex-wrap justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            {isEditing ? (
              <>
                <button
                  onClick={() => handleSave(sample?._id)}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-5 rounded-lg shadow-md transition duration-200 ease-in-out"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-5 rounded-lg shadow-md transition duration-200 ease-in-out"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleEdit}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg shadow-md transition duration-200 ease-in-out"
                >
                  Edit Sample
                </button>
                {sample?.availability !== "no" ? (
                  <button
                    onClick={openTakeModal}
                    className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-sm font-medium shadow-md transition duration-200"
                  >
                    Take
                  </button>
                ) : (
                  <button
                    onClick={openPutBackModal}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 rounded text-sm font-medium shadow-md transition duration-200"
                  >
                    Put Back
                  </button>
                )}
                {userInfo?.role === "admin" && (
                  <>
                    <button
                      onClick={openDeleteConfirmModal}
                      className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-sm font-medium shadow-md transition duration-200"
                    >
                      Delete
                    </button>
                    <button
                      onClick={handleReducePositions}
                      className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-sm font-medium shadow-md transition duration-200"
                    >
                      Reduce Positions
                    </button>
                    <button
                      onClick={handleIncreasePositions}
                      className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-sm font-medium shadow-md transition duration-200"
                    >
                      Increase Positions
                    </button>
                  </>
                )}
              </>
            )}
          </div>

          {/* Non-Editable Fields Section (unchanged) */}
          <div className="mb-8 mt-8">
            <h2 className="text-2xl font-bold text-gray-700 mb-4">
              System Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {nonEditableFields.map((field) => (
                <div key={field.key} className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 mb-1 capitalize">
                    {field.label}
                  </label>
                  <p className="text-gray-800 font-semibold bg-gray-100 p-2 rounded-md">
                    {field.isDate ? formatDate(sample?.[field.key]) : sample?.[field.key] ?? '-'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Taken Logs (unchanged) */}
          <h2 className="text-2xl font-bold text-gray-700 mt-10 mb-4 border-b pb-3">
            Taken Logs
          </h2>
          {sample?.taken_logs && sample.taken_logs.length > 0 ? (
            <ul className="space-y-3 pl-5 text-gray-700">
              {sample.taken_logs.map((log, idx) => (
                <li key={idx} className="bg-gray-50 p-3 rounded-md shadow-sm">
                  <span className="font-semibold">Taken By:</span>{' '}
                  {log.taken_by ?? '-'},{' '}
                  <span className="font-semibold">at:</span>{' '}
                  {formatDate(log.taken_at)},{' '}
                  <span className="font-semibold">Purpose:</span>{' '}
                  {log.purpose || 'N/A'}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No taken logs available.</p>
          )}

          {/* Returned Logs (unchanged) */}
          <h2 className="text-2xl font-bold text-gray-700 mt-10 mb-4 border-b pb-3">
            Returned Logs
          </h2>
          {sample?.returned_log && sample.returned_log.length > 0 ? (
            <ul className="space-y-3 pl-5 text-gray-700">
              {sample.returned_log.map((log, idx) => (
                <li key={idx} className="bg-gray-50 p-3 rounded-md shadow-sm">
                  <span className="font-semibold">Returned By:</span>{' '}
                  {log.returned_by ?? '-'},{' '}
                  <span className="font-semibold">at:</span>{' '}
                  {formatDate(log.returned_at)},{' '}
                  <span className="font-semibold">Returned Position:</span>{' '}
                  {log.position || 'N/A'}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No returned logs available.</p>
          )}
        </div>
      </div>

      {/* Modals (unchanged) */}
      <Modal
        isOpen={isTakeModalOpen}
        onClose={closeTakeModal}
        title="Take Sample"
        footer={
          <>
            <button
              onClick={closeTakeModal}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-4 py-2 rounded-md transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmTake}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition-colors duration-200"
            >
              Confirm Take
            </button>
          </>
        }
      >
        <p className="mb-4 text-gray-700">Please enter the purpose for taking this sample:</p>
        <input
          type="text"
          value={takePurpose}
          onChange={(e) => setTakePurpose(e.target.value)}
          placeholder="e.g., For client meeting, Internal review"
          className="border border-gray-300 w-full p-2.5 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
          aria-label="Purpose for taking sample"
        />
      </Modal>

      <Modal
        isOpen={isPutBackModalOpen}
        onClose={closePutBackModal}
        title="Put Back Sample"
        footer={
          <>
            <button
              onClick={closePutBackModal}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-4 py-2 rounded-md transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmPutBack}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition-colors duration-200"
            >
              Confirm Put Back
            </button>
          </>
        }
      >
        <p className="mb-4 text-gray-700">Please enter the new position for the sample:</p>
        <input
          type="text"
          value={putBackPosition}
          onChange={(e) => setPutBackPosition(e.target.value)}
          placeholder="e.g., A1, Shelf 3, Bin 10"
          className="border border-gray-300 w-full p-2.5 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
          aria-label="New position for sample"
        />
        <p className="mb-4 mt-3 text-gray-700">Please enter the purpose for returning this sample:</p>
        <input
          type="text"
          value={putBackPurpose}
          onChange={(e) => setPutBackPurpose(e.target.value)}
          placeholder="e.g., Returned after use, Incorrectly taken"
          className="border border-gray-300 w-full p-2.5 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
          aria-label="Purpose for returning sample"
        />
      </Modal>

      {userInfo?.role === "admin" && (
        <Modal
          isOpen={isDeleteConfirmModalOpen}
          onClose={closeDeleteConfirmModal}
          title="Confirm Deletion"
          footer={
            <>
              <button
                onClick={closeDeleteConfirmModal}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-4 py-2 rounded-md transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-md transition-colors duration-200"
              >
                Delete
              </button>
            </>
          }
        >
          <p className="text-gray-700">Are you sure you want to delete this sample? This action cannot be undone.</p>
        </Modal>
      )}
    </>
  );
}