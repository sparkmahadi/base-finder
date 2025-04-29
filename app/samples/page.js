"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const SampleList = () => {
  const [samples, setSamples] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedSample, setEditedSample] = useState({
    date: "",
    category: "",
    style: "",
    no_of_sample: "",
    shelf: "",
    division: "",
    position: "",
    status: "",
    comments: "",
    taken: "",
    purpose_of_taking: "",
    released: "",
  });

  useEffect(() => {
    fetchSamples();
  }, []);

  const fetchSamples = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/samples");
      setSamples(res.data.samples);
    } catch (err) {
      toast.error("Failed to fetch samples");
    }
  };

  const handleEdit = (index) => {
    const sample = samples[index];
    setEditingIndex(index);
    setEditedSample({ ...sample });
  };

  const handleChange = (e) => {
    console.log(editedSample);
    const { name, value } = e.target;
    setEditedSample((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (id) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/samples/${id}`,
        editedSample,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res?.data?.success) {
        const updatedSamples = [...samples];
        updatedSamples[editingIndex] = { ...updatedSamples[editingIndex], ...editedSample };
        setSamples(updatedSamples);
        setEditingIndex(null);
        toast.success("Sample updated successfully");
      }
    } catch (err) {
      toast.error("Failed to update sample");
    }
  };

  const renderCell = (name, value, index) =>
    editingIndex === index ? (
      <input
        name={name}
        value={editedSample[name]}
        onChange={handleChange}
        className="border p-1 w-full"
      />
    ) : (
      value
    );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            {[
              "SL",
              "Date",
              "Category",
              "Style",
              "No. of sample",
              "Shelf",
              "Division",
              "Position",
              "Status",
              "Comments",
              "Taken",
              "Purpose of Taking",
              "Released",
              "Actions",
            ].map((head) => (
              <th key={head} className="py-2 px-4 border-b font-medium">
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {samples.map((sample, index) => (
            <tr key={sample._id}>
              <td className="py-2 px-4 border-b">{index + 1}</td>
              <td className="py-2 px-4 border-b">{renderCell("date", sample.date, index)}</td>
              <td className="py-2 px-4 border-b">{renderCell("category", sample.category, index)}</td>
              <td className="py-2 px-4 border-b">{renderCell("style", sample.style, index)}</td>
              <td className="py-2 px-4 border-b">{renderCell("no_of_sample", sample.no_of_sample, index)}</td>
              <td className="py-2 px-4 border-b">{renderCell("shelf", sample.shelf, index)}</td>
              <td className="py-2 px-4 border-b">{renderCell("division", sample.division, index)}</td>
              <td className="py-2 px-4 border-b">{renderCell("position", sample.position, index)}</td>
              <td className="py-2 px-4 border-b">{renderCell("status", sample.status, index)}</td>
              <td className="py-2 px-4 border-b">{renderCell("comments", sample.comments, index)}</td>
              <td className="py-2 px-4 border-b">{renderCell("taken", sample.taken, index)}</td>
              <td className="py-2 px-4 border-b">{renderCell("purpose_of_taking", sample.purpose_of_taking, index)}</td>
              <td className="py-2 px-4 border-b">{renderCell("released", sample.released, index)}</td>
              <td className="py-2 px-4 border-b">
                {editingIndex === index ? (
                  <button
                    onClick={() => handleSave(sample._id)}
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => handleEdit(index)}
                    className="bg-gray-500 text-white px-2 py-1 rounded"
                  >
                    Edit
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SampleList;
