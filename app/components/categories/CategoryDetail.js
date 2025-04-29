// components/CategoryDetail.js

import { useEffect, useState } from 'react';
import { getCategoryById } from '../lib/api';

export default function CategoryDetail({ cat_id }) {
  const [category, setCategory] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const data = await getCategoryById(cat_id);
        setCategory(data);
        setError(null); // Clear previous errors
      } catch (err) {
        setError('Error fetching category');
        console.error('Error fetching category:', err);
      }
    };
    fetchCategory();
  }, [cat_id]);

  if (!category) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h2>{category.cat_name}</h2>
      <p>Buyer: {category.buyer_name}</p>
      <p>Status: {category.status}</p>
      <p>Total Samples: {category.totalSamples}</p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
