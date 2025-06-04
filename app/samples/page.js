// app/samples/page.jsx
import React from 'react';
import axios from 'axios';
import SampleListClient from './SampleListClient';

const fetchSamplesServer = async () => {
  try {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples`);
    return res.data.samples || [];
  } catch (error) {
    console.error('Server-side data fetch failed for samples:', error);
    return [];
  }
};

export default async function SamplesPage() {
  const initialSamples = await fetchSamplesServer();

  return (
    <SampleListClient initialSamples={initialSamples} />
  );
}