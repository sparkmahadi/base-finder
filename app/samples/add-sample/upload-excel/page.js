'use client';

import { useAuth } from '@/app/context/AuthContext';
import axios from 'axios';
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

  const handleIncreasePositionsByAmount = async (shelf, division, amountToIncrease) => {
    setLoading(true);
    const body = { shelf: parseInt(shelf), division: parseInt(division), amountToIncrease: parseInt(amountToIncrease) }
    try {
      const res = await axios.patch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/increase-positions-by-amount`, body);
      console.log(res);
      const data = res?.data;
      if (data?.modifiedCount > 0) {
        toast.success(data?.message);
        toast.success(`Total positions modified- ${data?.modifiedCount}`);
        return true;
      } else {
        toast.error("Data cannot be modified or no data available!!!")
        return false;
      }
    } catch (err) {
      toast.error("Failed to increase positions");
      return false;
    } finally {
      setLoading(false);
    }
  }

  const handleUpload = async () => {
    if (selectedSamples.size === 0) {
      toast.warn('No samples selected!');
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

    const shelf = selected[0].shelf;
    const division = selected[0].division;
    const amountToIncrease = selected.length;

    const confirmUpload = window.confirm(
      `Are you sure you want to upload ${selected.length} sample(s)? This will increase the positions for shelf ${shelf}, division ${division} by ${amountToIncrease}.`
    );

    if (!confirmUpload) {
      toast.info("Upload cancelled.");
      return;
    }

    const positionIncreaseConfirmed = window.confirm(
      "Do you want to increment existing sample positions for this shelf and division? Choose 'OK' to increment, 'Cancel' if adding to an empty division or want to manually set positions."
    );

    if (positionIncreaseConfirmed) {
      const data = await handleIncreasePositionsByAmount(shelf, division, amountToIncrease);
      if (!data) {
        toast.error("Upload stopped due to failure in increasing positions.");
        return;
      }
    }

    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/upload-excel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ samples: selected }),
      });

      const data = await res.json();
      if (data?.success) {
        toast.success(data?.message);
        setSamples([]); // Clear samples after successful upload
        setSelectedSamples(new Set());
      } else {
        toast.error(data?.message || "Something went wrong during upload.");
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload samples.');
    } finally {
      setLoading(false);
    }
  };

  if (!userInfo?.approval) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h2 className="text-xl font-semibold text-red-600">
          Sorry, you are not approved to see this page yet! Please contact the administrator.
        </h2>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-6 border-b pb-3">
        Upload Samples from Excel
      </h2>

      <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded" role="alert">
        <h3 className="font-bold text-lg mb-2">Important Considerations Before Uploading:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Ensure your Excel file adheres to the **consistent format** provided.</li>
          <li>Choose **&apos;OK&apos; in the increment position alert** if you want to add samples on top of existing ones in the same shelf and division.</li>
          <li>Choose **&apos;Cancel&apos; in the increment position alert** if you are adding samples to a fresh or empty division where no samples exist.</li>
          <li>**There is no undo action** after a successful upload. Please review carefully.</li>
        </ul>
      </div>

      <div className="mb-6">
        <label htmlFor="excel-upload" className="block text-lg font-medium text-gray-700 mb-2">
          Select Excel File:
        </label>
        <input
          id="excel-upload"
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {samples.length > 0 && (
        <>
          <div className="overflow-x-auto max-h-[600px] mb-6 border border-gray-200 rounded-lg shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Select
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sample Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Buyer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Style
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No. of Sample
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shelf
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Division
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Season
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Comments
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Released
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Added By
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {samples.map((sample, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <input
                        type="checkbox"
                        checked={selectedSamples.has(index)}
                        onChange={() => handleSelectSample(index)}
                        className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {sample.sample_date instanceof Date && !isNaN(sample.sample_date)
                        ? sample.sample_date.toLocaleDateString()
                        : 'Invalid Date'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{sample.buyer}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{sample.category}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{sample.style}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{sample.no_of_sample}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{sample.shelf}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{sample.division}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{sample.position}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{sample.status}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{sample.season}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{sample.comments}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {sample.released
                        ? new Date(sample.released).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{sample.added_by}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleUpload}
            disabled={loading || selectedSamples.size === 0}
            className={`w-full px-6 py-3 rounded-lg text-white font-semibold transition-all duration-300
              ${loading || selectedSamples.size === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300'
              }`}
          >
            {loading ? 'Uploading...' : `Upload Selected Samples (${selectedSamples.size})`}
          </button>
        </>
      )}
    </div>
  );
}