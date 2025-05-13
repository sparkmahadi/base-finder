"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import ReactDOM from "react-dom";
import { useRouter } from "next/navigation";

const SampleListRow = ({ userRole, sample, index, handleTake, handleDelete }) => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [purpose, setPurpose] = useState("");

  const renderCell = (name, value) => {
    if ((name === "taken_at" || name === "added_at" || name.includes("date")) && value) {
      try {
        const date = new Date(value);
        return format(date, "PP");
      } catch (err) {
        return value;
      }
    }
    return value || "-";
  };

  const renderTd = (name, value, extra = "") => (
    <td className={`py-2 px-1 md:px-2 border text-xs md:text-sm break-words ${extra}`} title={value}>
      {renderCell(name, value)}
    </td>
  );

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleConfirmTake = () => {
    if (!purpose.trim()) {
      alert("Please enter a purpose.");
      return;
    }
    handleTake(sample._id, purpose);
    closeModal();
  };

  return (
    <>
      <tr className="hover:bg-gray-700 hover:text-white transition duration-200 text-center">
        {renderTd("index", index + 1)}
        {renderTd("sample_date", sample?.sample_date, "")}
        {renderTd("buyer", sample?.buyer)}
        {renderTd("category", sample?.category)}
        {renderTd("style", sample?.style, "font-semibold")}
        {renderTd("shelf", sample?.shelf, "font-semibold")}
        {renderTd("division", sample?.division, "font-semibold")}
        {renderTd("position", sample?.position, "font-semibold")}
        {renderTd("availability", sample?.availability === "no" ? "Taken / Not Available" : "Yes")}
        {renderTd("status", sample?.status)}
        {renderTd("added_by", sample?.added_by)}

        <td className="py-2 px-2 md:px-4 border">
          <div className="flex flex-col md:flex-row md:justify-center gap-2">
            {sample?.availability !== "no" && (
              <button
                onClick={openModal}
                className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs w-full md:w-auto"
              >
                Take
              </button>
            )}
            {userRole === "admin" && (
              <button
                onClick={() => handleDelete(sample._id)}
                className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs w-full md:w-auto"
              >
                Delete
              </button>
            )}
            <button
              onClick={() => router.push(`/samples/${sample._id}`)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs w-full md:w-auto"
            >
              Details
            </button>
          </div>
        </td>
      </tr>

      {isModalOpen &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
            <div className="bg-white w-[90%] max-w-md p-6 rounded-lg shadow-lg animate-fadeIn">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Enter Purpose</h2>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Purpose for taking sample"
                className="border w-full p-2 rounded mb-4 focus:outline-none focus:ring focus:ring-blue-300"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={closeModal}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmTake}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default SampleListRow;
