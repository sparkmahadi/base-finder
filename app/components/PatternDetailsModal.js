// PatternDetailsModal.js
import { X } from 'lucide-react';
import React from 'react';
import { format } from "date-fns";

// Helper function to safely format dates
const formatDate = (dateValue) => {
    const dateToFormat = dateValue && dateValue.$date ? dateValue.$date : dateValue;
    if (dateToFormat) {
        try {
            return format(new Date(dateToFormat), "Pp");
        } catch (error) {
            console.error("Error formatting date:", error);
            return "Invalid Date";
        }
    }
    return "Not Found";
};

// Reusable component to display a single detail item
const DetailItem = ({ label, value }) => {
    if (!value) return null; // Don't render if value is null or empty
    return (
        <div className="flex flex-col">
            <span className="font-medium text-gray-500 uppercase tracking-wide text-xs">{label}</span>
            <span className="text-gray-900 mt-1 text-sm font-semibold">{value || "N/A"}</span>
        </div>
    );
};

// Reusable component for a card-like section
const DetailCard = ({ title, children }) => {
    return (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="text-lg font-bold text-gray-800 mb-2">{title}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                {children}
            </div>
        </div>
    );
};

const PatternDetailsModal = ({ isOpen, onClose, pattern }) => {
    if (!isOpen || !pattern) {
        return null;
    }

    // Filter out top-level non-relevant fields for a cleaner UI
    const { 
        _id, 
        date, 
        comments, 
        added_at, 
        createdAt, 
        last_updated_at, 
        updated_by, 
        ...samplingFields 
    } = pattern;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75 transition-opacity p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden transform transition-all">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h3 className="text-2xl font-extrabold text-gray-900">Pattern Details</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                    {/* General Information */}
                    <DetailCard title="General Information">
                        <DetailItem label="ID" value={_id?.$oid || _id} />
                        <DetailItem label="Date" value={new Date(date?.$date || date).toLocaleDateString()} />
                        {Object.entries(samplingFields).map(([key, value]) => {
                            if (typeof value === 'object' && value !== null) {
                                return Object.entries(value).map(([subKey, subValue]) => (
                                    <DetailItem 
                                        key={`${key}-${subKey}`} 
                                        label={`${key.replace(/_/g, " ")} - ${subKey.replace(/_/g, " ")}`} 
                                        value={subValue} 
                                    />
                                ));
                            } else {
                                return <DetailItem key={key} label={key.replace(/_/g, " ")} value={value} />;
                            }
                        })}
                    </DetailCard>

                    {/* Comments Section */}
                    {comments && (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <h4 className="text-lg font-bold text-gray-800 mb-2">Comments</h4>
                            <p className="text-gray-700 text-sm leading-relaxed">{comments}</p>
                        </div>
                    )}

                    {/* Audit Information */}
                    <DetailCard title="Audit Information">
                        <DetailItem label="Added By" value={pattern.added_by} />
                        <DetailItem label="Added At" value={formatDate(added_at)} />
                        <DetailItem label="Updated By" value={updated_by} />
                        <DetailItem label="Last Updated" value={formatDate(last_updated_at)} />
                        <DetailItem label="Created At" value={formatDate(createdAt)} />
                    </DetailCard>
                </div>
            </div>
        </div>
    );
};

export default PatternDetailsModal;