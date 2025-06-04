// app/samples/[sample_id]/page.js
import { headers } from 'next/headers';
import SampleDetails from './SampleDetails';

// This function will run on the server
async function getSampleDataServer(sampleId) {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    // For server-side fetches requiring authentication, you'd typically pass a token
    // obtained from cookies or other secure server-side mechanisms.
    // Example: const token = headers().get('cookie')?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    const response = await fetch(`${apiBaseUrl}/api/samples/${sampleId}`, {
      // headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store' // Set caching strategy as needed. 'no-store' for dynamic data.
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch sample data');
    }
    const data = await response.json();
    return { sample: data.sample, error: null };
  } catch (error) {
    console.error("Server-side data fetching error for sample ID", sampleId, ":", error);
    return { sample: null, error: error.message || "Failed to load sample details on server." };
  }
}

export default async function SampleDetailsPage({ params }) {
  const { sample_id } = params;
  const initialSampleData = await getSampleDataServer(sample_id);

  return (
    <SampleDetails initialSampleData={initialSampleData} />
  );
}