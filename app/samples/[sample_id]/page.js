"use client";

import React, { useState, useEffect } from 'react';

// Utility to format date
function formatDate(dateString) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString();
}

async function getSample(id) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/${id}`, {
    cache: 'no-store', // Prevent caching
  });

  if (!res.ok) {
    throw new Error('Failed to fetch sample');
  }

  const data = await res.json();
  return data.samples;
}

async function updateSample(id, updatedSample) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedSample),
  });

  if (!res.ok) {
    throw new Error('Failed to update sample');
  }

  const data = await res.json();
  return data.samples;
}

export default function SampleDetails({ params }) {
  // Unwrap params using React.use() hook
  const { sample_id } = React.use(params);  // Use the direct params value

  const [sample, setSample] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSample, setEditedSample] = useState({});

  useEffect(() => {
    // Fetch sample details on component mount
    if (sample_id) {
      getSample(sample_id).then(setSample);
    }
  }, [sample_id]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedSample({ ...sample });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedSample((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const updatedSample = await updateSample(sample._id.$oid, editedSample);
      setSample(updatedSample);
      setIsEditing(false);
    } catch (error) {
      alert('Error saving data');
    }
  };

  if (!sample) return <p>Loading...</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-md rounded">
      <h1 className="text-2xl font-bold mb-4">Sample Details</h1>
      <table className="table-auto w-full text-left border">
        <tbody>
          <tr><th>Buyer</th><td>{isEditing ? <input type="text" name="buyer" value={editedSample.buyer || ''} onChange={handleChange} /> : sample.buyer}</td></tr>
          <tr><th>Category</th><td>{isEditing ? <input type="text" name="category" value={editedSample.category || ''} onChange={handleChange} /> : sample.category}</td></tr>
          <tr><th>Style</th><td>{isEditing ? <input type="text" name="style" value={editedSample.style || ''} onChange={handleChange} /> : sample.style}</td></tr>
          <tr><th>Number of Samples</th><td>{isEditing ? <input type="number" name="no_of_sample" value={editedSample.no_of_sample || ''} onChange={handleChange} /> : sample.no_of_sample}</td></tr>
          <tr><th>Shelf</th><td>{isEditing ? <input type="number" name="shelf" value={editedSample.shelf || ''} onChange={handleChange} /> : sample.shelf}</td></tr>
          <tr><th>Division</th><td>{isEditing ? <input type="number" name="division" value={editedSample.division || ''} onChange={handleChange} /> : sample.division}</td></tr>
          <tr><th>Position</th><td>{isEditing ? <input type="number" name="position" value={editedSample.position || ''} onChange={handleChange} /> : sample.position}</td></tr>
          <tr><th>Status</th><td>{isEditing ? <input type="text" name="status" value={editedSample.status || ''} onChange={handleChange} /> : sample.status}</td></tr>
          <tr><th>Season</th><td>{isEditing ? <input type="text" name="season" value={editedSample.season || ''} onChange={handleChange} /> : sample.season}</td></tr>
          <tr><th>Comments</th><td>{isEditing ? <input type="text" name="comments" value={editedSample.comments || ''} onChange={handleChange} /> : sample.comments}</td></tr>
          <tr><th>Availability</th><td>{isEditing ? <input type="text" name="availability" value={editedSample.availability || ''} onChange={handleChange} /> : sample.availability}</td></tr>
          <tr><th>Added By</th><td>{sample.added_by}</td></tr>
          <tr><th>Added At</th><td>{formatDate(sample.added_at?.$date)}</td></tr>
          <tr><th>Released</th><td>{sample.released ? formatDate(sample.released) : '-'}</td></tr>
          <tr><th>Returned At</th><td>{sample.returned_at ? formatDate(sample.returned_at) : '-'}</td></tr>
        </tbody>
      </table>

      <div className="flex justify-end mt-4">
        {isEditing ? (
          <>
            <button onClick={handleSave} className="bg-green-500 text-white px-4 py-2 rounded mr-2">Save</button>
            <button onClick={() => setIsEditing(false)} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
          </>
        ) : (
          <button onClick={handleEdit} className="bg-blue-500 text-white px-4 py-2 rounded">Edit</button>
        )}
      </div>

      {/* Optional: Add taken and returned logs */}
      <h2 className="text-xl font-semibold mt-6">Taken Logs</h2>
      <ul className="list-disc ml-6">
        {sample.taken_logs?.map((log, idx) => (
          <li key={idx}>
            {log.taken_by} - {log.purpose} - {formatDate(log.taken_at?.$date)}
          </li>
        ))}
      </ul>

      <h2 className="text-xl font-semibold mt-4">Returned Logs</h2>
      <ul className="list-disc ml-6">
        {sample.returned_logs?.map((log, idx) => (
          <li key={idx}>
            {log.returned_by} - {formatDate(log.returned_at?.$date)}
          </li>
        ))}
      </ul>

      <h2 className="text-xl font-semibold mt-4">Final Return Log</h2>
      <ul className="list-disc ml-6">
        {sample.returned_log?.map((log, idx) => (
          <li key={idx}>
            {log.returned_by} - {log.purpose || 'N/A'} - {formatDate(log.returned_at?.$date)}
          </li>
        ))}
      </ul>
    </div>
  );
}
