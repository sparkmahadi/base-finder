"use client"; // This is a client component

import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import { format } from "date-fns";
import DownloadButton from "./DownloadButton";

const PatternReleaseLog = () => {
    const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;

    const { userInfo, loading: authLoading } = useAuth();

    const getAuthHeaders = useCallback(() => {
        const token = localStorage.getItem("token");
        return {
            Authorization: `Bearer ${token}`,
        };
    }, []);

    const apiFetchCategories = async () => {
        const response = await axios.get(`${API_BASE_URL}/utilities/categories`, {
            headers: getAuthHeaders(),
        });
        return response.data.data.map(item => item.cat_name);
    };

    const apiFetchBuyers = async () => {
        const response = await axios.get(`${API_BASE_URL}/utilities/buyers`, {
            headers: getAuthHeaders(),
        });
        return response.data.data.map(item => item.value);
    };

    const apiFetchStatuses = async () => {
        const response = await axios.get(`${API_BASE_URL}/utilities/statuses`, {
            headers: getAuthHeaders(),
        });
        return response.data.data.map(item => item.value);
    };

    const [logs, setLogs] = useState([]);
    const [editingLogId, setEditingLogId] = useState(null);

    // Helper function to get today's date in YYYY-MM-DD format
    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [formInput, setFormInput] = useState({
        date: getTodayDate(), // Set today's date as default
        buyer: "",
        style: "",
        item: "",
        body: "",
        size: "",
        status: "",
        comments: "",
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);

    const [buyerOptions, setBuyerOptions] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [statusOptions, setStatusOptions] = useState([]);

    // State to explicitly show custom input field for each dropdown
    const [showCustomBuyerInput, setShowCustomBuyerInput] = useState(false);
    const [showCustomCategoryInput, setShowCustomCategoryInput] = useState(false);
    const [showCustomStatusInput, setShowCustomStatusInput] = useState(false);

    // Refs for auto-focus
    const dateInputRef = useRef(null);
    const customBuyerRef = useRef(null);
    const customCategoryRef = useRef(null);
    const customStatusRef = useRef(null);


    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            try {
                const logsResponse = await axios.get(`${API_BASE_URL}/pattern-release-logs`);
                const sortedByDateDesc = logsResponse?.data.sort((a, b) => new Date(b.date) - new Date(a.date));
                setLogs(sortedByDateDesc);

                const [categories, buyers, statuses] = await Promise.all([
                    apiFetchCategories(),
                    apiFetchBuyers(),
                    apiFetchStatuses(),
                ]);

                setCategoryOptions([...new Set(categories)].sort()); // Sort for better UX
                setBuyerOptions([...new Set(buyers)].sort());
                setStatusOptions([...new Set(statuses)].sort());

                toast.success("Data loaded successfully!");
            } catch (error) {
                console.error("Error loading initial data:", error);
                toast.error("Failed to load initial data.");
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, [getAuthHeaders, API_BASE_URL]);

    useEffect(() => {
        if (showAddForm && dateInputRef.current) {
            dateInputRef.current.focus();
        }
    }, [showAddForm]);

    // Handle change for the main form inputs
    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "buyer") {
            if (value === "--- Add New ---") {
                setShowCustomBuyerInput(true);
                setFormInput((prev) => ({ ...prev, [name]: "" })); // Clear buyer value
                setTimeout(() => customBuyerRef.current?.focus(), 0); // Focus on custom input
            } else {
                setShowCustomBuyerInput(false);
                setFormInput((prev) => ({ ...prev, [name]: value }));
            }
        } else if (name === "item") {
            if (value === "--- Add New ---") {
                setShowCustomCategoryInput(true);
                setFormInput((prev) => ({ ...prev, [name]: "" })); // Clear item value
                setTimeout(() => customCategoryRef.current?.focus(), 0); // Focus on custom input
            } else {
                setShowCustomCategoryInput(false);
                setFormInput((prev) => ({ ...prev, [name]: value }));
            }
        } else if (name === "status") {
            if (value === "--- Add New ---") {
                setShowCustomStatusInput(true);
                setFormInput((prev) => ({ ...prev, [name]: "" })); // Clear status value
                setTimeout(() => customStatusRef.current?.focus(), 0); // Focus on custom input
            } else {
                setShowCustomStatusInput(false);
                setFormInput((prev) => ({ ...prev, [name]: value }));
            }
        } else {
            setFormInput((prev) => ({ ...prev, [name]: value }));
        }
    };

    // Handle change for custom input fields
    const handleCustomInputChange = (e, fieldName) => {
        const value = e.target.value;
        setFormInput((prev) => ({ ...prev, [fieldName]: value }));
    };

    // Resets the form and custom input states
    const resetForm = () => {
        setFormInput({
            date: getTodayDate(),
            style: "",
            body: "",
            size: "",
            comments: "",
        });
        setShowCustomBuyerInput(false);
        setShowCustomCategoryInput(false);
        setShowCustomStatusInput(false);
    };

    // Function to add a new option to its respective list if it's a new custom value
    // const addNewOption = (optionType, value) => {
    //     if (!value) return; // Don't add empty values

    //     let setOptions;
    //     let options;

    //     if (optionType === "buyer") {
    //         setOptions = setBuyerOptions;
    //         options = buyerOptions;
    //     } else if (optionType === "category") {
    //         setOptions = setCategoryOptions;
    //         options = categoryOptions;
    //     } else if (optionType === "status") {
    //         setOptions = setStatusOptions;
    //         options = statusOptions;
    //     }

    //     if (setOptions && value && !options.includes(value)) {
    //         setOptions((prev) => [...prev, value].sort());
    //     }
    // };

    const addNewOption = async (optionType, value) => {
        if (!value) return;

        let setOptions, options, endpoint;

        if (optionType === "buyer") {
            setOptions = setBuyerOptions;
            options = buyerOptions;
            endpoint = "buyers";
        } else if (optionType === "category") {
            setOptions = setCategoryOptions;
            options = categoryOptions;
            endpoint = "categories";
        } else if (optionType === "status") {
            setOptions = setStatusOptions;
            options = statusOptions;
            endpoint = "statuses";
        }

        if (!options.includes(value)) {
            setOptions((prev) => [...prev, value].sort());

            try {
                await axios.post(`${API_BASE_URL}/utilities/${endpoint}`, {
                    value, createdBy: userInfo?.username
                }, {
                    headers: getAuthHeaders(),
                });
                console.log(`Saved new ${optionType}: ${value}`);
            } catch (err) {
                console.error(`Error saving ${optionType}:`, err);
                toast.error(`Failed to save new ${optionType} to database.`);
            }
        }
    };


    // Adds a new log entry via API
    const addLog = async () => {
        if (!formInput.date || !formInput.buyer || !formInput.style || !formInput.item || !formInput.status) {
            toast.error("Please fill in Date, Buyer, Style, Category, and Status fields.");
            return;
        }

        // Ensure custom values are added to the options list before submission
        await addNewOption("buyer", formInput.buyer);
        await addNewOption("category", formInput.item);
        await addNewOption("status", formInput.status);


        const payload = { ...formInput, added_by: userInfo?.username, added_at: new Date() }
        setLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/pattern-release-logs`, payload);
            setLogs((prev) => [response.data, ...prev]);
            resetForm();
            toast.success("Log added successfully!");
            setShowAddForm(false);
        } catch (error) {
            if (error.response && error.response.status === 409) {
                toast.error("A log with the same Date, Buyer, Style, Item, Body, and Size already exists.");
            } else {
                console.error("Error adding log:", error);
                toast.error("Failed to add log?.");
            }
        } finally {
            setLoading(false);
        }
    };

    // Sets the form with the log data for editing
    const startEditing = (log) => {
        setEditingLogId(log?._id);
        const formattedDate = log?.date ? new Date(log?.date).toISOString().split('T')[0] : '';

        // Check if current log's values are already in options; if not, add them (prevents "--- Add New ---" from appearing unnecessarily)
        addNewOption("buyer", log?.buyer);
        addNewOption("category", log?.item);
        addNewOption("status", log?.status);

        // Reset custom input visibility when starting edit
        setShowCustomBuyerInput(false);
        setShowCustomCategoryInput(false);
        setShowCustomStatusInput(false);

        setFormInput({ ...log, date: formattedDate, comments: log.comments || "" });

        setShowAddForm(true);
    };

    // Saves the edited log entry via API
    const saveEditedLog = async () => {
        if (!formInput.date || !formInput.buyer || !formInput.style || !formInput.item || !formInput.status) {
            toast.error("Please fill in Date, Buyer, Style, Category, and Status fields.");
            return;
        }

        // Ensure custom values are added to the options list before submission
        await addNewOption("buyer", formInput.buyer);
        await addNewOption("category", formInput.item);
        await addNewOption("status", formInput.status);


        setLoading(true);

        const payload = { ...formInput, updated_by: userInfo?.username, last_updated_at: new Date() }
        try {
            const response = await axios.put(`${API_BASE_URL}/pattern-release-logs/${editingLogId}`, payload);
            setLogs((prev) =>
                prev.map((log) =>
                    log?._id === editingLogId ? response.data : log
                )
            );
            setEditingLogId(null);
            resetForm();
            toast.success("Log updated successfully!");
            setShowAddForm(false);
        } catch (error) {
            if (error.response && error.response.status === 409) {
                toast.error("A log with the same Date, Buyer, Style, Item, Body, and Size already exists.");
            } else {
                console.error("Error saving edited log:", error);
                toast.error("Failed to update log?.");
            }
        } finally {
            setLoading(false);
        }
    };

    // Cancels the editing process
    const cancelEditing = () => {
        setEditingLogId(null);
        resetForm();
        setShowAddForm(false);
    };

    const handleClearSearch = () =>{
        setSearchTerm("");
    }

    // Deletes a log entry via API
    const deleteLog = async (idToDelete) => {
        if (!window.confirm("Are you sure you want to delete this log entry permanently?")) {
            return;
        }

        setLoading(true);
        try {
            await axios.delete(`${API_BASE_URL}/pattern-release-logs/${idToDelete}`);
            setLogs((prev) => prev.filter((log) => log?._id !== idToDelete));
            if (editingLogId === idToDelete) {
                cancelEditing();
            }
            toast.success("Log deleted successfully!");
        } catch (error) {
            console.error("Error deleting log:", error);
            toast.error("Failed to delete log?.");
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

    console.log(filteredLogs);

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-8 flex items-center justify-center font-sans">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full">
                <h1 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
                    Pattern Release Log
                </h1>

                {loading && (
                    <Loader />
                )}

                <div className="mb-6 flex gap-5">
                    <input
                        type="text"
                        placeholder="Search by any field..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="px-5 py-2 bg-gray-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200 shadow-md"
                    onClick={handleClearSearch}
                    >Clear</button>
                </div>

                <div className="mb-6 text-right lg:flex gap-5 justify-end">
                    <button
                        onClick={() => {
                            setShowAddForm(!showAddForm);
                            if (showAddForm) {
                                cancelEditing();
                            }
                        }}
                        className="px-5 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200 shadow-md"
                    >
                        {showAddForm ? "Hide Form" : "Add New Log"}
                    </button>
                    {
                        userInfo?.role === "admin" && <DownloadButton data={logs} />
                    }
                </div>


                {showAddForm && (
                    <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg shadow-inner">
                        <h2 className="text-xl font-bold text-gray-700 mb-4">
                            {editingLogId ? "Edit Log Entry" : "Add New Log Entry"}
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                            {/* Date */}
                            <div>
                                <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                                <input
                                    ref={dateInputRef}
                                    type="date"
                                    id="date"
                                    name="date"
                                    value={formInput.date}
                                    onChange={handleChange}
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
                                />
                            </div>

                            {/* Buyer Dropdown with "Add New" option */}
                            <div>
                                <label htmlFor="buyer" className="block text-sm font-medium text-gray-700">Buyer</label>
                                <select
                                    id="buyer"
                                    name="buyer"
                                    value={formInput.buyer || ""} // Ensure controlled component
                                    onChange={handleChange}
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
                                >
                                    <option value="">Select Buyer</option>
                                    {buyerOptions.map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                    <option value="--- Add New ---">--- Add New ---</option>
                                </select>
                                {showCustomBuyerInput && (
                                    <input
                                        ref={customBuyerRef}
                                        type="text"
                                        value={formInput.buyer}
                                        onChange={(e) => handleCustomInputChange(e, "buyer")}
                                        placeholder="Enter New Buyer"
                                        className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
                                    />
                                )}
                            </div>

                            {/* Style */}
                            <div>
                                <label htmlFor="style" className="block text-sm font-medium text-gray-700">Style</label>
                                <input
                                    type="text"
                                    id="style"
                                    name="style"
                                    value={formInput.style}
                                    onChange={handleChange}
                                    placeholder="Style (comma-separated)"
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
                                />
                            </div>

                            {/* Category (Item) Dropdown with "Add New" option */}
                            <div>
                                <label htmlFor="item" className="block text-sm font-medium text-gray-700">Category</label>
                                <select
                                    id="item"
                                    name="item"
                                    value={formInput.item || ""}
                                    onChange={handleChange}
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
                                >
                                    <option value="">Select Category</option>
                                    {categoryOptions.map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                    <option value="--- Add New ---">--- Add New ---</option>
                                </select>
                                {showCustomCategoryInput && (
                                    <input
                                        ref={customCategoryRef}
                                        type="text"
                                        value={formInput.item}
                                        onChange={(e) => handleCustomInputChange(e, "item")}
                                        placeholder="Enter New Category"
                                        className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
                                    />
                                )}
                            </div>

                            {/* Body */}
                            <div>
                                <label htmlFor="body" className="block text-sm font-medium text-gray-700">BODY</label>
                                <input
                                    type="text"
                                    id="body"
                                    name="body"
                                    value={formInput.body}
                                    onChange={handleChange}
                                    placeholder="BODY"
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
                                />
                            </div>

                            {/* Size */}
                            <div>
                                <label htmlFor="size" className="block text-sm font-medium text-gray-700">Size</label>
                                <input
                                    type="text"
                                    id="size"
                                    name="size"
                                    value={formInput.size}
                                    onChange={handleChange}
                                    placeholder="Size"
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
                                />
                            </div>

                            {/* Status Dropdown with "Add New" option */}
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                                <select
                                    id="status"
                                    name="status"
                                    value={formInput.status || ""}
                                    onChange={handleChange}
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
                                >
                                    <option value="">Select Status</option>
                                    {statusOptions.map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                    <option value="--- Add New ---">--- Add New ---</option>
                                </select>
                                {showCustomStatusInput && (
                                    <input
                                        ref={customStatusRef}
                                        type="text"
                                        value={formInput.status}
                                        onChange={(e) => handleCustomInputChange(e, "status")}
                                        placeholder="Enter New Status"
                                        className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
                                    />
                                )}
                            </div>


                            {/* Comments */}
                            <div className="sm:col-span-2 lg:col-span-4">
                                <label htmlFor="comments" className="block text-sm font-medium text-gray-700">Comments</label>
                                <textarea
                                    id="comments"
                                    name="comments"
                                    rows={2}
                                    value={formInput.comments}
                                    onChange={handleChange}
                                    placeholder="Any remarks or notes"
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
                                />
                            </div>


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
                )}

                <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Buyer
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Style
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Body
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Size
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Comments
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Added By
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Added At
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredLogs.length > 0 ? (
                                filteredLogs.map((log) => (
                                    <tr key={log?._id} className="hover:bg-gray-50">
                                        <td className="px-3 py-3 text-sm text-gray-800">
                                            {new Date(log?.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-3 py-3 text-sm text-gray-800">
                                            {log?.buyer}
                                        </td>
                                        <td className="px-3 py-3 text-sm text-gray-800 font-semibold">
                                            {log?.style}
                                        </td>
                                        <td className="px-3 py-3 text-sm text-gray-800">
                                            {log?.item}
                                        </td>
                                        <td className="px-3 py-3 text-sm text-gray-800">
                                            {log?.body}
                                        </td>
                                        <td className="px-3 py-3 text-sm text-gray-800">
                                            {log?.size}
                                        </td>
                                        <td className="px-3 py-3 text-sm text-gray-800">
                                            {log?.status}
                                        </td>
                                        <td
                                            className="px-3 py-3 text-sm text-gray-800 max-w-xs truncate"
                                            title={log?.comments || "-"} // Shows full comment on hover
                                        >
                                            {log?.comments?.length > 50 ? `${log.comments.slice(0, 50)}...` : (log?.comments || "-")}
                                        </td>

                                        <td className="px-3 py-3 text-sm text-gray-800">
                                            {log?.added_by}
                                        </td>
                                        <td className="px-3 py-3 text-sm text-gray-800">
                                            {log?.added_at ? format(log?.added_at, "Pp") : "Not Found"}
                                        </td>
                                        <td className="px-3 py-3 text-sm font-medium">
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
                                                        onClick={() => deleteLog(log?._id)}
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
                                    <td colSpan="8" className="px-3 py-3 text-center text-gray-500">
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