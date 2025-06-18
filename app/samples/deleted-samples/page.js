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
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false); // New state for confirmation

  useEffect(() => {
    fetchSamples();
  }, [refetch]);

  const fetchSamples = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/deleted-samples`
      );
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
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/check-position-availability?shelf=${shelf}&division=${division}&position=${newPosition}`
      );
      const positionData = res?.data;
      if (positionData?.isPositionEmpty) {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/deleted-samples/restore/${sampleId}`,
            {
              method: "PUT",
              body: JSON.stringify({
                position: newPosition,
                restored_by: userInfo?.username,
              }),
              headers: { "Content-Type": "application/json" },
            }
          );
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
        const confirm = window.confirm(
          `${positionData?.message}. Current position is occupied. Do you still want to restore this sample in ${shelf}/${division}/${newPosition}? If not then cancel and change your position`
        );
        if (confirm) {
          try {
            const res = await fetch(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/deleted-samples/restore/${sampleId}`,
              {
                method: "PUT",
                body: JSON.stringify({
                  position: newPosition,
                  restored_by: userInfo?.username,
                }),
                headers: { "Content-Type": "application/json" },
              }
            );
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
          console.log("command cancelled");
          toast.info("command cancelled");
        }
      }
    } else {
      toast.info("Proper shelf/division/position data not found");
    }
  };

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
          setRefetch((prev) => !prev); // Refresh the list after deletion
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

  // New function to handle deleting all samples permanently
  const handleDeleteAllPermanently = async () => {
    const confirm = window.confirm(
      "Are you absolutely sure you want to permanently delete ALL deleted samples? This action cannot be undone."
    );
    if (confirm) {
      setLoading(true);
      try {
        const res = await axios.delete(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/permanent-delete-all`, // This endpoint needs to be implemented on your backend
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        if (res?.data?.success) {
          toast.success(res?.data?.message);
          setRefetch((prev) => !prev); // Refresh the list after deletion
        } else {
          toast.error(res?.data?.message);
        }
      } catch (err) {
        toast.error(
          err.response?.data?.message ||
            "Failed to delete all samples: Frontend Error"
        );
      } finally {
        setLoading(false);
      }
      setShowDeleteAllConfirm(false); // Hide confirmation after action
    } else {
      console.log("Delete all command cancelled");
      setShowDeleteAllConfirm(false); // Hide confirmation if cancelled
    }
  };

  const tableHeadings = [
    "SL",
    "Sample Date",
    "Buyer",
    "Category",
    "Style",
    "Shelf",
    "Division",
    "Position",
    "Availability",
    "Status",
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
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Taken Samples
      </h2>
      <div className="flex justify-end mb-4">
        {/* Delete All Samples Button */}
        {samples.length > 0 && userInfo?.role === 'admin' && ( // Only show if samples exist and user is admin
          <button
            onClick={() => setShowDeleteAllConfirm(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out"
          >
            Delete All Deleted Samples
          </button>
        )}
      </div>

      {/* Confirmation Modal/Prompt for Delete All */}
      {showDeleteAllConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <p className="text-lg font-semibold mb-4">
              Are you absolutely sure you want to permanently delete ALL deleted
              samples?
            </p>
            <p className="text-red-600 font-bold mb-6">This action cannot be undone.</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleDeleteAllPermanently}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md"
              >
                Yes, Delete All
              </button>
              <button
                onClick={() => setShowDeleteAllConfirm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
                <td
                  colSpan={tableHeadings.length}
                  className="text-center p-6 text-gray-500 text-base"
                >
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