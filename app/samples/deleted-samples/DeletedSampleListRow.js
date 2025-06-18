// components/SampleListRow.jsx
"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import Modal from "../components/Modal";

const DeletedSampleListRow = ({ userRole, sample, index, handleRestore,handleDeletePermanently, userInfo }) => {
    const router = useRouter();
    const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
    const [newPosition, setNewPosition] = useState("");
    const [purpose, setPurpose] = useState("");
    const [loading, setLoading] = useState(false);

    const [sampleToDeleteId, setSampleToDeleteId] = useState(null);
    const [increaseOtherPositions, setIncreaseOtherPositions] = useState(false);

    // State for Put Back Modal
    const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
    const [restorePosition, setRestorePosition] = useState("");
    const [restorePurpose, setRestorePurpose] = useState("");

    // State and handlers for the Put Back Modal
    const openRestoreModal = () => setIsRestoreModalOpen(true);
    const closeRestoreModal = () => {
        setIsRestoreModalOpen(false);
        setNewPosition(""); // Clear input on close
    };

    const handleConfirmRestore = () => {
        console.log(newPosition);
        if (!newPosition.trim()) {
            alert("Please enter the new position.");
            return;
        }
        handleRestore(sample?._id, sample?.shelf, sample?.division, newPosition);
        closeRestoreModal();
    };

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
                {renderTd("status", sample?.status, "font-semibold")}
                {renderTd("availability", sample?.availability === "no" ? (
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Taken / N/A</span>
                ) : (
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Available</span>
                ))}
                {renderTd("status", sample?.deletedAt)}
                {renderTd("added_by", sample?.deletedBy)}

                <td className="py-3 px-3 border border-gray-200">
                    <div className="flex flex-wrap justify-center gap-2">
                        <button
                            onClick={openRestoreModal}
                            className="bg-yellow-600 hover:bg-green-700 text-white font-medium px-3 py-1.5 rounded-md text-sm transition-colors duration-200 shadow-sm hover:shadow-md"
                        >
                            Restore
                        </button>
                        {userRole === "admin" && (
                            <button
                                onClick={()=>handleDeletePermanently(sample?._id)}
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

            {/* Put Back Sample Modal (Using the reusable Modal component) */}
            <Modal
                isOpen={isRestoreModalOpen}
                onClose={closeRestoreModal}
                title="Put Back Sample"
                footer={
                    <>
                        <button
                            onClick={closeRestoreModal}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-4 py-2 rounded-md transition-colors duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirmRestore}
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
        </>
    );
};

export default DeletedSampleListRow;