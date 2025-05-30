'use client';

import axios from 'axios';
import React, { useState } from 'react';

export default function PositionConflictChecker() {
  const [shelf, setShelf] = useState('');
  const [division, setDivision] = useState('');
  const [conflicts, setConflicts] = useState([]);
  const [selectedStrategy, setSelectedStrategy] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCheckConflicts = async () => {
    setLoading(true);
    setMessage('');
    setConflicts([]);

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples-conflict`, {shelf: Number(shelf), division: Number(division)})

      console.log(response.data);
      if (response.ok && data.conflicts) {
        setConflicts(data.conflicts);
      } else {
        setMessage(data.message || 'No conflicts found.');
      }
    } catch (error) {
      setMessage('Error checking conflicts.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStrategySubmit = () => {
    if (!selectedStrategy) {
      setMessage('Please select a resolution strategy.');
      return;
    }

    // Later you can send selectedStrategy to a separate controller to handle resolution.
    alert(`Selected strategy: ${selectedStrategy}`);
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Check Position Conflicts</h2>

      <div className="mb-4">
        <label>Shelf:</label>
        <input
          type="number"
          value={shelf}
          onChange={(e) => setShelf(e.target.value)}
          className="border p-2 ml-2"
        />
        <label className="ml-4">Division:</label>
        <input
          type="number"
          value={division}
          onChange={(e) => setDivision(e.target.value)}
          className="border p-2 ml-2"
        />
        <button
          onClick={handleCheckConflicts}
          className="bg-blue-600 text-white px-4 py-2 ml-4 rounded"
        >
          {loading ? 'Checking...' : 'Check Conflicts'}
        </button>
      </div>

      {message && <p className="text-red-500 mb-4">{message}</p>}

      {conflicts.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Conflicts Detected:</h3>
          {conflicts.map((conflict) => (
            <div key={conflict.position} className="border p-2 mb-2">
              <p className="font-medium">Position: {conflict.position}</p>
              <ul className="ml-4 list-disc">
                {conflict.documents.map((doc) => (
                  <li key={doc._id}>
                    Style: {doc.style}, Category: {doc.category}, Status: {doc.status}, Buyer: {doc.buyer}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <h4 className="font-semibold mt-4 mb-2">Choose Resolution Strategy:</h4>
          <div className="space-y-2">
            <label>
              <input
                type="radio"
                name="strategy"
                value="manual_select"
                onChange={(e) => setSelectedStrategy(e.target.value)}
              />
              <span className="ml-2">Manual Select Conflicting Items</span>
            </label>
            <br />
            <label>
              <input
                type="radio"
                name="strategy"
                value="auto_renumber"
                onChange={(e) => setSelectedStrategy(e.target.value)}
              />
              <span className="ml-2">Auto Renumber All Positions</span>
            </label>
            <br />
            <label>
              <input
                type="radio"
                name="strategy"
                value="skip_conflicts"
                onChange={(e) => setSelectedStrategy(e.target.value)}
              />
              <span className="ml-2">Ignore Conflicts</span>
            </label>
          </div>

          <button
            onClick={handleStrategySubmit}
            className="bg-green-600 text-white px-4 py-2 mt-4 rounded"
          >
            Submit Resolution Strategy
          </button>
        </div>
      )}
    </div>
  );
}
