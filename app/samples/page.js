// pages/samples/index.jsx (or app/samples/page.jsx)
import React from 'react';
import SampleListClient from './SampleListClient'; // Adjust path as per your structure

export default function SamplesPage() {
  // Now, SampleListClient will handle its own data fetching on the client side.
  // We no longer pass initialSamples from the server.
  return (
    <SampleListClient />
  );
}