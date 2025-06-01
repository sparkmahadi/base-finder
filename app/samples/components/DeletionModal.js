// components/Modal.jsx
"use client";

import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";

const DeletionModal = ({
    isOpen,
    onClose,
    title,
    children, // This will now contain your main confirmation message
    onConfirmYes, // New prop: function to call when "Yes" is clicked
    onConfirmNo,  // New prop: function to call when "No" is clicked
    showReducePositionsOption = false, // Still useful if you want to conditionally show this specific prompt
}) => {
    const modalRef = useRef(null);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleOutsideClick);
        }

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div
                ref={modalRef}
                className="bg-white w-full max-w-md p-6 rounded-lg shadow-xl animate-fadeIn transform transition-all duration-300 ease-out scale-95 md:scale-100"
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
                        aria-label="Close"
                    >
                        &times;
                    </button>
                </div>

                {/* Main confirmation message */}
                <div className="text-gray-700 mb-4">{children}</div>

                {/* Conditional rendering for the "reduce other positions" prompt and buttons */}
                {showReducePositionsOption && (
                    <div className="mt-4">
                        <p className="text-gray-700 mb-3">Do you also want to reduce other related positions?</p>
                        <div className="flex justify-center gap-4"> {/* Centering buttons */}
                            <button
                                onClick={() => {
                                    if (onConfirmYes) onConfirmYes();
                                    onClose();
                                }}
                                className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-md transition-colors duration-200 w-full"
                            >
                                Yes
                            </button>
                            <button
                                onClick={() => {
                                    if (onConfirmNo) onConfirmNo();
                                    onClose();
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-md transition-colors duration-200 w-full"
                            >
                                No
                            </button>
                        </div>
                        <div>
                            <button
                                onClick={() => onClose()}
                                className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-md transition-colors duration-200 w-full mt-5"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* The footer is now removed as the yes/no buttons replace the default footer actions for this specific modal */}
                {/* If you still need a footer for other types of modals using this component, you can re-add it conditionally */}
            </div>
        </div>,
        document.body
    );
};

export default DeletionModal;