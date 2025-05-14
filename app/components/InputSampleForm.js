"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const InputSampleForm = () => {
  const { isAuthenticated, userInfo } = useAuth();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    category: "",
    style: "",
    no_of_sample: "",
    shelf: "",
    division: "",
    position: "",
    status: "ok",
    comments: "",
    added_at: new Date().toISOString(),
    buyer: "",
    released: ""
  });

  const [options, setOptions] = useState({
    categories: [],
    no_of_samples: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    shelfs: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    divisions: [1, 2, 3],
    statuses: [],
    buyers: ["LPP", "Carters", "BRI", "OVS", "Fesretail", "New", "New2"]
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/utilities/categories`, {
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


  useEffect(() => {
    const getUniqueStatuses = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/unique?fields=status`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(res.data.values);

        setOptions((prev) => ({
          ...prev,
          statuses: res.data.values || res.data || [],
        }));
      } catch (err) {
        toast.error("Failed to load sample statuses.");
      }
    };

    getUniqueStatuses();
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
      formData["added_by"] = userInfo?.username;
      console.log(formData);
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples`, formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log(formData);

      if (res.data.success) {
        toast.success("Sample saved successfully!");
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

        className="border p-2"
      >
        <option value="">Select Category</option>
        {options.categories.map((cat) => (
          <option key={cat._id} value={cat.cat_name}>
            {cat.cat_name} — {cat.buyer_name}
          </option>
        ))}
      </select>



      <input type="text" name="style" value={formData.style} onChange={handleChange} placeholder="Style" className="border p-2" />

      <select name="no_of_sample" value={formData.no_of_sample} onChange={handleChange} className="border p-2">
        <option value="">No. of Samples</option>
        {options.no_of_samples.map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>

      <select name="shelf" value={formData.shelf} onChange={handleChange} className="border p-2">
        <option value="">Select Shelf</option>
        {options.shelfs.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <select name="division" value={formData.division} onChange={handleChange} className="border p-2">
        <option value="">Select Division</option>
        {options.divisions.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      <input name="position" type="number" value={formData.position} onChange={handleChange} placeholder="Position" className="border p-2" />

      {/* <select name="status" value={formData.status} onChange={handleChange} className="border p-2">
        {options.statuses.map((status) => (
          <option key={status} value={status}>{status}</option>
        ))}
      </select> */}

      <select
        name="status"
        value={formData.status}
        onChange={handleChange}

        className="border p-2"
      >
        <option value="">Select status</option>
        {options.statuses.map((status) => (
          <option key={status._id} value={status}>
            {status}
          </option>
        ))}
      </select>

      <input name="comments" type="text" value={formData.comments} onChange={handleChange} placeholder="Comments" className="border p-2" />

      <select name="buyer" value={formData.buyer} onChange={handleChange} className="border p-2">
        <option value="">Select Buyer</option>
        {options.buyers.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      <input name="released" type="text" value={formData.released} onChange={handleChange} placeholder="Released (optional)" className="border p-2" />

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Submit Sample
      </button>
    </form>
  );
};

export default InputSampleForm;
