"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "@/app/context/AuthContext";
import TakenSampleListRow from "./TakenSampleList";

const TakenSamplesList = () => {
  const { isAuthenticated, userInfo } = useAuth();
  const [samples, setSamples] = useState([]);
  const [refetch, setRefetch] = useState(false);

  useEffect(() => {
    fetchSamples();
  }, [refetch]);

  const fetchSamples = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/taken-samples`);
      setSamples(res.data.samples);
    } catch (err) {
      toast.error("Failed to fetch samples");
    }
  };

  const handlePutBack = async (sampleId, newPosition) => {
    console.log(sampleId);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/putback/${sampleId}`, {
        method: "PUT",
        body: JSON.stringify({ position: newPosition, returned_by: userInfo?.username }),
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data?.message);
        setSamples((prev) => prev.filter((s) => s._id !== sampleId));
        setRefetch(!refetch);
      } else {
        alert("Error: " + data.message);
      }
      // Refresh sample list if needed
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    }
  };


  const tableHeadings = [
    "SL", "Date", "Category", "Style", "No. of sample", "Shelf", "Division", "Position", "Last Taken at", "Last Taken By", "Actions",
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <table className="min-w-full bg-white border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            {tableHeadings?.map((head) => (
              <th key={head} className="py-2 px-4 border-b font-medium">
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {samples?.length > 0 ?
            samples
              .map((sample, index) => (
                <TakenSampleListRow
                  key={sample._id}
                  sample={sample}
                  index={index}
                  handlePutBack={handlePutBack}
                />
              ))
            :
            <tr><td><p>No samples are available.</p></td></tr>}
        </tbody>
      </table>
    </div>
  );
};

export default TakenSamplesList;
