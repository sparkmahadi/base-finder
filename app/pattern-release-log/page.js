"use client"; // This is a client component

import React, { useState, useEffect } from "react";
import axios from "axios"; // Import axios for API calls
import { toast } from "react-toastify"; // For notifications
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";

const PatternReleaseLog = () => {
    // Base URL for your API. Ensure this matches your backend server's address.
    const API_BASE_URL = "http://localhost:5000/api/pattern-release-logs";

    const { userInfo, loading: authLoading, } = useAuth();

    // State to manage the list of logs
    const [logs, setLogs] = useState([]);
    // State to manage the currently edited log's _id (MongoDB's ID)
    const [editingLogId, setEditingLogId] = useState(null);
    // State to manage the form input for adding/editing
    const [formInput, setFormInput] = useState({
        date: "",
        buyer: "",
        style: "",
        item: "",
        testingDevelop: "",
        fitPp: "",
        gssProduction: "",
        body: "",
        size: "",
        printPatternRelease: "",
        consumption: "",
    });
    // State for search term
    const [searchTerm, setSearchTerm] = useState("");
    // State for loading indicator
    const [loading, setLoading] = useState(true);

    // useEffect to fetch logs when the component mounts
    useEffect(() => {
        fetchLogs();
    }, []);

    // Function to fetch all logs from the backend
    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await axios.get(API_BASE_URL);
            // Backend returns _id, which React can use directly as key
            setLogs(response.data);
            toast.success("Logs fetched successfully!");
        } catch (error) {
            console.error("Error fetching logs:", error);
            toast.error("Failed to fetch logs.");
        } finally {
            setLoading(false);
        }
    };

    // Handles input changes in the form
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormInput((prev) => ({ ...prev, [name]: value }));
    };

    // Resets the form to empty values
    const resetForm = () => {
        setFormInput({
            date: "",
            buyer: "",
            style: "",
            item: "",
            testingDevelop: "",
            fitPp: "",
            gssProduction: "",
            body: "",
            size: "",
            printPatternRelease: "",
            consumption: "",
        });
    };

    // Adds a new log entry via API
    const addLog = async () => {
        if (!formInput.date || !formInput.buyer || !formInput.style || !formInput.item) {
            toast.error("Please fill in Date, Buyer, Style, and Item fields.");
            return;
        }
        const payload = { ...formInput, added_by: userInfo?.username, added_at: new Date() }
        setLoading(true);
        try {
            // The backend will generate the _id
            const response = await axios.post(API_BASE_URL, payload);
            setLogs((prev) => [...prev, response.data]); // Add the new log with its _id
            resetForm();
            toast.success("Log added successfully!");
        } catch (error) {
            console.error("Error adding log:", error);
            toast.error("Failed to add log.");
        } finally {
            setLoading(false);
        }
    };

    // Sets the form with the log data for editing
    const startEditing = (log) => {
        setEditingLogId(log._id); // Use MongoDB's _id for editing
        // Ensure date is in 'YYYY-MM-DD' format for input type="date"
        const formattedDate = log.date ? new Date(log.date).toISOString().split('T')[0] : '';
        setFormInput({ ...log, date: formattedDate });
    };

    // Saves the edited log entry via API
    const saveEditedLog = async () => {
        if (!formInput.date || !formInput.buyer || !formInput.style || !formInput.item) {
            toast.error("Please fill in Date, Buyer, Style, and Item fields.");
            return;
        }
        

        setLoading(true);

        const payload = {...formInput, updated_by: userInfo?.username, last_updated_at: new Date()}
        try {
            // Use the _id for the PUT request URL
            const response = await axios.put(`${API_BASE_URL}/${editingLogId}`, payload);
            setLogs((prev) =>
                prev.map((log) =>
                    log._id === editingLogId ? response.data : log // Update based on _id
                )
            );
            setEditingLogId(null);
            resetForm();
            toast.success("Log updated successfully!");
        } catch (error) {
            console.error("Error saving edited log:", error);
            toast.error("Failed to update log.");
        } finally {
            setLoading(false);
        }
    };

    // Cancels the editing process
    const cancelEditing = () => {
        setEditingLogId(null);
        resetForm();
    };

    // Deletes a log entry via API
    const deleteLog = async (idToDelete) => { // idToDelete will be the MongoDB _id
        // Replace window.confirm with a custom modal if preferred
        if (!window.confirm("Are you sure you want to delete this log entry permanently?")) {
            return;
        }

        setLoading(true);
        try {
            await axios.delete(`${API_BASE_URL}/${idToDelete}`);
            setLogs((prev) => prev.filter((log) => log._id !== idToDelete)); // Filter based on _id
            // If the deleted item was being edited, cancel editing
            if (editingLogId === idToDelete) {
                cancelEditing();
            }
            toast.success("Log deleted successfully!");
        } catch (error) {
            console.error("Error deleting log:", error);
            toast.error("Failed to delete log.");
        } finally {
            setLoading(false);
        }
    };

    // Filters logs based on the search term
    const filteredLogs = logs.filter((log) =>
        Object.values(log).some(
            (value) =>
                typeof value === "string" &&
                value.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-8 flex items-center justify-center font-sans">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-7xl">
                <h1 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
                    Pattern Release Log
                </h1>

                {/* Loading Indicator */}
                {loading && (
                    <Loader/>
                )}

                {/* Search Input */}
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Search by any field..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Add/Edit Form */}
                <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg shadow-inner">
                    <h2 className="text-xl font-bold text-gray-700 mb-4">
                        {editingLogId ? "Edit Log Entry" : "Add New Log Entry"}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                        {/* Input fields for each column */}
                        <input
                            type="date"
                            name="date"
                            value={formInput.date}
                            onChange={handleChange}
                            placeholder="Date"
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                        <input
                            type="text"
                            name="buyer"
                            value={formInput.buyer}
                            onChange={handleChange}
                            placeholder="Buyer"
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                        <input
                            type="text"
                            name="style"
                            value={formInput.style}
                            onChange={handleChange}
                            placeholder="Style (comma-separated)"
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                        <input
                            type="text"
                            name="item"
                            value={formInput.item}
                            onChange={handleChange}
                            placeholder="Item"
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                        <input
                            type="text"
                            name="testingDevelop"
                            value={formInput.testingDevelop}
                            onChange={handleChange}
                            placeholder="TESTING/DEVELOP"
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                        <input
                            type="text"
                            name="fitPp"
                            value={formInput.fitPp}
                            onChange={handleChange}
                            placeholder="FIT/PP"
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                        <input
                            type="text"
                            name="gssProduction"
                            value={formInput.gssProduction}
                            onChange={handleChange}
                            placeholder="GSS/ PRODUCTION"
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                        <input
                            type="text"
                            name="body"
                            value={formInput.body}
                            onChange={handleChange}
                            placeholder="BODY"
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                        <input
                            type="text"
                            name="size"
                            value={formInput.size}
                            onChange={handleChange}
                            placeholder="Size"
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                        <input
                            type="text"
                            name="printPatternRelease"
                            value={formInput.printPatternRelease}
                            onChange={handleChange}
                            placeholder="Print Pattern Release"
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                        <input
                            type="text"
                            name="consumption"
                            value={formInput.consumption}
                            onChange={handleChange}
                            placeholder="Consumption"
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                    </div>
                    <div className="flex justify-end space-x-3">
                        {editingLogId ? (
                            <>
                                <button
                                    onClick={saveEditedLog}
                                    className="px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 shadow-md"
                                >
                                    Save Changes
                                </button>
                                <button
                                    onClick={cancelEditing}
                                    className="px-5 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition-colors duration-200 shadow-md"
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={addLog}
                                className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md"
                            >
                                Add Log
                            </button>
                        )}
                    </div>
                </div>

                {/* Log Table */}
                <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Buyer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Style
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Item
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    TESTING/DEVELOP
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    FIT/PP
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    GSS/ PRODUCTION
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    BODY
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Size
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Print Pattern Release
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Consumption
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredLogs.length > 0 ? (
                                filteredLogs.map((log) => (
                                    <tr key={log._id} className="hover:bg-gray-50"> {/* Use log._id as the key */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                            {new Date(log.date).toLocaleDateString()} {/* Format date for display */}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                            {log.buyer}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                            {log.style}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                            {log.item}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                            {log.testingDevelop}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                            {log.fitPp}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                            {log.gssProduction}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                            {log.body}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                            {log.size}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                            {log.printPatternRelease}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                            {log.consumption}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => startEditing(log)}
                                                    className="text-blue-600 hover:text-blue-900 px-3 py-1 rounded-md bg-blue-100 hover:bg-blue-200 transition-colors duration-200"
                                                >
                                                    Edit
                                                </button>
                                                {
                                                    userInfo?.role === "admin" &&
                                                    <button
                                                        onClick={() => deleteLog(log._id)}
                                                        className="text-red-600 hover:text-red-900 px-3 py-1 rounded-md bg-red-100 hover:bg-red-200 transition-colors duration-200"
                                                    >
                                                        Delete
                                                    </button>
                                                }
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="12" className="px-6 py-4 text-center text-gray-500">
                                        No log entries found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PatternReleaseLog;
