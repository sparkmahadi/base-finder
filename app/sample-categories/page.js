// components/CategoriesList.js
"use client"
import { getCategories, deleteCategory, updateCategory } from '@/lib/categoryAPI';
// components/ListCategories.js

import { useState, useEffect } from 'react';
// import { getCategories, deleteCategory, updateCategory } from '../../lib/categoryAPI';

export default function ListCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null); // For editing a category

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching categories');
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Handle category deletion
  const handleDelete = async (cat_id) => {
      setLoading(true);
    try {
      await deleteCategory(cat_id);
      getCategories();
    //   setCategories(categories.filter((category) => category.cat_id !== cat_id)); // Remove the deleted category from the state
     setLoading(false);
    } catch (err) {
      setError('Error deleting category');
      console.error('Error deleting category:', err);
     setLoading(false);

    }
  };

  // Handle category editing
  const handleEdit = (category) => {
    setEditingCategory(category); // Set the category to be edited
  };

  // Handle category save (update)
  const handleSave = async (updatedCategory) => {
    console.log("updated", updatedCategory);
    try {
      const updatedCat = await updateCategory(updatedCategory);
      setCategories(categories.map((category) =>
        category.cat_id === updatedCat.cat_id ? updatedCat : category
      ));
      setEditingCategory(null); // Close the edit form
    } catch (err) {
      setError('Error updating category');
      console.error('Error updating category:', err);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-6">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-6 text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">Categories List</h2>
      
      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category.cat_id} className="p-4 bg-gray-100 rounded-md shadow-md">
            <h3 className="text-lg font-semibold text-gray-700">{category.cat_name}</h3>
            <p className="text-gray-600">Category ID: {category.cat_id}</p>
            <p className="text-gray-600">Buyer: {category.buyer_name}</p>
            <p className="text-gray-600">Status: {category.status}</p>
            <p className="text-gray-600">Total Samples: {category.totalSamples}</p>

            <div className="mt-4 flex justify-between">
              {/* Edit Button */}
              <button
                onClick={() => handleEdit(category)}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Edit
              </button>

              {/* Delete Button */}
              <button
                onClick={() => handleDelete(category.cat_id)}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Render the edit form if a category is being edited */}
      {editingCategory && (
        <div className="mt-6 p-6 bg-white rounded-lg shadow-lg">
          <h3 className="text-2xl font-semibold text-gray-700 mb-6">Edit Category</h3>
          
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave(editingCategory); // Save the edited category
            }}
            className="space-y-4"
          >
            <div>
              <label htmlFor="cat_name" className="block text-sm font-medium text-gray-600">Category Name</label>
              <input
                id="cat_name"
                type="text"
                value={editingCategory.cat_name}
                onChange={(e) => setEditingCategory({ ...editingCategory, cat_name: e.target.value })}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label htmlFor="buyer_name" className="block text-sm font-medium text-gray-600">Buyer Name</label>
              <input
                id="buyer_name"
                type="text"
                value={editingCategory.buyer_name}
                onChange={(e) => setEditingCategory({ ...editingCategory, buyer_name: e.target.value })}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-600">Status</label>
              <input
                id="status"
                type="text"
                value={editingCategory.status}
                onChange={(e) => setEditingCategory({ ...editingCategory, status: e.target.value })}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label htmlFor="totalSamples" className="block text-sm font-medium text-gray-600">Total Samples</label>
              <input
                id="totalSamples"
                type="number"
                value={editingCategory.totalSamples}
                onChange={(e) => setEditingCategory({ ...editingCategory, totalSamples: e.target.value })}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full mt-6 bg-indigo-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Save Changes
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
