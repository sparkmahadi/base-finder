import PatternDetailsModal from "@/app/components/PatternDetailsModal";
import { useAuth } from "@/app/context/AuthContext";
import axios from "axios";
import { Eye, Trash2, Plus, Minus, Pencil } from "lucide-react";
import React, { useState } from "react";
import { toast } from "react-toastify";

const SamplingCard = ({ style, setShowAddForm, showAddForm, onUpdateSampling }) => {
    const { userInfo } = useAuth();
    const [isEditing, setIsEditing] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalPattern, setModalPattern] = useState(null);


    const { _id, buyer, season, item, style: styleCode, descr, version, status, fabric, prints, similar, productionRecords, ...relevantFields } = style;
    const [editedStyle, setEditedStyle] = useState({ ...relevantFields });
    const [newActivityKey, setNewActivityKey] = useState("");
    const [newActivityDate, setNewActivityDate] = useState("");
    const [showAddActivityForm, setShowAddActivityForm] = useState(false);
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

    console.log(editedStyle);

    // Generic handleChange to support nested objects or strings
    const handleChange = (key, field, value) => {
        setEditedStyle((prev) => {
            const updated = { ...prev };
            if (typeof updated[key] === "object" && updated[key] !== null) {
                updated[key] = { ...updated[key], [field]: value };
            } else if (field === "date") {
                updated[key] = value; // simple string field
            } else {
                updated[key] = { date: value, [field]: "" }; // initialize object
            }
            return updated;
        });
    };

    // --- Delete field directly in the document ---
    const handleDelete = async (key) => {
        try {
            const res = await axios.put(`${API_BASE_URL}/styles/update-style-sampling/${style._id}`, {
                action: "deleteField",
                field: key,
                updated_by: userInfo?.username,
                updated_at: new Date(),
            });

            if (res.data.success) {
                const updated = { ...editedStyle };
                delete updated[key];
                setEditedStyle(updated);
                onUpdateSampling && onUpdateSampling({ ...style, ...updated });
                toast.success(res.data.message || `${key} deleted successfully`);
            } else {
                toast.error(res.data.message || "Failed to delete field");
            }
        } catch (err) {
            console.error("Error deleting field:", err);
            toast.error("Failed to delete field");
        }
    };

    // --- Save edited fields directly in the document ---
    const handleSave = async () => {
        try {
            const res = await axios.put(`${API_BASE_URL}/styles/update-style-sampling/${style._id}`, {
                action: "replaceFields",
                updatedFields: editedStyle,
                updated_by: userInfo?.username,
                updated_at: new Date(),
            });

            if (res.data.success) {
                onUpdateSampling && onUpdateSampling({ ...style, ...editedStyle });
                toast.success(res.data.message || "Changes saved successfully!");
                setIsEditing(false);
            } else {
                toast.error(res.data.message || "Failed to save changes");
            }
        } catch (err) {
            console.error("Error saving fields:", err);
            toast.error("Failed to save changes");
        }
    };

    // --- Add new activity ---
    const handleAddActivity = async () => {
        if (!newActivityKey.trim() || !newActivityDate) {
            toast.error("Please enter activity name and date");
            return;
        }

        try {
            const res = await axios.put(`${API_BASE_URL}/styles/update-style-sampling/${style._id}`, {
                action: "add",
                status: newActivityKey.trim(),
                date: newActivityDate,
                added_by: userInfo?.username,
                added_at: new Date().toISOString(),
            });

            if (res.data.success) {
                const updated = {
                    ...editedStyle,
                    [newActivityKey.trim()]: {
                        date: newActivityDate,
                        added_by: userInfo?.username,
                        added_at: new Date().toISOString(),
                    },
                };
                setEditedStyle(updated);
                onUpdateSampling && onUpdateSampling({ ...style, ...updated });
                toast.success(res.data.message || "Activity added successfully!");
                setNewActivityKey("");
                setNewActivityDate("");
            } else {
                toast.error(res.data.message || "Failed to add activity");
            }
        } catch (err) {
            console.error("Error adding activity:", err);
            toast.error("Failed to add activity");
        }
    };


    const handleViewPattern = async (patternId) => {
        console.log(patternId);
        try {
            // Check if patternId is available
            if (!patternId) {
                toast.error("No pattern ID available.");
                return;
            }

            const res = await axios.get(`${API_BASE_URL}/pattern-release-logs/get-pattern-by-id/${patternId}`);

            if (res.data.success) {
                setModalPattern(res.data.data);
                setIsModalOpen(true);
            } else {
                toast.error(res.data.message || "Failed to fetch pattern details.");
            }
        } catch (error) {
            console.error("Error fetching pattern:", error);
            toast.error("Failed to fetch pattern details.");
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalPattern(null);
    };


    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Style Activities</h3>

            {!isEditing ? (
                <ul className="space-y-3">
                    {Object.entries(editedStyle).map(([key, value]) => {
                        if (key === "_id") return null;
                        return (
                            <li
                                key={key}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                                <div>
                                    <p className="font-medium capitalize">{key.replace(/_/g, " ")}:</p>
                                    {value ? (
                                        typeof value === "object" ? (
                                            <div className="text-sm text-gray-600 space-y-1">
                                                {Object.entries(value).map(([subKey, subValue]) => (
                                                    <>
                                                        {/* Inside the first loop for displaying activities */}
                                                        <p key={subKey}>
                                                            {subKey.replace(/_/g, " ")}: {subValue || "-"}
                                                            {subKey === "pattern_id" && subValue && (
                                                                <button
                                                                    onClick={() => handleViewPattern(subValue)}
                                                                    className="ml-2 text-sm text-blue-600 hover:underline"
                                                                >
                                                                    View Pattern
                                                                </button>
                                                            )}
                                                        </p>
                                                    </>
                                                ))}
                                            </div>
                                        ) : (
                                            <p>{value}</p>
                                        )
                                    ) : (
                                        <p>-</p>
                                    )}
                                </div>
                                {value && (
                                    <button
                                        onClick={() => handleDelete(key)}
                                        className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-all duration-300"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <div className="space-y-3">
                    {Object.entries(editedStyle).map(([key, value]) => {
                        if (key === "_id") return null;
                        return (
                            <div key={key} className="p-3 border rounded-lg bg-gray-50 space-y-2">
                                <p className="capitalize font-semibold">{key.replace(/_/g, " ")}:</p>
                                {typeof value === "object" && value !== null ? (
                                    <div className="flex flex-col gap-2">
                                        {Object.entries(value).map(([subKey, subValue]) => (
                                            <input
                                                key={subKey}
                                                type={subKey === "date" ? "date" : "text"}
                                                value={subValue || ""}
                                                placeholder={subKey.replace(/_/g, " ")}
                                                onChange={(e) => handleChange(key, subKey, e.target.value)}
                                                className="p-2 border rounded"
                                            />
                                        ))}
                                        {value.pattern_id && <button>View pattern</button>}
                                    </div>
                                ) : (
                                    <input
                                        type="text"
                                        value={value || ""}
                                        onChange={(e) => handleChange(key, "date", e.target.value)}
                                        className="p-2 border rounded w-full"
                                    />
                                )}
                                {value && (
                                    <button
                                        onClick={() => handleDelete(key)}
                                        className="mt-2 p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-all duration-300"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        );
                    })}

                    <div className="flex gap-2">
                        <button
                            onClick={handleSave}
                            className="py-2 px-4 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-all duration-300"
                        >
                            Save
                        </button>
                        <button
                            onClick={() => setIsEditing(false)}
                            className="py-2 px-4 bg-gray-400 text-white rounded-lg shadow-md hover:bg-gray-500 transition-all duration-300"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* --- Add new activity section --- */}
            <div className="mt-6 p-4 border rounded-lg bg-gray-50 space-y-3">
                <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                    {!showAddActivityForm ? <Plus onClick={() => setShowAddActivityForm(true)} className="h-5 w-5 text-amber-600" /> :
                        <Minus onClick={() => setShowAddActivityForm(false)} className="h-5 w-5 text-amber-600" />
                    }
                    Add New Activity
                </h4>
                {
                    showAddActivityForm &&
                    <>
                        <input
                            type="text"
                            placeholder="Activity name (e.g., pp, pro, fit)"
                            value={newActivityKey}
                            onChange={(e) => setNewActivityKey(e.target.value)}
                            className="p-2 border rounded w-full"
                        />
                        <input
                            type="date"
                            value={newActivityDate}
                            onChange={(e) => setNewActivityDate(e.target.value)}
                            className="p-2 border rounded w-full"
                        />
                        <button
                            onClick={handleAddActivity}
                            className="w-full py-2 px-4 bg-amber-600 text-white rounded-lg shadow-md hover:bg-amber-700 transition-all duration-300"
                        >
                            Add Activity
                        </button>
                    </>
                }
            </div>

            <div className="mt-4 lg:flex justify-center items-center gap-6">
                <button
                    onClick={() => setShowAddForm((prev) => !prev)}
                    className="w-full flex items-center justify-center py-2 px-4 bg-amber-600 text-white rounded-lg shadow-md hover:bg-amber-700 transition-all duration-300"
                >
                    <Eye className="h-5 w-5 mr-2" />
                    {showAddForm ? "Hide Pattern Release Form" : "Show Pattern Release Form"}
                </button>

                <button
                    onClick={() => setIsEditing(true)}
                    className="w-full flex items-center justify-center py-2 px-4 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300"
                >
                    <Pencil className="h-5 w-5 mr-2" />
                    Edit Activity Info
                </button>
            </div>

            {/* At the end of the return statement, before the closing </div> */}
            <PatternDetailsModal
                isOpen={isModalOpen}
                onClose={closeModal}
                pattern={modalPattern}
            />


        </div>
    );
};

export default SamplingCard;
