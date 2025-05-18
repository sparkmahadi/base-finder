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


export default function SampleDetails({ params }) {
  const { sample_id } = useParams(params);

  const [isEditing, setIsEditing] = useState(false);
  const [editedSample, setEditedSample] = useState({});

  const [sample, setSample] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refetch, setRefetch] = useState(false);

  useEffect(() => {
    if (sample_id) fetchSample();
  }, [refetch]);


  const fetchSample = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/${sample_id}`);
      setSample(res?.data?.sample);
      setLoading(false);
    } catch (err) {
      toast.error("Failed to fetch samples");
      setLoading(false);
    }
  };

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


  if (loading) return <Loader />;

  if (!sample && !loading) {
    return <div className="text-center text-red-600">No sample data available.</div>;
  }


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
                    value={editedSample[field] ?? ''}
                    onChange={handleChange}
                    className="border rounded px-2 py-1 w-full"
                  />
                ) : (
                  sample?.[field] ?? "-"
                )}
              </td>
            </tr>
          ))}
          <tr><th className="border px-4 py-2">Added By</th><td className="border px-4 py-2">{sample?.added_by}</td></tr>
          <tr><th className="border px-4 py-2">Added At</th><td className="border px-4 py-2">{formatDate(sample?.added_at)}</td></tr>
          <tr><th className="border px-4 py-2">Released</th><td className="border px-4 py-2">{formatDate(sample?.released)}</td></tr>
        </tbody>
      </table>

      <div className="flex justify-end mt-4">
        {isEditing ? (
          <>
            <button onClick={() => handleSave(sample?._id)} className="bg-green-600 text-white px-4 py-2 rounded mr-2">Save</button>
            <button onClick={() => setIsEditing(false)} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
          </>
        ) : (
          <button onClick={handleEdit} className="bg-blue-600 text-white px-4 py-2 rounded">Edit</button>
        )}
      </div>

      {/* Logs */}
      <h2 className="text-xl font-semibold mt-6">Taken Logs</h2>
      <ul className="list-disc ml-6">
        {(sample?.taken_logs ?? []).map((log, idx) => (
          <li key={idx}>
            <b>Taken By:</b> {log.taken_by ?? '-'}, <b>at: </b>{formatDate(log.taken_at)}, <b>Purpose:</b> {log.purpose || 'N/A'}
          </li>
        ))}

      </ul>

      <h2 className="text-xl font-semibold mt-4">Returned Logs</h2>
      <ul className="list-disc ml-6">
        {(sample?.returned_log ?? []).map((log, idx) => (
          <li key={idx}>
            <b>Returned By:</b> {log.returned_by ?? '-'}, <b>at: </b>{formatDate(log.returned_at)}, Returned Position: {log.position || 'N/A'}
          </li>
        ))}

      </ul>
    </div>
  );
}
