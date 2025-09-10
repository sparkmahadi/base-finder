"use client"

import Loader from '@/app/components/Loader';
import { useAuth } from '@/app/context/AuthContext';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { toast } from 'react-toastify';
import Modal from '../components/Modal';
import SampleListRow from '../components/SampleListRow';
import { getAuthHeaders } from '@/app/utils/getAuthHeaders';

// Helper function to format dates - Can be a utility or moved out if used broadly
function formatDate(dateString) {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch (e) {
    console.error("Error formatting date:", dateString, e);
    return 'Invalid Date';
  }
}

export default function SampleDetails({ initialSampleData }) { // Receive initial data as a prop
  const { sample_id: currentSampleId } = useParams();
  const { userInfo, isAuthenticated } = useAuth();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [editedSample, setEditedSample] = useState({});

  const [sample, setSample] = useState([]);
  const [divisionalSamples, setDivisionalSamples] = useState([]);
  const [loading, setLoading] = useState(false); // Set to false initially, as data is pre-fetched
  const [error, setError] = useState(initialSampleData?.error || null); // Use pre-fetched error

  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const [showOtherSamplesInDivision, setShowOtherSamplesInDivision] = useState(false);
  const [divisionalSamplesLoading, setDivisionalSamplesLoading] = useState(false); // New loading state for divisional samples

  // --- NEW STATE FOR SHIFTING PREFERENCE ---
  const [shiftPreference, setShiftPreference] = useState('none');

  // State for Take Sample Modal
  const [isTakeModalOpen, setIsTakeModalOpen] = useState(false);
  const [takePurpose, setTakePurpose] = useState("");

  // State for Put Back Modal
  const [isPutBackModalOpen, setIsPutBackModal] = useState(false);
  const [putBackPosition, setPutBackPosition] = useState("");
  const [putBackPurpose, setPutBackPurpose] = useState("");

  // State for Delete Confirmation Modal
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);

  // Effect to handle client-side re-fetching if sample_id changes or refetchTrigger is activated
  useEffect(() => {
    if (currentSampleId) { // Only fetch on client if not pre-rendered
      const fetchSampleOnClient = async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/samples/${currentSampleId}`, {
            headers: getAuthHeaders(),
          });
          if (res.data.success) {
            setSample(res?.data?.sample);
            toast.success("Sample details loaded successfully!");
          }
          else {
            setError(res.data.message || "Error fetching sample details. Please try again.");
            toast.error(res.data.message || "Failed to fetch sample details.");
          }
        } catch (err) {
          console.error("Error fetching from regular samples:", err);
          setError(res.data.message || "Error fetching sample details. Please try again.");
          toast.error(res.data.message || "Failed to fetch sample details.");
          setSample(null);
        } finally {
          setLoading(false);
        }
      };
      fetchSampleOnClient();
    } else if (refetchTrigger > 0) { // Re-fetch on trigger for updates
      const reFetchSample = async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/samples/${currentSampleId}`);
          setSample(res?.data?.sample);
          toast.success("Sample details updated!");
        } catch (err) {
          console.error("Error re-fetching sample:", err);
          setError("Error updating sample details. Please try again.");
          toast.error("Failed to re-fetch sample details.");
        } finally {
          setLoading(false);
        }
      }
      reFetchSample();
    }
  }, [currentSampleId, refetchTrigger, initialSampleData]); // Add initialSampleData to dependency array

  // Memoized fetch for divisional samples to prevent unnecessary re-creation
  const fetchSamplesInDivision = useCallback(async (shelf, division) => {
    setDivisionalSamplesLoading(true);
    setDivisionalSamples([]); // Clear previous data
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/samples/get-by-shelf-and-division?shelf=${shelf}&division=${division}`, {headers: getAuthHeaders()});
      const samplesData = res?.data?.samples;
      if (samplesData && samplesData.length > 0) {
        const sortedSamplesData = samplesData.sort((a, b) => {
          if (a.shelf !== b.shelf) return parseFloat(a.shelf) - parseFloat(b.shelf);
          if (a.division !== b.division) return parseFloat(a.division) - parseFloat(b.division);
          return parseFloat(a.position) - parseFloat(b.position);
        });
        setDivisionalSamples(sortedSamplesData);
        toast.success(`Found ${samplesData.length} samples in Shelf ${shelf}, Division ${division}.`);
      } else {
        toast.info(`No other samples found in Shelf ${shelf}, Division ${division}.`);
      }
    } catch (err) {
      console.error("Error fetching samples in division:", err);
      toast.error("Failed to fetch other samples in this division.");
      setDivisionalSamples([]);
    } finally {
      setDivisionalSamplesLoading(false);
    }
  }, []); // Empty dependency array as it only depends on props/state that are stable or managed

  useEffect(() => {
    if (showOtherSamplesInDivision && sample?.shelf && sample?.division) {
      fetchSamplesInDivision(sample.shelf, sample.division);
    }
  }, [showOtherSamplesInDivision, sample?.shelf, sample?.division, fetchSamplesInDivision]); // Add fetchSamplesInDivision to dependencies

  const handleEdit = () => {
    setIsEditing(true);
    setEditedSample({
      ...sample,
      sample_date: sample?.sample_date ? new Date(sample.sample_date).toISOString().split('T')[0] : '',
    });
    setShiftPreference('none');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedSample((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (id) => {
    setLoading(true);
    try {
      const oldPosition = sample?.position;
      const payload = {
        ...editedSample,
        oldPosition: oldPosition,
        shiftPreference: shiftPreference,
        shelf: editedSample.shelf,
        division: editedSample.division,
      };

      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/samples/${id}`,
        payload,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setSample(res.data.updatedSample);
      setEditedSample(res.data.updatedSample);
      setIsEditing(false);
      setShiftPreference('none');
      toast.success("Sample updated successfully!");
    } catch (err) {
      console.error('Error saving sample:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to save sample. Please try again.');
      toast.error(err.response?.data?.message || 'Failed to save sample. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/samples/${currentSampleId}/take`,
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

  const openPutBackModal = () => setIsPutBackModal(true);
  const closePutBackModal = () => {
    setIsPutBackModal(false);
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
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/samples/putback/${currentSampleId}`,
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

  const openDeleteConfirmModal = () => setIsDeleteConfirmModalOpen(true);
  const closeDeleteConfirmModal = () => setIsDeleteConfirmModalOpen(false);

  const handleConfirmDelete = async () => {
    setLoading(true);
    try {
      const res = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/samples/${currentSampleId}`,
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

  const handleIncreasePositions = async (shelf, division, currentPosition) => {
    setLoading(true);
    try {
      const body = { shelf: parseInt(shelf), division: parseInt(division), currentPosition: parseInt(currentPosition) };
      const res = await axios.patch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/samples/increase-positions-by-shelf-division`, body, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = res?.data;
      if (data?.modifiedCount > 0) {
        toast.success(data?.message || "Positions increased successfully!");
        toast.success(`Total positions modified: ${data?.modifiedCount}`);
        fetchSamplesInDivision(shelf, division); // Re-fetch divisional samples to reflect changes
      } else {
        toast.info(data?.message || "No positions were increased or no data available.");
      }
    } catch (err) {
      console.error("Error increasing positions:", err);
      toast.error("Failed to increase positions.");
    } finally {
      setLoading(false);
    }
  };

  const handleReducePositions = async (shelf, division, currentPosition) => {
    setLoading(true);
    try {
      const body = { shelf: parseInt(shelf), division: parseInt(division), currentPosition: parseInt(currentPosition) };
      const res = await axios.patch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/samples/decrease-positions-by-shelf-division`, body, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = res?.data;
      if (data?.modifiedCount > 0) {
        toast.success(data?.message || "Positions reduced successfully!");
        toast.success(`Total positions modified: ${data?.modifiedCount}`);
        fetchSamplesInDivision(shelf, division); // Re-fetch divisional samples to reflect changes
      } else {
        toast.info(data?.message || "No positions were reduced or no data available.");
      }
    } catch (err) {
      console.error("Error reducing positions:", err);
      toast.error("Failed to reduce positions.");
    } finally {
      setLoading(false);
    }
  };

  const handleShowOtherSamplesInDivision = (shelf, division) => {
    setShowOtherSamplesInDivision(true);
    fetchSamplesInDivision(shelf, division);
  };

  const handleNormalizeConsecutiveDivision = async (shelf, division) => {
    setLoading(true);
    try {
      const body = { shelf: parseInt(shelf), division: parseInt(division) };
      const res = await axios.patch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/samples/normalize-positions-in-division`, body, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = res?.data;
      if (data?.success) {
        toast.success(data?.message || "Division normalized successfully!");
        if (data?.normalizedFieldsUpdated > 0) {
          toast.success(`Total fields normalized: ${data?.normalizedFieldsUpdated}`);
        }
        if (data?.positionsRenumbered > 0) {
          toast.success(`Total positions renumbered: ${data?.positionsRenumbered}`);
        }
        fetchSamplesInDivision(shelf, division); // Re-fetch divisional samples to reflect changes
      } else {
        toast.info(data?.message || "Normalization not needed or no changes made.");
      }
    } catch (err) {
      console.error("Error normalizing division:", err);
      toast.error("Failed to normalize division.");
    } finally {
      setLoading(false);
    }
  };

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
    { key: 'team', label: 'Team' },
  ];

  const tableHeadings = [
    { label: "SL" },
    { label: "Sample Date", key: "sample_date" },
    { label: "Buyer", key: "buyer" },
    { label: "Category", key: "category" },
    { label: "Style", key: "style" },
    { label: "Shelf", key: "shelf" },
    { label: "Division", key: "division" },
    { label: "Position", key: "position" },
    { label: "Availability", key: "availability" },
    { label: "Status", key: "status" },
    { label: "Added by", key: "added_by" },
    { label: "Actions" },
  ];

  console.log(sample)

  if (loading) {
    return <Loader message="Loading sample details..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4">
        <div className="text-center p-8 bg-white shadow-lg rounded-lg border border-red-200">
          <p className="text-red-600 text-xl font-semibold mb-4">Error: {error}</p>
          <p className="text-gray-600 mb-6">We couldn&apos;t load the sample data. Please check your network connection or try again.</p>
          <button
            onClick={() => setRefetchTrigger(prev => prev + 1)} // Trigger re-fetch
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition duration-200 ease-in-out"
          >
            Retry
          </button>
          <button
            onClick={() => router.back()}
            className="ml-4 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg shadow-md transition duration-200 ease-in-out"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!sample) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4">
        <div className="text-center p-8 bg-white shadow-lg rounded-lg border border-yellow-200">
          <p className="text-yellow-700 text-xl font-semibold mb-4">No Sample Found</p>
          <p className="text-gray-600 mb-6">The sample ID might be incorrect or the sample does not exist.</p>
          <button
            onClick={() => router.push('/samples')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition duration-200 ease-in-out"
          >
            Browse All Samples
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='flex justify-center'>
      {/* main division */}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
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

          {/* Action buttons */}
          <div className="flex flex-wrap justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            {isEditing ? (
              <>
                <button
                  onClick={() => handleSave(sample?._id)}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-5 rounded-lg shadow-md transition duration-200 ease-in-out"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-5 rounded-lg shadow-md transition duration-200 ease-in-out"
                  disabled={loading}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleEdit}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg shadow-md transition duration-200 ease-in-out"
                  disabled={loading}
                >
                  Edit Sample
                </button>
                {sample?.availability !== "no" ? (
                  <button
                    onClick={openTakeModal}
                    className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-sm font-medium shadow-md transition duration-200"
                    disabled={loading}
                  >
                    Take
                  </button>
                ) : (
                  <button
                    onClick={openPutBackModal}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 rounded text-sm font-medium shadow-md transition duration-200"
                    disabled={loading}
                  >
                    Put Back
                  </button>
                )}
                {userInfo?.role === "admin" && (
                  <>
                    <button
                      onClick={openDeleteConfirmModal}
                      className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-sm font-medium shadow-md transition duration-200"
                      disabled={loading}
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleReducePositions(sample?.shelf, sample?.division, sample?.position)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded text-sm font-medium shadow-md transition duration-200"
                      disabled={loading}
                    >
                      Reduce Positions
                    </button>
                    <button
                      onClick={() => handleIncreasePositions(sample?.shelf, sample?.division, sample?.position)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded text-sm font-medium shadow-md transition duration-200"
                      disabled={loading}
                    >
                      Increase Positions
                    </button>
                    <button
                      onClick={() => handleShowOtherSamplesInDivision(sample?.shelf, sample?.division)}
                      className="bg-sky-600 hover:bg-sky-700 text-white px-2 py-1 rounded text-sm font-medium shadow-md transition duration-200"
                      disabled={loading}
                    >
                      Show Full Division
                    </button>
                    <button
                      onClick={() => handleNormalizeConsecutiveDivision(sample?.shelf, sample?.division)}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-2 py-1 rounded text-sm font-medium shadow-md transition duration-200"
                      disabled={loading}
                    >
                      Normalize Division
                    </button>
                  </>
                )}
              </>
            )}
          </div>

          {/* Non-Editable Fields Section */}
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

          {/* Taken Logs */}
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

          {/* Returned Logs */}
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

      {/* Side Division for Other Samples */}
      {showOtherSamplesInDivision && (
        <div className="p-8 max-w-2xl w-full bg-white shadow-xl rounded-lg ml-8 self-start sticky top-8">
          <h2 className="text-2xl font-extrabold text-gray-800 mb-6 border-b pb-4">
            Samples in Division {sample?.shelf}-{sample?.division}
          </h2>
          {divisionalSamplesLoading ? (
            <Loader message="Loading other samples in this division..." />
          ) : divisionalSamples.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-sm text-center whitespace-nowrap">
                <thead className="bg-gray-100 text-xs text-gray-700 uppercase">
                  <tr>
                    {tableHeadings?.map(({ label, key }, idx) => (
                      <th key={idx} className="px-3 py-3 border-b-2 border-gray-200 font-semibold lg:max-w-32">
                        <div className="flex flex-col gap-1 items-center justify-center lg:max-w-32">
                          <span className="font-semibold truncate">{label}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {divisionalSamples.map((divSample, idx) => (
                    <SampleListRow
                      key={divSample._id}
                      sample={divSample}
                      index={idx}
                      userRole={userInfo?.role}
                      userInfo={userInfo}
                      // You might need to adjust these handlers if they interact directly with `currentSampleId`
                      // For simplicity, using the original handlers here, but ensure they handle the correct sample ID
                      handleDelete={() => handleConfirmDeleteForDivisional(divSample._id)}
                      handleTake={(id, purpose) => handleConfirmTakeForDivisional(id, purpose)}
                      handlePutBack={(id, newPosition) => handleConfirmPutBackForDivisional(id, newPosition)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 italic">No other samples found in this division.</p>
          )}
          <button
            onClick={() => setShowOtherSamplesInDivision(false)}
            className="mt-6 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-5 rounded-lg shadow-md transition duration-200 ease-in-out"
          >
            Hide Division Samples
          </button>
        </div>
      )}

      {/* Modals */}
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
              disabled={loading}
            >
              {loading ? 'Taking...' : 'Confirm Take'}
            </button>
          </>
        }
      >
        <p className="mb-4 text-gray-700">Please enter a **purpose** for taking this sample:</p>
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
              disabled={loading}
            >
              {loading ? 'Putting Back...' : 'Confirm Put Back'}
            </button>
          </>
        }
      >
        <p className="mb-4 text-gray-700">Please enter the **new position** for the sample:</p>
        <input
          type="text"
          value={putBackPosition}
          onChange={(e) => setPutBackPosition(e.target.value)}
          placeholder="e.g., 1-A-5"
          className="border border-gray-300 w-full p-2.5 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
          aria-label="New position for sample"
        />
        <p className="mt-4 mb-4 text-gray-700">Optional: Enter a **purpose** for putting back the sample:</p>
        <input
          type="text"
          value={putBackPurpose}
          onChange={(e) => setPutBackPurpose(e.target.value)}
          placeholder="e.g., Returned after review"
          className="border border-gray-300 w-full p-2.5 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
          aria-label="Purpose for putting back sample"
        />
      </Modal>

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
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete Sample'}
            </button>
          </>
        }
      >
        <p className="text-gray-700">Are you sure you want to delete sample **{sample?.style}** ({sample?.sample_id})? This action cannot be undone.</p>
      </Modal>
    </div>
  );
}