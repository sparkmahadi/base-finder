// components/SampleListRow.jsx
"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import Modal from "./Modal"; // Changed import from TakingModal to the reusable Modal component
import axios from "axios";
import { toast } from "react-toastify";

const SampleListRow = ({ userRole, sample, index, handleTake, handleDelete, handlePutBack, userInfo }) => {
  const router = useRouter();
  const [isTakeModalOpen, setIsTakeModalOpen] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(false);

  // State for Put Back Modal
  const [isPutBackModalOpen, setIsPutBackModalOpen] = useState(false);
  const [putBackPosition, setPutBackPosition] = useState("");
  const [putBackPurpose, setPutBackPurpose] = useState("");

  const renderCell = (name, value) => {
    if ((name === "taken_at" || name === "added_at" || name.includes("date")) && value) {
      try {
        const date = new Date(value);
        return format(date, "PP");
      } catch (err) {
        return value; // Return original value if date parsing fails
      }
    }
    return value || "-";
  };

  const renderTd = (name, value, extra = "") => (
    <td className={`py-3 px-3 border border-gray-200 text-sm break-words ${extra} max-w-20`} title={value}>
      {renderCell(name, value)}
    </td>
  );

  const openTakeModal = () => setIsTakeModalOpen(true);
  const closeTakeModal = () => {
    setIsTakeModalOpen(false);
    setPurpose(""); // Clear purpose on close
  };

  const openDeleteConfirmModal = () => setIsDeleteConfirmModalOpen(true);
  const closeDeleteConfirmModal = () => setIsDeleteConfirmModalOpen(false);

  const handleConfirmTake = () => {
    if (!purpose.trim()) {
      alert("Please enter a purpose."); // Consider a more sophisticated notification system
      return;
    }
    handleTake(sample._id, purpose);
    closeTakeModal();
  };

  const handleConfirmDelete = () => {
    handleDelete(sample._id);
    closeDeleteConfirmModal();
  };

  // --- Put Back Modal Handlers ---
  const openPutBackModal = () => setIsPutBackModalOpen(true);
  const closePutBackModal = () => {
    setIsPutBackModalOpen(false);
    setPutBackPosition(""); // Clear position on close
    setPutBackPurpose(""); // Clear purpose on close
  };

  const handleConfirmPutBack = async (currentSampleId) => {
    if (!putBackPosition.trim()) {
      toast.error("Please enter the new position for the sample.");
      return;

    }

    setLoading(true);
    try {
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/putback/${currentSampleId}`, // Use the ID from the URL
        { position: putBackPosition, returned_by: userInfo?.username, return_purpose: putBackPurpose }, // Pass purpose
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      if (res?.data?.success) {
        toast.success(res.data.message);
        closePutBackModal();

        // *** IMPORTANT: Redirect to the new _id returned by the backend ***
        if (res.data.new_sample_id) {
          router.replace(`/samples/${res.data.new_sample_id}`); // Replaces current history entry
        } else {
          setRefetchTrigger((prev) => prev + 1); // Fallback re-fetch
        }

      } else {
        toast.error(res.data.message || "Failed to put back sample.");
      }
    } catch (error) {
      console.error("Error putting back sample:", error);
      toast.error("Failed to put back sample.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <tr className="bg-white even:bg-gray-50 hover:bg-gray-100 transition duration-200 text-center">
        {renderTd("index", index + 1)}
        {renderTd("sample_date", sample?.sample_date, "")}
        {renderTd("buyer", sample?.buyer)}
        {renderTd("category", sample?.category)}
        {renderTd("style", sample?.style, "font-semibold text-blue-700")}
        {renderTd("shelf", sample?.shelf, "font-semibold")}
        {renderTd("division", sample?.division, "font-semibold")}
        {renderTd("position", sample?.position, "font-semibold")}
        {renderTd("availability", sample?.availability === "no" ? (
          <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Taken / N/A</span>
        ) : (
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Available</span>
        ))}
        {renderTd("status", sample?.status)}
        {renderTd("added_by", sample?.added_by)}

        <td className="py-3 px-3 border border-gray-200">
          <div className="flex flex-wrap justify-center gap-2">
            {sample?.availability !== "no" ?
              <button
                onClick={openTakeModal}
                className="bg-green-600 hover:bg-green-700 text-white font-medium px-3 py-1.5 rounded-md text-sm transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                Take
              </button>
              :
              <button
                onClick={openPutBackModal}
                className="bg-yellow-600 hover:bg-green-700 text-white font-medium px-3 py-1.5 rounded-md text-sm transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                Put Back
              </button>
            }
            {userRole === "admin" && (
              <button
                onClick={openDeleteConfirmModal}
                className="bg-red-600 hover:bg-red-700 text-white font-medium px-3 py-1.5 rounded-md text-sm transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                Delete
              </button>
            )}
            <button
              onClick={() => router.push(`/samples/${sample._id}`)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1.5 rounded-md text-sm transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              Details
            </button>
          </div>
        </td>
      </tr>

      {/* Take Sample Modal (Now using the reusable 'Modal' component) */}
      <Modal
        isOpen={isTakeModalOpen}
        onClose={closeTakeModal}
        title="Enter Purpose for Taking Sample"
        footer={
          <>
            <button
              onClick={closeTakeModal}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-4 py-2 rounded-md transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmTake}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition-colors duration-200"
            >
              Confirm Take
            </button>
          </>
        }
      >
        <input
          type="text"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="e.g., For client meeting, Internal review"
          className="border border-gray-300 w-full p-2.5 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
          aria-label="Purpose for taking sample"
        />
      </Modal>

      {/* Delete Confirmation Modal (Now using the reusable 'Modal' component) */}
      {userRole === "admin" && (
        <Modal // Changed from TakingModal to Modal
          isOpen={isDeleteConfirmModalOpen}
          onClose={closeDeleteConfirmModal}
          title="Confirm Deletion"
          footer={
            <>
              <button
                onClick={closeDeleteConfirmModal}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-4 py-2 rounded-md transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-md transition-colors duration-200"
              >
                Delete
              </button>
            </>
          }
        >
          <p className="text-gray-700">Are you sure you want to delete this sample? This action cannot be undone.</p>
        </Modal>
      )}

      {/* Put Back Sample Modal (Using the reusable Modal component) */}
      <Modal
        isOpen={isPutBackModalOpen}
        onClose={closePutBackModal}
        title="Put Back Sample"
        footer={
          <>
            <button
              onClick={closePutBackModal}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-4 py-2 rounded-md transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={()=>handleConfirmPutBack(sample?._id)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition-colors duration-200"
            >
              Confirm Put Back
            </button>
          </>
        }
      >
        <p className="mb-4 text-gray-700">Please enter the new position for the sample:</p>
        <input
          type="text"
          value={putBackPosition}
          onChange={(e) => setPutBackPosition(e.target.value)}
          placeholder="e.g., A1, Shelf 3, Bin 10"
          className="border border-gray-300 w-full p-2.5 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
          aria-label="New position for sample"
        />
        <p className="mb-4 mt-3 text-gray-700">Please enter the purpose for returning this sample:</p>
        <input
          type="text"
          value={putBackPurpose}
          onChange={(e) => setPutBackPurpose(e.target.value)}
          placeholder="e.g., Returned after use, Incorrectly taken"
          className="border border-gray-300 w-full p-2.5 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
          aria-label="Purpose for returning sample"
        />
      </Modal>
    </>
  );
};

export default SampleListRow;