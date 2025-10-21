import React, { useState, useEffect, useMemo } from "react";

export default function BulkUpdateModal({ isOpen, onClose, onSubmit, styles }) {
    const [selectedStyles, setSelectedStyles] = useState([]);
    const [selectedFields, setSelectedFields] = useState([]);
    const [formData, setFormData] = useState({});
    const [productionRecords, setProductionRecords] = useState([]);
    const [PP, setPP] = useState({ date: "", pattern_id: "", added_by: "" });
    const [FIT, setFIT] = useState({ date: "", pattern_id: "", added_by: "" });

    const [searchTerm, setSearchTerm] = useState(""); // 🔍 NEW
    const [selectAll, setSelectAll] = useState(false); // ✅ NEW

    const simpleFields = [
        "buyer",
        "season",
        "team",
        "descr",
        "item",
        "fabric",
        "prints",
    ];

    const handleBulkUpdate = async () => {
        if (selectedStyles.length === 0) return alert("No styles selected");

        const updateFields = { buyer, season, fabric, prints };
        setLoading(true);
        try {
            const result = await bulkUpdateStyles(selectedStyles, updateFields);
            console.log("Bulk update result:", result);
            alert("Bulk update successful!");
            // onSuccess(); // refresh data
            onClose();
        } catch (error) {
            alert("Error updating styles: " + (error.message || "Unknown error"));
        } finally {
            setLoading(false);
        }
    };

    // ✅ Filtered styles (memoized for performance)
    const filteredStyles = useMemo(() => {
        if (!searchTerm.trim()) return styles;
        return styles.filter((s) => {
            const query = searchTerm.toLowerCase();
            return (
                s.style?.toLowerCase().includes(query) ||
                s.buyer?.toLowerCase().includes(query) ||
                s.season?.toLowerCase().includes(query) ||
                s.item?.toLowerCase().includes(query)
            );
        });
    }, [searchTerm, styles]);

    // ✅ Handle Select All toggle
    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedStyles([]);
        } else {
            const allIds = filteredStyles.map((s) => s._id);
            setSelectedStyles(allIds);
        }
        setSelectAll(!selectAll);
    };

    const handleSelect = (styleId) => {
        setSelectedStyles((prev) =>
            prev.includes(styleId)
                ? prev.filter((id) => id !== styleId)
                : [...prev, styleId]
        );
    };

    const handleFieldToggle = (field) => {
        setSelectedFields((prev) =>
            prev.includes(field)
                ? prev.filter((f) => f !== field)
                : [...prev, field]
        );
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleProductionChange = (index, field, value) => {
        const updated = [...productionRecords];
        updated[index][field] = value;
        setProductionRecords(updated);
    };

    const addProductionRecord = () => {
        setProductionRecords((prev) => [
            ...prev,
            { factory_name: "", factory_code: "", po_size_range: "", totalQuantity: "" },
        ]);
    };

    const removeProductionRecord = (index) => {
        setProductionRecords((prev) => prev.filter((_, i) => i !== index));
    };

    const handleApply = async () => {
        if (selectedStyles.length === 0) return alert("Select at least one style");

        const updates = {};

        // Handle simple text fields
        selectedFields.forEach((field) => {
            if (formData[field]) updates[field] = formData[field];
        });

        // Handle dynamic custom sections (RPP, SECOND_FIT, etc.)
        customInput.forEach((sec) => {
            if (sec.key) {
                updates[sec.key] = {
                    date: sec.date || "",
                    pattern_id: sec.pattern_id || "",
                };
            }
        });

        const productionPayload = productionRecords.length > 0 ? productionRecords : null;

        const payload = {
            styleIds: selectedStyles,
            updateFields: updates,
            addProductionRecord: productionPayload,
        };

        try {
            const result = await onSubmit(payload);
            console.log("Bulk update result:", result);
            alert("Bulk update successful!");
            onClose();
        } catch (err) {
            alert("Error updating styles: " + (err.message || "Unknown error"));
        }
    };

    // Add these new states
    const [customInput, setCustomInput] = useState([]); // array of { key, date, pattern_id }

    const addCustomSection = () => {
        setCustomInput(prev => [...prev, { key: "", date: "", pattern_id: "" }]);
    };

    const handleCustomChange = (index, field, value) => {
        const updated = [...customInput];
        updated[index][field] = value;
        setCustomInput(updated);
    };

    const removeCustomSection = (index) => {
        setCustomInput(prev => prev.filter((_, i) => i !== index));
    };




    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-lg p-6 overflow-y-auto max-h-[90vh]">
                <h2 className="text-xl font-semibold mb-4">Bulk Update Styles</h2>

                 {/* 🔍 Search and Select All */}
                <div className="flex justify-between items-center mb-3">
                    <input
                        type="text"
                        placeholder="Search by Style, Buyer, Season, Item..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border rounded-lg px-3 py-2 w-2/3 text-sm"
                    />
                    <button
                        onClick={()=>setSearchTerm("")}
                        className={`px-3 py-1 rounded text-sm ${
                            selectAll
                                ? "bg-red-500 text-white hover:bg-red-600"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                    >
                        Clear search
                    </button>
                    <button
                        onClick={handleSelectAll}
                        className={`px-3 py-1 rounded text-sm ${
                            selectAll
                                ? "bg-red-500 text-white hover:bg-red-600"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                    >
                        {selectAll ? "Unselect All" : "Select All"}
                    </button>
                </div>

                {/* ✅ Style Selection List */}
                <div className="border p-3 rounded-lg mb-4 h-48 overflow-y-scroll">
                    {filteredStyles.length === 0 ? (
                        <p className="text-gray-500 text-sm">No styles match your search.</p>
                    ) : (
                        filteredStyles.map((s) => (
                            <label
                                key={s._id}
                                className="flex items-center gap-2 border-b py-1 cursor-pointer hover:bg-gray-50"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedStyles.includes(s._id)}
                                    onChange={() => handleSelect(s._id)}
                                />
                                <span className="text-sm font-medium">
                                    {s.style} — {s.buyer} — {s.season}
                                </span>
                            </label>
                        ))
                    )}
                </div>

                {/* Field Selection */}
                <div className="mb-3">
                    <h3 className="font-semibold text-lg mb-2">Select Fields to Update</h3>
                    <div className="flex flex-wrap gap-3">
                        {simpleFields.map((f) => (
                            <label
                                key={f}
                                className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded cursor-pointer hover:bg-gray-200"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedFields.includes(f)}
                                    onChange={() => handleFieldToggle(f)}
                                />
                                <span className="text-sm">{f}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Dynamic Inputs for Selected Simple Fields */}
                {selectedFields.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 mb-6 mt-4">
                        {selectedFields.map((field) => (
                            <input
                                key={field}
                                name={field}
                                value={formData[field] || ""}
                                onChange={handleChange}
                                placeholder={`Update ${field}`}
                                className="border rounded-lg px-3 py-2 w-full text-sm"
                            />
                        ))}
                    </div>
                )}

                {/* Custom Sections (like RPP, SECOND_FIT, etc.) */}
                <div className="border p-3 rounded-lg mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-lg">Custom Sampling Stage</h3>
                        <button
                            onClick={addCustomSection}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        >
                            + Add Custom
                        </button>
                    </div>

                    {customInput.map((sec, index) => (
                        <div key={index} className="grid grid-cols-4 gap-2 mb-2 items-center">
                            <input
                                type="text"
                                placeholder="Stage Name (e.g., RPP, SECOND_FIT etc)"
                                value={sec.key}
                                onChange={(e) => handleCustomChange(index, "key", e.target.value.toUpperCase())}
                                className="border px-2 py-1 rounded text-sm"
                            />
                            <input
                                type="date"
                                value={sec.date}
                                onChange={(e) => handleCustomChange(index, "date", e.target.value)}
                                className="border px-2 py-1 rounded text-sm"
                            />
                            <input
                                type="text"
                                placeholder="Pattern ID"
                                value={sec.pattern_id}
                                onChange={(e) => handleCustomChange(index, "pattern_id", e.target.value)}
                                className="border px-2 py-1 rounded text-sm"
                            />
                            <button
                                onClick={() => removeCustomSection(index)}
                                className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 max-w-10"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>


                {/* Production Records Section */}
                <div className="border p-3 rounded-lg mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-lg">Production Records</h3>
                        <button
                            onClick={addProductionRecord}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        >
                            + Add Record
                        </button>
                    </div>
                    {productionRecords.map((record, index) => (
                        <div
                            key={index}
                            className="grid grid-cols-4 gap-2 mb-2 items-center"
                        >
                            <input
                                type="text"
                                placeholder="Factory Name"
                                value={record.factory_name}
                                onChange={(e) =>
                                    handleProductionChange(index, "factory_name", e.target.value)
                                }
                                className="border px-2 py-1 rounded text-sm"
                            />
                            <input
                                type="text"
                                placeholder="Factory Code"
                                value={record.factory_code}
                                onChange={(e) =>
                                    handleProductionChange(index, "factory_code", e.target.value)
                                }
                                className="border px-2 py-1 rounded text-sm"
                            />
                            <input
                                type="text"
                                placeholder="PO Size Range"
                                value={record.po_size_range}
                                onChange={(e) =>
                                    handleProductionChange(index, "po_size_range", e.target.value)
                                }
                                className="border px-2 py-1 rounded text-sm"
                            />
                            <div className="flex gap-1 items-center">
                                <input
                                    type="text"
                                    placeholder="Total Qty"
                                    value={record.totalQuantity}
                                    onChange={(e) =>
                                        handleProductionChange(index, "totalQuantity", e.target.value)
                                    }
                                    className="border px-2 py-1 rounded text-sm w-full"
                                />
                                <button
                                    onClick={() => removeProductionRecord(index)}
                                    className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 mt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleApply}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                    >
                        Apply Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
