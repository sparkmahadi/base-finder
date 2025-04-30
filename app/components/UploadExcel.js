'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';

export default function UploadExcel() {
  const [samples, setSamples] = useState([]);
  const [selectedSamples, setSelectedSamples] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const excelRows = XLSX.utils.sheet_to_json(sheet);

      const formattedSamples = excelRows.map((row) => ({
        date: new Date(row.Date),
        category: row.Category || '',
        style: row.Style || '',
        numberOfSamples: Number(row['No. of sample']) || 0,
        s: Number(row.S) || 0,
        d: Number(row.D) || 0,
        status: row.Status || '',
        released: row.Released || '',
        createdAt: new Date(),
      }));

      setSamples(formattedSamples);
      setSelectedSamples(new Set(formattedSamples.map((_, idx) => idx))); // Select all initially
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

    const samplesToUpload = Array.from(selectedSamples).map((index) => samples[index]);
    // console.log(samplesToUpload);
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/upload-excel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ samples: samplesToUpload }),
      });

      const data = await res.json();
      alert(data.message);
    } catch (error) {
      console.error(error);
      alert('Failed to upload samples');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Upload Samples from Excel</h2>

      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileUpload}
        className="mb-4 block"
      />

      {samples.length > 0 && (
        <div>
          <div className="overflow-x-auto max-h-[500px] mb-4 border rounded">
            <table className="min-w-full table-auto text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="px-2 py-2">Select</th>
                  <th className="px-2 py-2">Date</th>
                  <th className="px-2 py-2">Category</th>
                  <th className="px-2 py-2">Style</th>
                  <th className="px-2 py-2">No. of Samples</th>
                  <th className="px-2 py-2">S</th>
                  <th className="px-2 py-2">D</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2">Released</th>
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
                    <td className="px-2 py-2">{sample.date.toLocaleDateString()}</td>
                    <td className="px-2 py-2">{sample.category}</td>
                    <td className="px-2 py-2">{sample.style}</td>
                    <td className="px-2 py-2">{sample.numberOfSamples}</td>
                    <td className="px-2 py-2">{sample.s}</td>
                    <td className="px-2 py-2">{sample.d}</td>
                    <td className="px-2 py-2">{sample.status}</td>
                    <td className="px-2 py-2">{sample.released}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleUpload}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-6 rounded"
          >
            {loading ? 'Uploading...' : 'Upload Selected Samples'}
          </button>
        </div>
      )}
    </div>
  );
}
