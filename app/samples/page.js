"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import SampleListRow from "../components/sample/SampleListRow";
import { useAuth } from "../context/AuthContext";

const SampleList = () => {
  const { isAuthenticated, userInfo } = useAuth();
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
    taken: "",
    added_at: "",
    added_by: "",
    released: "",
  });

  useEffect(() => {
    fetchSamples();
  }, []);

  const fetchSamples = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples`);
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

    const { name, value } = e.target;
    setEditedSample((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (id) => {
    try {
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/${id}`,
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

  const handleDelete = async (id) => {
    try {
      const res = await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res?.data?.success) {
        setSamples(samples.filter((sample) => sample._id !== id));
        toast.success("Sample deleted successfully");
      }
    } catch (err) {
      toast.error("Failed to delete sample");
    }
  };

  const handleTake = async (id, purpose) => {
    console.log(userInfo);
    const body = {
      taken_by: userInfo?.username, // assuming userInfo is accessible here
      purpose,
      taken: new Date().toISOString(),
    };

    try {
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/${id}/take`,
        body,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res?.data?.success) {
        const updatedSamples = [...samples];
        updatedSamples.forEach((s, i) => {
          if (s._id === id) updatedSamples[i].taken = res.data.taken_at || body.taken;
        });
        setSamples(updatedSamples);
        toast.success("Sample marked as taken");
      }
    } catch (err) {
      toast.error("Failed to take sample");
    }
  };


  const tableHeadings = [
    "SL", "Date", "Category", "Style", "No. of sample", "Shelf", "Division", "Position", "Taken", "Added at", "Added By", "Released", "Actions",
  ];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            {tableHeadings?.map((head) => (
              <th key={head} className="py-2 px-4 border-b font-medium">
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {samples.map((sample, index) => (
            <SampleListRow
              key={sample._id}
              sample={sample}
              index={index}
              editingIndex={editingIndex}
              editedSample={editedSample}
              handleChange={handleChange}
              handleEdit={handleEdit}
              handleSave={handleSave}
              handleDelete={handleDelete}
              handleTake={handleTake}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SampleList;
