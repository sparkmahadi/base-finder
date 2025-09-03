import React, { useState } from "react";

const BasicStyleInfo = ({ style, setStyle, isEditing }) => {
  const styleInfoPoints = [
    "buyer",
    "season",
    "item",
    "style",
    "version",
    "status",
    "fabric",
    "prints",
    "similar",
  ];

  const [showAddProductionForm, setShowAddProductionForm] = useState(false);

  return (
    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Basic Style Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {styleInfoPoints.map((field) => (
          <div key={field} className="flex flex-col">
            <label className="text-sm font-semibold text-gray-600 mb-1">
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </label>
            {isEditing ? (
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={style?.[field] || ""}
                onChange={(e) =>
                  setStyle((prev) => ({ ...prev, [field]: e.target.value }))
                }
              />
            ) : (
              <p className="text-lg text-gray-900">
                {style?.[field] || "N/A"}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4">
        <label className="text-sm font-semibold text-gray-600 mb-1">
          Description
        </label>
        {isEditing ? (
          <textarea
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            rows="4"
            value={style?.description || ""}
            onChange={(e) =>
              setStyle((prev) => ({ ...prev, description: e.target.value }))
            }
          />
        ) : (
          <p className="text-lg text-gray-900">
            {style?.descr || "No description provided."}
          </p>
        )}
      </div>

      <button onClick={()=>showAddProductionForm(true)} className={`px-4 py-2 text-white font-semibold rounded-lg shadow-md transition-all duration-300 flex items-center bg-blue-600 hover:bg-blue-700`}>Add Production Info</button>
    </div>
  );
};

export default BasicStyleInfo;
