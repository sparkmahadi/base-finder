// components/CreateCategory.js

import { useState } from 'react';
import { createCategory } from '../lib/api';

export default function CreateCategory() {
  const [cat_id, setCatId] = useState('');
  const [cat_name, setCatName] = useState('');
  const [buyer_name, setBuyerName] = useState('');
  const [status, setStatus] = useState('');
  const [totalSamples, setTotalSamples] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const category = { cat_id, cat_name, buyer_name, status, totalSamples };

    try {
      const newCategory = await createCategory(category);
      console.log('New category created:', newCategory);
      setError(null); // Clear previous errors
    } catch (err) {
      setError('Error creating category');
      console.error('Error creating category:', err);
    }
  };

  return (
    <div>
      <h2>Create Category</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Category ID</label>
          <input
            type="text"
            value={cat_id}
            onChange={(e) => setCatId(e.target.value)}
          />
        </div>
        <div>
          <label>Category Name</label>
          <input
            type="text"
            value={cat_name}
            onChange={(e) => setCatName(e.target.value)}
          />
        </div>
        <div>
          <label>Buyer Name</label>
          <input
            type="text"
            value={buyer_name}
            onChange={(e) => setBuyerName(e.target.value)}
          />
        </div>
        <div>
          <label>Status</label>
          <input
            type="text"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          />
        </div>
        <div>
          <label>Total Samples</label>
          <input
            type="number"
            value={totalSamples}
            onChange={(e) => setTotalSamples(e.target.value)}
          />
        </div>
        <button type="submit">Create Category</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
