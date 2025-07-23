// components/TakenSamplesList.jsx
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "@/app/context/AuthContext";
import TakenSampleListRow from "./TakenSampleListRow";
import Loader from "@/app/components/Loader";

const TakenSamplesList = () => {
  const { isAuthenticated, userInfo } = useAuth();
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refetch, setRefetch] = useState(false);

  useEffect(() => {
    fetchSamples();
  }, [refetch]);

  const fetchSamples = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/samples/taken-samples`);
      setSamples(res.data.samples);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch samples:", err);
      toast.error("Failed to fetch samples");
      setLoading(false);
    }
  };

  const handlePutBack = async (sampleId, newPosition) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/samples/putback/${sampleId}`, {
        method: "PUT",
        body: JSON.stringify({ position: newPosition, returned_by: userInfo?.username }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data?.message);
        setRefetch((prev) => !prev);
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

  const tableHeadings = [
    "SL",
    "Sample Date",
    "Category",
    "Style",
    "No. of Sample",
    "Shelf",
    "Division",
    "Position",
    "Last Taken At",
    "Last Taken By",
    "Actions",
  ];

  if (!userInfo || !isAuthenticated) {
    return <Loader />;
  }

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="max-w-screen-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Taken Samples</h2>
      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="min-w-full border-collapse text-sm text-center">
          {/* Adjusted Header Styling */}
          <thead className="bg-gray-200 text-gray-700 uppercase tracking-wider font-semibold">
            <tr>
              {tableHeadings?.map((head) => (
                <th key={head} className="px-4 py-3 border-b border-gray-300">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {samples?.length > 0 ? (
              samples.map((sample, index) => (
                <TakenSampleListRow
                  key={sample._id}
                  sample={sample}
                  index={index}
                  userRole={userInfo?.role}
                  handlePutBack={handlePutBack}
                />
              ))
            ) : (
              <tr>
                <td colSpan={tableHeadings.length} className="text-center p-6 text-gray-500 text-base">
                  No samples are currently taken.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TakenSamplesList;