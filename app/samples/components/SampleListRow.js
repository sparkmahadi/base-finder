"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import ReactDOM from "react-dom"; // 
import { useRouter } from "next/navigation";

const SampleListRow = ({
  sample,
  index,
  editingIndex,
  editedSample,
  handleChange,
  handleEdit, handleCancelEdit,
  handleSave,
  handleTake,
  handleDelete
}) => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [purpose, setPurpose] = useState("");

  const renderCell = (name, value) => {
    if (editingIndex === index) {
      return (
        <input
          name={name}
          value={editedSample[name]}
          onChange={handleChange}
          className="border p-1 w-full"
        />
      );
    }

    if ((name === "taken" || name === "added_at" || name.includes("date")) && value) {
      try {
        const date = new Date(value);
        return format(date, "MM-dd-yyyy HH:mm");
      } catch (err) {
        return value;
      }
    }

    return value;
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleConfirmTake = () => {
    if (!purpose) {
      alert("Please enter a purpose.");
      return;
    }
    handleTake(sample._id, purpose);
    closeModal();
  };
  // const sample_date = format(new Date(sample.sample_date, "yyyy-MM-dd HH:mm:s"));
  return (
    <>
      <tr>
        <td className="py-2 px-4 border-b">{index + 1}</td>
        <td className="py-2 px-4 border-b">{renderCell("sample_date", sample.sample_date)}</td>
        <td className="py-2 px-4 border-b">{renderCell("category", sample.category)}</td>
        <td className="py-2 px-4 border-b">{renderCell("style", sample.style)}</td>
        <td className="py-2 px-4 border-b">{renderCell("no_of_sample", sample.no_of_sample)}</td>
        <td className="py-2 px-4 border-b">{renderCell("shelf", sample.shelf)}</td>
        <td className="py-2 px-4 border-b">{renderCell("division", sample.division)}</td>
        <td className="py-2 px-4 border-b">{renderCell("position", sample.position)}</td>
        <td className="py-2 px-4 border-b">{renderCell("availability", sample.availability === "no" ? "Taken /Not Available" : "Yes")}</td>
        <td className="py-2 px-4 border-b">{renderCell("added_at", sample.added_at)}</td>
        <td className="py-2 px-4 border-b">{renderCell("last_taken_by", sample.last_taken_by)}</td>
        <td className="py-2 px-4 border-b">{renderCell("released", sample.released ? sample.released : "-")}</td>
        <td className="py-2 px-4 border-b space-y-1">
          <div className="flex gap-2">
            <button
              onClick={openModal}
              className="bg-green-600 text-white px-2 py-1 rounded w-full text-xs mt-1"
            >
              Take
            </button>
            <button
              onClick={() => handleDelete(sample._id)}
              className="bg-red-600 text-white px-2 py-1 rounded w-full text-xs mt-1"
            >
              Delete
            </button>
            
            <button onClick={() => router.push(`/samples/${sample._id}`)} className="bg-blue-600 text-white px-2 py-1 rounded w-full text-xs mt-1">
              Details
            </button>
          </div>
          {editingIndex === index ? (
            <div>
              <button
                onClick={() => handleSave(sample._id)}
                className="bg-blue-500 text-white px-2 py-1 rounded w-full"
              >
                Save
              </button>
              <button
                onClick={() => handleCancelEdit()}
                className="bg-blue-500 text-white px-2 py-1 rounded w-full"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleEdit(index)}
              className="bg-gray-500 text-white px-2 py-1 rounded w-full"
            >
              Edit
            </button>
          )}
        </td>
      </tr>

      {/* Modal using React Portal */}
      {isModalOpen &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-md w-96">
              <h3 className="text-lg font-semibold mb-4">Enter Purpose for Taking</h3>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Purpose"
                className="border p-2 w-full mb-4"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={closeModal}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmTake}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>,
          document.body // Render the modal in the body
        )}
    </>
  );
};

export default SampleListRow;
