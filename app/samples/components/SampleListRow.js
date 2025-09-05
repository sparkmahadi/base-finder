// components/SampleListRow.jsx
"use client";

import React, { useState, useCallback } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import Modal from "./Modal"; // Reusable Modal component
import { toast } from "react-toastify";
import DeletionModal from "./DeletionModal"; // This is a specialized modal, assumed to be separate

const SampleListRow = ({
  userRole,
  sample,
  index,
  handleTake, // Prop from parent (SampleListClient)
  handlePutBack, // Prop from parent (SampleListClient)
  handleDelete: parentHandleDelete, // Prop from parent (SampleListClient), renamed for clarity
  userInfo,
}) => {
  const router = useRouter();
  console.log("sample", sample);
  const [isTakeModalOpen, setIsTakeModalOpen] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [purpose, setPurpose] = useState("");

  const [sampleToDeleteId, setSampleToDeleteId] = useState(null);

  // State for Put Back Modal
  const [isPutBackModalOpen, setIsPutBackModalOpen] = useState(false);
  const [putBackPosition, setPutBackPosition] = useState("");
  const [putBackPurpose, setPutBackPurpose] = useState("");

  const renderCell = useCallback((name, value) => {
    if ((name === "taken_at" || name === "added_at" || name.includes("date")) && value) {
      try {
        const date = new Date(value);
        // Check for valid date to prevent "Invalid Date" output
        if (!isNaN(date.getTime())) {
          return format(date, "PP");
        }
      } catch (err) {
        // Fallback to original value if parsing fails
        console.warn(`Date parsing failed for ${name}: ${value}`, err);
      }
    }
    return value || "-";
  }, []); // No dependencies, pure function

  const renderTd = useCallback((name, value, extra = "") => (
    <td className={`py-3 px-3 border border-gray-200 text-sm break-words ${extra} max-w-20`} title={value}>
      {renderCell(name, value)}
    </td>
  ), [renderCell]); // Dependency: renderCell

  const openTakeModal = useCallback(() => setIsTakeModalOpen(true), []);
  const closeTakeModal = useCallback(() => {
    setIsTakeModalOpen(false);
    setPurpose(""); // Clear purpose on close
  }, []);

  const openDeleteConfirmModal = useCallback(() => {
    setSampleToDeleteId(sample?._id); // Ensure correct sample ID is set
    setIsDeleteConfirmModalOpen(true);
  }, [sample?._id]);

  const closeDeleteConfirmModal = useCallback(() => {
    setIsDeleteConfirmModalOpen(false);
    setSampleToDeleteId(null);
  }, []);

  // This function now just calls the parent's handleDelete prop
  const handleConfirmDelete = useCallback((reduceOtherPositionsValue) => {
    if (!sampleToDeleteId) {
      toast.error("No sample selected for deletion.");
      return;
    }
    // Call the parent's handleDelete function, passing the ID and the boolean
    parentHandleDelete(sampleToDeleteId, reduceOtherPositionsValue);
    closeDeleteConfirmModal(); // Close modal immediately
  }, [sampleToDeleteId, parentHandleDelete, closeDeleteConfirmModal]);


  const handleConfirmTake = useCallback(() => {
    if (!purpose.trim()) {
      toast.error("Please enter a purpose.");
      return;
    }
    // Call the parent's handleTake function
    handleTake(sample._id, purpose);
    closeTakeModal();
  }, [purpose, handleTake, sample._id, closeTakeModal]);

  // --- Put Back Modal Handlers ---
  const openPutBackModal = useCallback(() => setIsPutBackModalOpen(true), []);
  const closePutBackModal = useCallback(() => {
    setIsPutBackModalOpen(false);
    setPutBackPosition(""); // Clear position on close
    setPutBackPurpose(""); // Clear purpose on close
  }, []);

  const handleConfirmPutBackLocal = useCallback(async () => {
    if (!putBackPosition.trim()) {
      toast.error("Please enter the new position for the sample.");
      return;
    }
    // Call the parent's handlePutBack function
    await handlePutBack(sample?._id, putBackPosition, putBackPurpose); // Pass purpose here
    closePutBackModal();
    // The parent (SampleListClient) will handle the re-fetch or redirect.
    // No need for router.replace or setRefetchTrigger here.
  }, [sample?._id, putBackPosition, putBackPurpose, handlePutBack, closePutBackModal]);

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
        {renderTd("status", sample?.status)}
        {renderTd("availability", sample?.availability === "no" ? (
          <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Taken / N/A</span>
        ) : (
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Available</span>
        ))}
        {renderTd("status", sample?.last_purpose)}
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

      {/* Delete Confirmation Modal (DeletionModal is assumed to be specialized) */}
      {userRole === "admin" && (
        <DeletionModal
          isOpen={isDeleteConfirmModalOpen}
          onClose={closeDeleteConfirmModal}
          title="Confirm Deletion"
          onConfirmYes={() => handleConfirmDelete(true)} // Pass true for reduceOtherPositions
          onConfirmNo={() => handleConfirmDelete(false)} // Pass false for reduceOtherPositions
          showReducePositionsOption={true}
        >
          <p className="text-gray-700">Are you sure you want to delete this sample? This action cannot be undone.</p>
        </DeletionModal>
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
              onClick={handleConfirmPutBackLocal}
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