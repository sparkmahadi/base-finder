"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import ReactDOM from "react-dom";
import { useRouter } from "next/navigation";

const TakenSampleListRow = ({
  sample,
  index,
  handlePutBack
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPosition, setNewPosition] = useState("");
  const router = useRouter();

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleConfirmPutBack = () => {
    if (!newPosition) {
      alert("Please enter the new position.");
      return;
    }
    handlePutBack(sample?._id, newPosition);
    closeModal();
  };
  if (sample?.last_taken_at)

    return (
      <>
        <tr>
          <td className="py-2 px-4 border-b">{index + 1}</td>
          <td className="py-2 px-4 border-b">{sample?.sample_date ? format(new Date(sample?.last_taken_at), 'PP') : "--"}</td>
          <td className="py-2 px-4 border-b">{sample?.category}</td>
          <td className="py-2 px-4 border-b">{sample?.style}</td>
          <td className="py-2 px-4 border-b">{sample?.no_of_sample}</td>
          <td className="py-2 px-4 border-b">{sample?.shelf}</td>
          <td className="py-2 px-4 border-b">{sample?.division}</td>
          <td className="py-2 px-4 border-b">{sample?.position}</td><td className="py-2 px-4 border-b">
            {sample?.last_taken_at
              ? format(new Date(sample?.last_taken_at), 'PPp')
              : '--'}
          </td>
          <td className="py-2 px-4 border-b">
            {sample?.last_taken_by || '--'}
          </td>
          <td className="py-2 px-4 border-b">
            <button
              onClick={openModal}
              className="bg-yellow-500 text-white px-3 py-1 rounded text-sm cursor-pointer"
            >
              Put Back
            </button>
            <button
              onClick={()=>router.push(`/samples/${sample?._id}`)}
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm cursor-pointer"
            >
              Details
            </button>
          </td>
        </tr>

        {isModalOpen &&
          ReactDOM.createPortal(
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-md w-96">
                <h3 className="text-lg font-semibold mb-4">Enter New Position</h3>
                <input
                  type="text"
                  value={newPosition}
                  onChange={(e) => setNewPosition(e.target.value)}
                  placeholder="Position"
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
                    onClick={handleConfirmPutBack}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
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

export default TakenSampleListRow;
