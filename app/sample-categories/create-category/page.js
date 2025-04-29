// components/CreateCategory.js
"use client"
import { createCategory } from '@/lib/categoryAPI';
// components/CreateCategory.js

import { useState } from 'react';

export default function CreateCategory() {
  const [cat_id, setCatId] = useState('');
  const [cat_name, setCatName] = useState('');
  const [buyer_name, setBuyerName] = useState('');
  const [status, setStatus] = useState('');
  const [totalSamples, setTotalSamples] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const category = { cat_id, cat_name, buyer_name, status, totalSamples };

    try {
      const newCategory = await createCategory(category);
      setSuccess('Category created successfully!');
      setError(null); // Clear previous errors
      console.log('New category created:', newCategory);
    } catch (err) {
      setError('Error creating category');
      setSuccess(null);
      console.error('Error creating category:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">Create New Category</h2>
      
      {success && <div className="bg-green-100 text-green-700 p-4 rounded mb-4">{success}</div>}
      {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="cat_id" className="block text-sm font-medium text-gray-600">Category ID</label>
          <input
            id="cat_id"
            type="text"
            value={cat_id}
            onChange={(e) => setCatId(e.target.value)}
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="cat_name" className="block text-sm font-medium text-gray-600">Category Name</label>
          <input
            id="cat_name"
            type="text"
            value={cat_name}
            onChange={(e) => setCatName(e.target.value)}
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label htmlFor="buyer_name" className="block text-sm font-medium text-gray-600">Buyer Name</label>
          <input
            id="buyer_name"
            type="text"
            value={buyer_name}
            onChange={(e) => setBuyerName(e.target.value)}
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-600">Status</label>
          <input
            id="status"
            type="text"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label htmlFor="totalSamples" className="block text-sm font-medium text-gray-600">Total Samples</label>
          <input
            id="totalSamples"
            type="number"
            value={totalSamples}
            onChange={(e) => setTotalSamples(e.target.value)}
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full mt-6 bg-indigo-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Create Category
        </button>
      </form>
    </div>
  );
}
