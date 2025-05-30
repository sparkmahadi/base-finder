import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Assuming you use axios for API calls
import { toast } from 'react-toastify'; // For sleek notifications

const ConflictResolutionModal = ({
  isOpen,
  onClose,
  conflictingSamples = [],
  proposedLocation, // { shelf, division, position } of the new sample
  onResolved, // Function to call when a resolution is successful
  onCancel // Function to call if the user explicitly cancels the conflict resolution
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedForDeletion, setSelectedForDeletion] = useState({}); // Stores { _id: true/false }
  const [selectedForKeep, setSelectedForKeep] = useState(null); // Stores _id of the sample to keep

  useEffect(() => {
    // Reset selections when the modal opens or conflicting samples change
    setSelectedForDeletion({});
    setSelectedForKeep(null);
  }, [conflictingSamples]);

  if (!isOpen) return null; // Don't render if not open

  const handleCheckboxChange = (sampleId, isChecked) => {
    setSelectedForDeletion(prev => ({
      ...prev,
      [sampleId]: isChecked
    }));
  };

  const handleRadioChange = (sampleId) => {
    setSelectedForKeep(sampleId);
  };

  const resolveConflict = async (resolutionType) => {
    setLoading(true);
    let data = {};
    const { shelf, division, position } = proposedLocation;

    try {
      switch (resolutionType) {
        case 'shiftDown':
          const shiftRes = await axios.patch('/api/samples/increase-positions-by-shelf-division', {
            shelf: shelf,
            division: division,
            currentPosition: position
          });
          if (shiftRes.data.success) {
            toast.success(shiftRes.data.message);
            onResolved(true); // Indicate success, main form can now retry submission
            onClose(); // Close the modal
          } else {
            toast.error(shiftRes.data.message);
          }
          break;

        case 'overwrite':
          if (!window.confirm("Are you sure you want to OVERWRITE existing samples? This will permanently delete them.")) {
            setLoading(false);
            return;
          }
          data = { shelf, division, position };
          const overwriteRes = await axios.post('/api/samples/resolve-conflict', { resolutionType, data });
          if (overwriteRes.data.success) {
            toast.success(overwriteRes.data.message);
            onResolved(true); // Signal main form to proceed with new sample creation
            onClose();
          } else {
            toast.error(overwriteRes.data.message);
          }
          break;

        case 'deleteSelected':
          const sampleIdsToDelete = Object.keys(selectedForDeletion).filter(id => selectedForDeletion[id]);
          if (sampleIdsToDelete.length === 0) {
            toast.info("Please select at least one sample to delete.");
            setLoading(false);
            return;
          }
          if (!window.confirm(`Are you sure you want to DELETE ${sampleIdsToDelete.length} selected samples?`)) {
            setLoading(false);
            return;
          }
          data = { sampleIdsToDelete };
          const deleteRes = await axios.post('/api/samples/resolve-conflict', { resolutionType, data });
          if (deleteRes.data.success) {
            toast.success(deleteRes.data.message);
            onResolved(true);
            onClose();
          } else {
            toast.error(deleteRes.data.message);
          }
          break;

        case 'keepOne':
          if (!selectedForKeep) {
            toast.info("Please select one sample to keep.");
            setLoading(false);
            return;
          }
          if (!window.confirm("Are you sure you want to keep this sample and delete all others at this location?")) {
            setLoading(false);
            return;
          }
          data = { keepSampleId: selectedForKeep, shelf, division, position };
          const keepOneRes = await axios.post('/api/samples/resolve-conflict', { resolutionType, data });
          if (keepOneRes.data.success) {
            toast.success(keepOneRes.data.message);
            onResolved(true);
            onClose();
          } else {
            toast.error(keepOneRes.data.message);
          }
          break;

        default:
          toast.error("Invalid resolution type selected.");
          break;
      }
    } catch (error) {
      toast.error("Failed to resolve conflict: " + (error.response?.data?.message || error.message));
      console.error("Conflict resolution error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[1000]">
      <div className="bg-white p-8 rounded-lg shadow-xl w-11/12 max-w-2xl max-h-[80vh] overflow-y-auto relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl font-bold"
          onClick={onCancel || onClose}
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4 text-red-600 flex items-center">
          Conflict Detected! <span className="ml-2 text-3xl">🚨</span>
        </h2>
        <p className="mb-4 text-gray-700">
          The location **Shelf: <span className="font-semibold text-blue-700">{proposedLocation.shelf}</span>**,
          **Division: <span className="font-semibold text-blue-700">{proposedLocation.division}</span>**,
          **Position: <span className="font-semibold text-blue-700">{proposedLocation.position}</span>**
          is already occupied by the following sample(s):
        </p>

        <ul className="list-none p-0 mt-4 max-h-52 overflow-y-auto border border-gray-200 rounded-md p-4">
          {conflictingSamples.map(sample => (
            <li key={sample._id} className="flex items-center mb-2 pb-2 border-b border-dotted border-gray-200 last:border-b-0 last:mb-0">
              <input
                type="checkbox"
                id={`delete-${sample._id}`}
                checked={!!selectedForDeletion[sample._id]}
                onChange={(e) => handleCheckboxChange(sample._id, e.target.checked)}
                disabled={loading}
                className="mr-3 w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
              />
              <input
                type="radio"
                name="keepSample"
                id={`keep-${sample._id}`}
                checked={selectedForKeep === sample._id}
                onChange={() => handleRadioChange(sample._id)}
                disabled={loading}
                className="mr-3 w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor={`delete-${sample._id}`} className="flex-grow text-gray-800 text-sm">
                <span className="font-medium">Style:</span> {sample.style || 'N/A'},
                <span className="font-medium ml-2">Category:</span> {sample.category || 'N/A'},
                <span className="font-medium ml-2">Sample Date:</span> {new Date(sample.sample_date).toLocaleDateString()}
              </label>
            </li>
          ))}
        </ul>

        <p className="mt-6 mb-4 text-lg font-semibold text-gray-800">How would you like to resolve this conflict for the <span className="text-green-600">new sample</span>?</p>

        <div className="grid grid-cols-1 gap-4 mt-5">
          <button
            className="flex items-center justify-center w-full px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={() => resolveConflict('shiftDown')}
            disabled={loading}
          >
            Shift Existing Samples Down to Make Space
            {loading && <span className="animate-spin h-5 w-5 border-t-2 border-white rounded-full ml-3"></span>}
          </button>
          <button
            className="flex items-center justify-center w-full px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={() => resolveConflict('overwrite')}
            disabled={loading}
          >
            Overwrite Existing (Delete All Current Samples at this Position)
            {loading && <span className="animate-spin h-5 w-5 border-t-2 border-white rounded-full ml-3"></span>}
          </button>
          <button
            className="flex items-center justify-center w-full px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={() => resolveConflict('deleteSelected')}
            disabled={loading || Object.keys(selectedForDeletion).filter(id => selectedForDeletion[id]).length === 0}
          >
            Delete Selected Existing Samples
            {loading && <span className="animate-spin h-5 w-5 border-t-2 border-white rounded-full ml-3"></span>}
          </button>
          <button
            className="flex items-center justify-center w-full px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={() => resolveConflict('keepOne')}
            disabled={loading || !selectedForKeep}
          >
            Keep Selected Existing Sample and Delete Others
            {loading && <span className="animate-spin h-5 w-5 border-t-2 border-white rounded-full ml-3"></span>}
          </button>
        </div>

        <div className="flex justify-end mt-6">
          <button
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={onCancel || onClose}
            disabled={loading}
          >
            Cancel and Don&apos;t Add New Sample
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConflictResolutionModal;