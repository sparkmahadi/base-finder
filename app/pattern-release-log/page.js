"use client"; // This is a client component

import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import FilterBar from "./FilterBar";
import AddEditForm from "./AddEditForm";
import LogTable from "./LogTable";

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


    // Add this state
    const [filters, setFilters] = useState({
        date: "",
        buyer: "",
        style: "",
        category: "",
        body: "",
        size: "",
        status: "",
        team: "",
        comments: "",
        added_by: "",
        added_at: ""
    });
    const [showOnlyMine, setShowOnlyMine] = useState(true);

    const getUniqueOptions = (key) => {
        const values = logs.map((log) => log[key]).filter(Boolean);
        return [...new Set(values)];
    };

    const [buyerOptions, setBuyerOptions] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [statusOptions, setStatusOptions] = useState([]);

    // Refs for auto-focus
    const dateInputRef = useRef(null);

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            try {
                const logsResponse = await axios.get(`${API_BASE_URL}/pattern-release-logs`, {
                    headers: getAuthHeaders(),
                });
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

    const handleSave = async (payload) => {
    setLoading(true);
    try {
      const response = editingLogId
        ? await axios.put(`${API_BASE_URL}/pattern-release-logs/${editingLogId}`, payload)
        : await axios.post(`${API_BASE_URL}/pattern-release-logs`, payload);

      if (editingLogId) {
        setLogs((prev) =>
          prev.map((log) => (log._id === editingLogId ? response.data : log))
        );
        toast.success("Log updated successfully!");
      } else {
        setLogs((prev) => [response.data, ...prev]);
        toast.success("Log added successfully!");
      }
      resetForm();
      setShowAddForm(false);
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error(
          "A log with the same Date, Buyer, Style, Category, Body, and Size already exists."
        );
      } else {
        console.error("Error saving log:", error);
        toast.error("Failed to save log.");
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
    // Cancels the editing process
    const cancelEditing = () => {
        setEditingLogId(null);
        resetForm();
        setShowAddForm(false);
    };

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
    const filteredLogs = logs.filter((log) => {
        const matchesSearch = Object.values(log).some(
            (value) =>
                typeof value === "string" &&
                value.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const matchesFilters = Object.entries(filters).every(([key, val]) =>
            val ? log[key] === val : true
        );

        const matchesMine = showOnlyMine ? log?.added_by === userInfo?.username : true;

        return matchesSearch && matchesFilters && matchesMine;
    });




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

                <FilterBar
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    showOnlyMine={showOnlyMine}
                    setShowOnlyMine={setShowOnlyMine}
                    handleClearSearch={() => setSearchTerm("")}
                    showAddForm={showAddForm}
                    setShowAddForm={setShowAddForm}
                    cancelEditing={resetForm}
                    userInfo={userInfo}
                    logs={logs}
                />

                {showAddForm && (
                    <AddEditForm
                        formInput={formInput}
                        setFormInput={setFormInput}
                        handleSave={handleSave}
                        editingLogId={editingLogId}
                        resetForm={resetForm}
                        addNewOption={addNewOption}
                        buyerOptions={buyerOptions}
                        categoryOptions={categoryOptions}
                        statusOptions={statusOptions}
                        userInfo={userInfo}
                    />
                )}
                <LogTable
                    filteredLogs={filteredLogs}
                    filters={filters}
                    startEditing={startEditing}
                    deleteLog={deleteLog}
                    userInfo={userInfo}
                    getUniqueOptions={getUniqueOptions}
                    setFilters={setFilters}
                />

            </div>
        </div>
    );
};

export default PatternReleaseLog;