'use client';

import { useAuth } from '@/app/context/AuthContext';
// Assuming SampleListRow can handle displaying individual samples
import SampleListRow from '@/app/samples/components/SampleListRow';
import axios from 'axios';
import React, { useState } from 'react';
import { toast } from 'react-toastify';

export default function PositionConflictChecker() {
  const { userInfo } = useAuth();
  const [shelf, setShelf] = useState('');
  const [division, setDivision] = useState('');
  const [conflictingPositions, setConflictingPositions] = useState([]); // Array of conflict groups
  const [selectedStrategy, setSelectedStrategy] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  // State to manage whether we're doing a specific check or an all check
  const [checkingAll, setCheckingAll] = useState(false);

  // You might not need setRefetch here if SampleListRow handles its own state for individual samples
  // For now, assuming it's for forcing re-render in other parts of the app after take/put back
  // If not used, you can remove it. For this component's scope, it's not directly needed for conflict display.
  const [refetch, setRefetch] = useState(false); // Used in handleTake/handlePutBack

  const handleTake = async (id, purpose) => {
    setLoading(true);
    const body = {
      taken_by: userInfo?.username,
      purpose,
      taken_at: new Date().toISOString(),
    };

    try {
      const res = await axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/${id}/take`, body, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res?.data?.success) {
        setRefetch((prev) => !prev); // Trigger re-render of SampleListRow if it depends on refetch
        toast.success(res?.data?.message);
        // After taking a sample, you might want to re-check conflicts for the current shelf/division
        // or remove the taken sample from the displayed conflicts.
        // For simplicity, let's re-run conflict check if specific shelf/division was active.
        if (!checkingAll && shelf && division) {
             handleCheckConflicts(Number(shelf), Number(division), false); // Re-check specific if current
        } else if (checkingAll) {
             handleCheckConflicts(null, null, true); // Re-check all if current
        }

      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to take sample");
    } finally {
      setLoading(false);
    }
  };

  const handlePutBack = async (sampleId, newPosition) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/putback/${sampleId}`, {
        method: "PUT",
        body: JSON.stringify({ position: newPosition, returned_by: userInfo?.username }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data?.message);
        setRefetch((prev) => !prev); // Trigger re-render
        // After putting back, re-check conflicts
        if (!checkingAll && shelf && division) {
             handleCheckConflicts(Number(shelf), Number(division), false); // Re-check specific if current
        } else if (checkingAll) {
             handleCheckConflicts(null, null, true); // Re-check all if current
        }
      } else {
        const errorMessage = data.message || "Failed to put back sample.";
        toast.error("Error: " + errorMessage);
        console.error("Put back error:", data);
      }
    } catch (err) {
      console.error("Put back API call failed:", err);
      toast.error("An unexpected error occurred while putting back the sample.");
    }
  };

  // Modified handleCheckConflicts to accept optional shelf/division and an 'all' flag
  const handleCheckConflicts = async (
    targetShelf = null,
    targetDivision = null,
    checkAllFlag = false
  ) => {
    setLoading(true);
    setMessage('');
    setConflictingPositions([]);
    setCheckingAll(checkAllFlag); // Set internal state for current mode

    let requestBody = {};
    let clientValidationPassed = true;
    let userFriendlyMessage = '';

    if (!checkAllFlag) { // Only validate if not checking all
      // Use shelf/division from state if not provided as arguments (i.e., from button click)
      const currentShelf = targetShelf !== null ? targetShelf : Number(shelf);
      const currentDivision = targetDivision !== null ? targetDivision : Number(division);

      if (isNaN(currentShelf) || isNaN(currentDivision) || shelf === '' || division === '') {
        userFriendlyMessage = 'Please enter valid numbers for Shelf and Division, or click "Check All Conflicts".';
        clientValidationPassed = false;
      } else {
        requestBody = { shelf: currentShelf, division: currentDivision };
      }
    }

    if (!clientValidationPassed && !checkAllFlag) {
        setMessage(userFriendlyMessage);
        toast.error(userFriendlyMessage);
        setLoading(false);
        return;
    }


    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples-conflict`,
        requestBody // Send empty object for "check all", or {shelf, division}
      );

      console.log("API Response Data:", response.data);

      const { message: apiMessage, conflicts } = response.data;

      if (conflicts && conflicts.length > 0) {
        setConflictingPositions(conflicts); // Set the array of conflict groups
        toast.info("Conflicts found!");
      } else {
        setMessage(apiMessage || 'No conflicts found.'); // Default message if API message is missing
        toast.info(apiMessage || "No conflicts found.");
      }
    } catch (error) {
      console.error('Error checking conflicts:', error.response?.data || error.message);
      setMessage(error.response?.data?.message || 'Error checking conflicts.');
      toast.error(error.response?.data?.message || 'Error checking conflicts.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Check Position Conflicts</h2>

      <div className="mb-6 bg-gray-50 p-4 rounded-md">
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <label className="text-gray-700 font-medium">Shelf:</label>
          <input
            type="number"
            value={shelf}
            onChange={(e) => setShelf(e.target.value)}
            className="border border-gray-300 p-2 rounded-md w-full sm:w-auto focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., 3 (optional)"
          />
          <label className="text-gray-700 font-medium">Division:</label>
          <input
            type="number"
            value={division}
            onChange={(e) => setDivision(e.target.value)}
            className="border border-gray-300 p-2 rounded-md w-full sm:w-auto focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., 1 (optional)"
          />
          <button
            onClick={() => handleCheckConflicts(null, null, false)} // Specific check
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-md shadow-md transition-colors duration-200 w-full sm:w-auto"
            disabled={loading}
          >
            {loading ? 'Checking...' : 'Check Specific'}
          </button>
          <button
            onClick={() => handleCheckConflicts(null, null, true)} // Check all
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded-md shadow-md transition-colors duration-200 w-full sm:w-auto"
            disabled={loading}
          >
            {loading ? 'Checking All...' : 'Check All Conflicts'}
          </button>
        </div>
        { (shelf || division) && (shelf === '' || division === '' || isNaN(Number(shelf)) || isNaN(Number(division))) && (
          <p className="text-sm text-gray-500 mt-2 text-center">
            Enter both Shelf and Division for a specific check, or leave both empty for an &quot;All Conflicts&quot; check.
          </p>
        )}
      </div>

      {message && <p className="text-red-600 bg-red-100 p-3 rounded-md mb-4 text-center">{message}</p>}

      {conflictingPositions?.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-3 text-gray-800">Conflicts Detected: {conflictingPositions.length}</h3>
          {conflictingPositions.map((conflictGroup, index) => (
            <div key={index} className="border border-yellow-300 bg-yellow-50 p-4 rounded-md mb-4 shadow-sm">
              <p className="font-bold text-yellow-800 mb-2">
                {/* Dynamically display shelf/division based on the conflict group */}
                Conflict in Shelf: {conflictGroup.shelf || 'N/A'}, Division: {conflictGroup.division || 'N/A'}, Position: {conflictGroup.conflictingPosition} ({conflictGroup.numberOfConflicts} items)
              </p>
              <h4 className="text-md font-semibold text-gray-700 mb-2">Conflicting Samples:</h4>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Style</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sample Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added By</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {conflictGroup?.conflictingSamples?.map((sample, idx) => (
                    // SampleListRow is likely expecting a prop like 'sample'
                    // Ensure SampleListRow is designed to be used within a <table> or adjust rendering
                    <SampleListRow
                      key={sample._id?.$oid || sample._id} // Use robust key
                      sample={sample}
                      index={idx} // index might be used for alternating row styles or similar
                      userRole={userInfo?.role}
                      userInfo={userInfo}
                      handleTake={handleTake}
                      handlePutBack={handlePutBack}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}