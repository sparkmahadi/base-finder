"use client";

import * as XLSX from "xlsx";

const DownloadButton = ({ data }) => {
  const handleDownload = () => {
    // 1. Convert JSON to worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // 2. Create a new workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Logs");

    // 3. Trigger download
    XLSX.writeFile(workbook, "Logs_Report.xlsx");
  };

  return (
    <button
      onClick={handleDownload}
      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
    >
      Download
    </button>
  );
};

export default DownloadButton;
