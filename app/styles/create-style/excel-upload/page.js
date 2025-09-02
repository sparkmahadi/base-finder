"use client";
import React, { useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";

const ExcelUpload = () => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    const [file, setFile] = useState(null);
    const [excelData, setExcelData] = useState([]);
    const [uploading, setUploading] = useState(false);

    // Handle file selection
    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            readExcel(selectedFile);
        }
    };

    // Read and parse Excel
    const readExcel = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
            const formatted = jsonData.map((row) => ({
                buyer: row["Buyer"],
                season: row["Season"],
                style: row["Style Code"],
                description: row["Style Description"],
                versions: row["Version"],
                fabrication: row["Fabrication"],
                status: row["Style Status"],
                item: row["Item"],
            }));
            setExcelData(formatted);
        };
        reader.readAsBinaryString(file);
    };

    // Send parsed data to backend
    const handleSubmit = async () => {
        if (!excelData.length) return alert("No data to upload!");
        console.log(excelData);
        try {
            setUploading(true);
            await axios.post(`${API_BASE_URL}/styles/excel-upload`, { styles: excelData });
            alert("Excel data uploaded successfully!");
        } catch (err) {
            console.error(err);
            alert("Error uploading data.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="p-4 border rounded-xl shadow-md">
            <h2 className="text-lg font-semibold mb-2">Upload Excel File</h2>
            <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="mb-3"
            />

            {excelData.length > 0 && (
                <div className="mb-4">
                    <h3 className="font-medium">Preview Data:</h3>
                    <div className="max-h-60 overflow-auto border mt-2 p-2 text-sm">
                        <table className="w-full border">
                            <thead>
                                <tr>
                                    {Object.keys(excelData[0]).map((key, index) => (
                                        <th key={index} className="border px-2 py-1 bg-gray-200">
                                            {key}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {excelData.map((row, rowIndex) => (
                                    <tr key={rowIndex}>
                                        {Object.values(row).map((value, colIndex) => (
                                            <td key={colIndex} className="border px-2 py-1">
                                                {String(value)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <button
                onClick={handleSubmit}
                disabled={uploading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
                {uploading ? "Uploading..." : "Submit Data"}
            </button>
        </div>
    );
};

export default ExcelUpload;
