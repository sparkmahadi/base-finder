"use client";

import Loader from '@/app/components/Loader';
import axios from 'axios';
import { useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

function formatDate(dateString) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString();
}

async function getSample(id) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/${id}`, {
    cache: 'no-store',
  });

  if (!res.ok) throw new Error('Failed to fetch sample');

  const data = await res.json();
  return data.samples;
}

export default function SampleDetails({ params }) {
  const { sample_id } = useParams(params);

  const [sample, setSample] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSample, setEditedSample] = useState({});

  useEffect(() => {
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
    setEditedSample((prev) => ({ ...prev, [name]: value }));
  };

const handleSave = async (id) => {
  try {
    const res = await axios.put(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/${id}`,
      editedSample,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );

    if (res?.data?.success) {
      setSample((prev) => ({ ...prev, ...editedSample }));
      toast.success(res?.data?.message);
      setIsEditing(false);
    } else {
      toast.info(res?.data?.message);
    }
  } catch (err) {
    console.error(err);
    toast.error("Failed to update sample");
  }
};


  if (!sample) return <Loader />;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-md rounded">
      <h1 className="text-2xl font-bold mb-4">Sample Details</h1>
      <table className="table-auto w-full text-left border">
        <tbody>
          {[
            'buyer',
            'category',
            'style',
            'no_of_sample',
            'shelf',
            'division',
            'position',
            'status',
            'season',
            'comments',
            'availability'
          ].map((field) => (
            <tr key={field}>
              <th className="border px-4 py-2 capitalize">{field.replace('_', ' ')}</th>
              <td className="border px-4 py-2">
                {isEditing ? (
                  <input
                    name={field}
                    value={editedSample[field] || ''}
                    onChange={handleChange}
                    className="border rounded px-2 py-1 w-full"
                  />
                ) : (
                  sample[field]
                )}
              </td>
            </tr>
          ))}
          <tr><th className="border px-4 py-2">Added By</th><td className="border px-4 py-2">{sample.added_by}</td></tr>
          <tr><th className="border px-4 py-2">Added At</th><td className="border px-4 py-2">{formatDate(sample.added_at)}</td></tr>
          <tr><th className="border px-4 py-2">Released</th><td className="border px-4 py-2">{formatDate(sample.released)}</td></tr>
        </tbody>
      </table>

      <div className="flex justify-end mt-4">
        {isEditing ? (
          <>
            <button onClick={()=>handleSave(sample?._id)} className="bg-green-600 text-white px-4 py-2 rounded mr-2">Save</button>
            <button onClick={() => setIsEditing(false)} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
          </>
        ) : (
          <button onClick={handleEdit} className="bg-blue-600 text-white px-4 py-2 rounded">Edit</button>
        )}
      </div>

      {/* Logs */}
      <h2 className="text-xl font-semibold mt-6">Taken Logs</h2>
      <ul className="list-disc ml-6">
        {sample.taken_logs?.map((log, idx) => (
          <li key={idx}>
            Taken By: {log.taken_by}, for: {log.purpose || 'N/A'}, at: {formatDate(log.taken_at)}
          </li>
        ))}
      </ul>

      <h2 className="text-xl font-semibold mt-4">Returned Logs</h2>
      <ul className="list-disc ml-6">
        {sample.returned_log?.map((log, idx) => (
          <li key={idx}>
            {log.returned_by} - {log.purpose || 'N/A'} - {formatDate(log.returned_at)}
          </li>
        ))}
      </ul>
    </div>
  );
}
