"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const InputSampleForm = () => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    category: "",
    style: "",
    noOfSample: "",
    shelf: "",
    division: "",
    position: "",
    status: "ok",
    comments: "",
    taken: new Date().toISOString(),
    purpose: "",
    released: ""
  });

  const [options, setOptions] = useState({
    categories: [],
    noOfSamples: [1, 2, 3, 4, 5],
    shelfs: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    divisions: [1, 2, 3],
    statuses: ["ok", "not ok"],
    purposes: ['fit', 'pp']
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token");
  
        const res = await axios.get("http://localhost:5000/api/utilities/categories", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        setOptions((prev) => ({
          ...prev,
          categories: res.data.categories || res.data || [],
        }));
      } catch (err) {
        toast.error("Failed to load sample categories.");
      }
    };
  
    fetchCategories();
  }, []);
  
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post("http://localhost:5000/api/samples", formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.data.success) {
        toast.success("Sample saved successfully!");
        setFormData((prev) => ({
          ...prev,
          category: "",
          style: "",
          noOfSample: "",
          shelf: "",
          division: "",
          position: "",
          status: "ok",
          comments: "",
          taken: new Date().toISOString(),
          purpose: "",
          released: ""
        }));
      }
    } catch (err) {
      toast.error("Failed to save sample.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white text-black shadow rounded grid gap-4 max-w-xl mx-auto">
      <select
  name="category"
  value={formData.category}
  onChange={handleChange}
  required
  className="border p-2"
>
  <option value="">Select Category</option>
  {options.categories.map((cat) => (
    <option key={cat._id} value={cat.cat_name}>
      {cat.cat_name} — {cat.buyer_name}
    </option>
  ))}
</select>



      <input type="text" name="style" value={formData.style} onChange={handleChange} placeholder="Style" className="border p-2" required />

      <select name="noOfSample" value={formData.noOfSample} onChange={handleChange} required className="border p-2">
        <option value="">No. of Samples</option>
        {options.noOfSamples.map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>

      <select name="shelf" value={formData.shelf} onChange={handleChange} required className="border p-2">
        <option value="">Select Shelf</option>
        {options.shelfs.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <select name="division" value={formData.division} onChange={handleChange} required className="border p-2">
        <option value="">Select Division</option>
        {options.divisions.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      <input type="number" name="position" value={formData.position} onChange={handleChange} placeholder="Position" className="border p-2" required />

      <select name="status" value={formData.status} onChange={handleChange} required className="border p-2">
        {options.statuses.map((status) => (
          <option key={status} value={status}>{status}</option>
        ))}
      </select>

      <input type="text" name="comments" value={formData.comments} onChange={handleChange} placeholder="Comments" className="border p-2" />

      <select name="purpose" value={formData.purpose} onChange={handleChange} required className="border p-2">
        <option value="">Select Purpose</option>
        {options.purposes.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      <input type="text" name="released" value={formData.released} onChange={handleChange} placeholder="Released (optional)" className="border p-2" />

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Submit Sample
      </button>
    </form>
  );
};

export default InputSampleForm;
