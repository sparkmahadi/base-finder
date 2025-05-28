// components/TakenSampleListRow.jsx
"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import Modal from "../components/Modal"; // Correctly import the reusable Modal component

const TakenSampleListRow = ({ sample, index, handlePutBack, userRole, handleDelete }) => { // Added userRole, handleDelete props
  const [isPutBackModalOpen, setIsPutBackModalOpen] = useState(false);
  const [newPosition, setNewPosition] = useState("");
  const router = useRouter();

  // State and handlers for the Put Back Modal
  const openPutBackModal = () => setIsPutBackModalOpen(true);
  const closePutBackModal = () => {
    setIsPutBackModalOpen(false);
    setNewPosition(""); // Clear input on close
  };

  const handleConfirmPutBack = () => {
    if (!newPosition.trim()) {
      alert("Please enter the new position.");
      return;
    }
    handlePutBack(sample?._id, newPosition);
    closePutBackModal();
  };

  // State and handlers for the Delete Confirmation Modal (if applicable here)
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const openDeleteConfirmModal = () => setIsDeleteConfirmModalOpen(true);
  const closeDeleteConfirmModal = () => setIsDeleteConfirmModalOpen(false);

  const handleConfirmDelete = () => {
    handleDelete(sample?._id); // Assuming handleDelete is passed from parent
    closeDeleteConfirmModal();
  };

  // Helper to render table data cells consistently
  const renderTd = (value, extraClasses = "") => (
    <td className={`py-3 px-3 border border-gray-200 text-sm break-words ${extraClasses}`}>
      {value || "-"}
    </td>
  );

  // Only render the row if last_taken_at exists (as per original logic)
  if (!sample?.last_taken_at) {
    return null;
  }

  return (
    <>
      <tr className="bg-white even:bg-gray-50 hover:bg-gray-100 transition duration-200 text-center">
        {renderTd(index + 1)}
        {renderTd(sample?.sample_date ? format(new Date(sample.sample_date), 'PP') : "--")}
        {renderTd(sample?.category)}
        {renderTd(sample?.style, "font-semibold text-blue-700")}
        {renderTd(sample?.no_of_sample)}
        {renderTd(sample?.shelf)}
        {renderTd(sample?.division)}
        {renderTd(sample?.position)}
        {renderTd(sample?.last_taken_at ? format(new Date(sample.last_taken_at), 'PPp') : '--')}
        {renderTd(sample?.last_taken_by)}

        <td className="py-3 px-3 border border-gray-200">
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={openPutBackModal}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium px-3 py-1.5 rounded-md text-sm transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              Put Back
            </button>
            <button
              onClick={() => router.push(`/samples/${sample?._id}`)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1.5 rounded-md text-sm transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              Details
            </button>
            {userRole === "admin" && ( // Only show delete for admin
              <button
                onClick={openDeleteConfirmModal}
                className="bg-red-600 hover:bg-red-700 text-white font-medium px-3 py-1.5 rounded-md text-sm transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                Delete
              </button>
            )}
          </div>
        </td>
      </tr>

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
              onClick={handleConfirmPutBack}
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
          value={newPosition}
          onChange={(e) => setNewPosition(e.target.value)}
          placeholder="e.g., 1,2,3,4,5,10,33 etc."
          className="border border-gray-300 w-full p-2.5 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
          aria-label="New position for sample"
        />
      </Modal>

      {/* Delete Confirmation Modal (Using the reusable Modal component) */}
      {userRole === "admin" && (
        <Modal
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
    </>
  );
};

export default TakenSampleListRow;