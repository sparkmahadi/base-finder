// app/components/AddSample.js
'use client';

import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function AddSample() {
  const [form, setForm] = useState({
    style: '',
    category: '',
    shelf: '',
    box: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.style || !form.category || !form.shelf || !form.box) {
      return toast.error('All fields are required');
    }

    setIsSubmitting(true);
    
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples`, form);
      toast.success('Sample added successfully!');
      setForm({ style: '', category: '', shelf: '', box: '' });
    } catch (error) {
      toast.error('Error adding sample.');
    }
    console.log(form);
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="style"
        value={form.style}
        onChange={handleChange}
        placeholder="Style"
        className="border p-2 w-full"
      />
      <input
        type="text"
        name="category"
        value={form.category}
        onChange={handleChange}
        placeholder="Category"
        className="border p-2 w-full"
      />
      <input
        type="text"
        name="shelf"
        value={form.shelf}
        onChange={handleChange}
        placeholder="Shelf"
        className="border p-2 w-full"
      />
      <input
        type="text"
        name="box"
        value={form.box}
        onChange={handleChange}
        placeholder="Box"
        className="border p-2 w-full"
      />
      <button
        type="submit"
        className="bg-blue-500 text-white p-2 w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Adding...' : 'Add Sample'}
      </button>
    </form>
  );
}
