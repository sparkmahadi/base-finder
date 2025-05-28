// components/Modal.jsx
"use client";

import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";

const Modal = ({ isOpen, onClose, title, children, footer }) => {
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
        <div className="text-gray-700">{children}</div>
        {footer && <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>,
    document.body
  );
};

export default Modal;