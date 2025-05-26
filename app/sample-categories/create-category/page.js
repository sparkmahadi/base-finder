// components/CreateCategory.js
"use client"
import { useAuth } from '@/app/context/AuthContext';
import { createCategory } from '@/lib/categoryAPI';
import { useRouter } from 'next/navigation';
// components/CreateCategory.js

import { useState } from 'react';
import { toast } from 'react-toastify';

export default function CreateCategory() {
  const { isAuthenticated, userInfo } = useAuth();
  const [cat_name, setCatName] = useState('');
  const router = useRouter();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const category = { cat_name, status: "active", totalSamples: 0, createdBy: userInfo?.name };

    try {
      const data = await createCategory(category);
      if (data.redirect) {
        router.push("/sample-categories")
      }
      if (data.success) {
        setSuccess('Category created successfully!');
        toast.success(data?.message)
        setError(null); // Clear previous errors
        console.log('New category created:', data);
      } else {
        toast.info(data.message);
      }
    } catch (err) {
      setError(err.message);
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
