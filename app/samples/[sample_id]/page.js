import React from 'react';

// Utility to format date
function formatDate(dateString) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString();
}

async function getSample(id) {
  const res = await fetch(`http://localhost:5000/api/samples/${id}`, {
    cache: 'no-store', // Prevent caching
  });

  if (!res.ok) {
    throw new Error('Failed to fetch sample');
  }

  const data = await res.json();
  return data.samples;
}

export default async function SampleDetails({ params }) {
  const { sample_id } = params;
  const sample = await getSample(sample_id);

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-md rounded">
      <h1 className="text-2xl font-bold mb-4">Sample Details</h1>
      <table className="table-auto w-full text-left border">
        <tbody>
          <tr><th>Buyer</th><td>{sample.buyer}</td></tr>
          <tr><th>Category</th><td>{sample.category}</td></tr>
          <tr><th>Style</th><td>{sample.style}</td></tr>
          <tr><th>Number of Samples</th><td>{sample.no_of_sample}</td></tr>
          <tr><th>Shelf</th><td>{sample.shelf}</td></tr>
          <tr><th>Division</th><td>{sample.division}</td></tr>
          <tr><th>Position</th><td>{sample.position}</td></tr>
          <tr><th>Status</th><td>{sample.status}</td></tr>
          <tr><th>Season</th><td>{sample.season}</td></tr>
          <tr><th>Comments</th><td>{sample.comments}</td></tr>
          <tr><th>Availability</th><td>{sample.availability}</td></tr>
          <tr><th>Added By</th><td>{sample.added_by}</td></tr>
          <tr><th>Added At</th><td>{formatDate(sample.added_at?.$date)}</td></tr>
          <tr><th>Last Taken By</th><td>{sample.last_taken_by}</td></tr>
          <tr><th>Last Taken At</th><td>{formatDate(sample.last_taken_at?.$date)}</td></tr>
          <tr><th>Last Returned By</th><td>{sample.last_returned_by}</td></tr>
          <tr><th>Last Returned At</th><td>{formatDate(sample.last_returned_at?.$date)}</td></tr>
          <tr><th>Returned At</th><td>{formatDate(sample.returned_at?.$date)}</td></tr>
        </tbody>
      </table>

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
