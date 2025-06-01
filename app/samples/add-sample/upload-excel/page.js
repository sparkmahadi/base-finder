'use client';

import { useAuth } from '@/app/context/AuthContext';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';

export default function UploadExcel() {
  const { isAuthenticated, userInfo } = useAuth();
  const [samples, setSamples] = useState([]);
  const [selectedSamples, setSelectedSamples] = useState(new Set());
  const [loading, setLoading] = useState(false);

  // Function to convert Excel date (serial number) to JavaScript Date
  const excelDateToJSDate = (serial) => {
    if (typeof serial === 'number') {
      const epoch = new Date(1899, 11, 31); // Excel's epoch is 31 Dec 1899
      epoch.setDate(epoch.getDate() + serial);
      return epoch;
    }
    return new Date(serial); // Fallback if the date is already a valid string
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet);

      const formattedSamples = rows.map((row) => {
        // Convert Excel date serial number to JavaScript Date
        const sampleDate = excelDateToJSDate(row.Date);
        const validSampleDate = isNaN(sampleDate) ? 'Invalid Date' : sampleDate;

        // Handle 'Released' field to handle possible non-date values like 'not yet'
        const releasedDate = row.Released && !isNaN(new Date(row.Released))
          ? new Date(row.Released)
          : null;

        return {
          sample_date: validSampleDate,
          buyer: row.Buyer || '',
          category: row.Category || '',
          style: row.Style || '',
          no_of_sample: Number(row['No. of sample']) || 0,
          shelf: Number(row.Shelf) || 0,
          division: Number(row.Division) || 0,
          position: isNaN(row.Position) ? 0 : Number(row.Position),
          status: row.Status || '',
          season: row.Season || '',
          comments: row.Comments || '',
          released: releasedDate,
          added_by: userInfo?.username
        };
      });

      setSamples(formattedSamples);
      setSelectedSamples(new Set(formattedSamples.map((_, idx) => idx)));
    };

    reader.readAsBinaryString(file);
  };

  const handleSelectSample = (index) => {
    const updated = new Set(selectedSamples);
    if (updated.has(index)) {
      updated.delete(index);
    } else {
      updated.add(index);
    }
    setSelectedSamples(updated);
  };

  const handleUpload = async () => {
    if (selectedSamples.size === 0) {
      alert('No samples selected!');
      return;
    }

    const selected = Array.from(selectedSamples).map((i) => {
      const s = samples[i];
      return {
        ...s,
        sample_date: s.sample_date instanceof Date ? s.sample_date.toISOString() : s.sample_date,
        released: s.released instanceof Date ? s.released.toISOString() : null,
      };
    });
        

    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/upload-excel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ samples: selected }),
      });
      console.log(selected);

      const data = await res.json();
      if(data?.success){
        toast.success(data?.message);
      } else{
        toast.error("Something wrong happened")
      }
    } catch (err) {
      console.error(err);
      alert('Failed to upload samples.');
    } finally {
      setLoading(false);
    }
  };

    if (userInfo?.approval !== true) {
    return <h2>System: Sorry, You are not approved to see this page yet!!! Contact Admin...</h2>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Upload Samples from Excel</h2>
      <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} className="mb-4" />

      {samples.length > 0 && (
        <>
          <div className="overflow-x-auto max-h-[500px] mb-4 border rounded">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="px-2 py-2">Select</th>
                  <th className="px-2 py-2">Sample Date</th>
                  <th className="px-2 py-2">Buyer</th>
                  <th className="px-2 py-2">Category</th>
                  <th className="px-2 py-2">Style</th>
                  <th className="px-2 py-2">No.</th>
                  <th className="px-2 py-2">Shelf</th>
                  <th className="px-2 py-2">Division</th>
                  <th className="px-2 py-2">Position</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2">Season</th>
                  <th className="px-2 py-2">Comments</th>
                  <th className="px-2 py-2">Released</th>
                  <th className="px-2 py-2">Added By</th>
                </tr>
              </thead>
              <tbody>
                {samples.map((sample, index) => (
                  <tr key={index} className="even:bg-gray-50">
                    <td className="px-2 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={selectedSamples.has(index)}
                        onChange={() => handleSelectSample(index)}
                      />
                    </td>
                    <td className="px-2 py-2">
                      {sample.sample_date instanceof Date && !isNaN(sample.sample_date)
                        ? sample.sample_date.toLocaleDateString()
                        : 'Invalid Date'}
                    </td>
                    <td className="px-2 py-2">{sample.buyer}</td>
                    <td className="px-2 py-2">{sample.category}</td>
                    <td className="px-2 py-2">{sample.style}</td>
                    <td className="px-2 py-2">{sample.no_of_sample}</td>
                    <td className="px-2 py-2">{sample.shelf}</td>
                    <td className="px-2 py-2">{sample.division}</td>
                    <td className="px-2 py-2">{sample.position}</td>
                    <td className="px-2 py-2">{sample.status}</td>
                    <td className="px-2 py-2">{sample.season}</td>
                    <td className="px-2 py-2">{sample.comments}</td>
                    <td className="px-2 py-2">
                      {sample.released
                        ? new Date(sample.released).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="px-2 py-2">{sample.added_by}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleUpload}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            {loading ? 'Uploading...' : 'Upload Selected Samples'}
          </button>
        </>
      )}
    </div>
  );
}
