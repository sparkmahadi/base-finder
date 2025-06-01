// components/TakenSamplesList.jsx
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "@/app/context/AuthContext";
import Loader from "@/app/components/Loader";
import DeletedSampleListRow from "./DeletedSampleListRow";

const DeletedSamplesList = () => {
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
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/deleted-samples`);
      setSamples(res.data.samples);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch samples:", err);
      toast.error("Failed to fetch samples");
      setLoading(false);
    }
  };

  const handleRestore = async (sampleId, shelf, division, newPosition) => {
    if (sampleId && shelf && division && newPosition) {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/check-position-availability?shelf=${shelf}&division=${division}&position=${newPosition}`);
      const positionData = res?.data;
      if (positionData?.isPositionEmpty) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/deleted-samples/restore/${sampleId}`, {
            method: "PUT",
            body: JSON.stringify({ position: newPosition, restored_by: userInfo?.username }),
            headers: { "Content-Type": "application/json" },
          });
          const data = await res.json();
          if (data.success) {
            toast.success(data?.message);
            setRefetch((prev) => !prev);
          } else {
            const errorMessage = data.message || "Failed to Restore sample.";
            toast.error("Error: " + errorMessage);
            console.error("Restore error:", data);
          }
        } catch (err) {
          console.error("Restore API call failed:", err);
          toast.error("An unexpected error occurred while restoring the sample.");
        }
      } else {
        const confirm = window.confirm(`${positionData?.message}. Current position is occupied. Do you still want to restore this sample in ${shelf}/${division}/${newPosition}? If not then cancel and change your position`)
        if (confirm) {
          try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/deleted-samples/restore/${sampleId}`, {
              method: "PUT",
              body: JSON.stringify({ position: newPosition, restored_by: userInfo?.username }),
              headers: { "Content-Type": "application/json" },
            });
            const data = await res.json();
            if (data.success) {
              toast.success(data?.message);
              setRefetch((prev) => !prev);
            } else {
              const errorMessage = data.message || "Failed to Restore sample.";
              toast.error("Error: " + errorMessage);
              console.error("Restore error:", data);
            }
          } catch (err) {
            console.error("Restore API call failed:", err);
            toast.error("An unexpected error occurred while restoring the sample.");
          }
        } else{
          console.log('command cancelled');
          toast.info('command cancelled');
        }
      }
    } else {
      toast.info("Proper shelf/division/position data not found")
    }
  };



  // The single handleDelete function now takes the boolean directly
  const handleDeletePermanently = async (sampleToDeleteId) => {
    const confirm = window.confirm("Are you sure to delete this sample permanently?");
    if (confirm) {
      if (!sampleToDeleteId) {
        toast.error("No sample selected for deletion.");
        return;
      }

      setLoading(true);
      try {
        const res = await axios.delete(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/permanent-delete/${sampleToDeleteId}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        console.log(res);
        if (res?.data?.success) {
          toast.success("Sample deleted successfully");
          toast.success(res?.data?.message);
          // setRefetch((prev) => !prev);
        } else {
          toast.error(res?.data?.message);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to delete sample : Frontend Error");
      } finally {
        setLoading(false);
      }
    } else {
      console.log("command cancelled");
    }

  };


  const tableHeadings = [
    "SL",
    "Sample Date",
    "Category",
    "Buyer",
    "Style",
    "Shelf",
    "Division",
    "Position",
    "Availability",
    "Deleted At",
    "Deleted By",
    "Actions",
  ];

  if (!userInfo || !isAuthenticated) {
    return <h2>You are not properly authenticated!!!</h2>;
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
                <DeletedSampleListRow
                  key={sample._id}
                  sample={sample}
                  index={index}
                  userRole={userInfo?.role}
                  handleRestore={handleRestore}
                  handleDeletePermanently={handleDeletePermanently}
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

export default DeletedSamplesList;