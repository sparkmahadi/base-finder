import React, { useState, useRef, useEffect, version } from "react";
import { toast } from "react-toastify";

const AddEditForm = ({
  handleSave,
  addNewOption,
  buyer,
  styleCode,
  styleId,
  version,
  category,
  userInfo,
  statusOptions,
  getAuthHeaders,
  API_BASE_URL
}) => {



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
    buyer: buyer,
    style: styleCode,
    item: category,
    version: version,
    body: "",
    size: "",
    status: "",
    comments: "",
  });

  const [showCustomBuyerInput, setShowCustomBuyerInput] = useState(false);
  const [showCustomCategoryInput, setShowCustomCategoryInput] = useState(false);
  const [showCustomStatusInput, setShowCustomStatusInput] = useState(false);


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

  const dateInputRef = useRef(null);
  const customBuyerRef = useRef(null);
  const customCategoryRef = useRef(null);
  const customStatusRef = useRef(null);

  useEffect(() => {
    if (dateInputRef.current) {
      dateInputRef.current.focus();
    }
  }, []);




  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "buyer") {
      if (value === "--- Add New ---") {
        setShowCustomBuyerInput(true);
        setFormInput((prev) => ({ ...prev, [name]: "" }));
        setTimeout(() => customBuyerRef.current?.focus(), 0);
      } else {
        setShowCustomBuyerInput(false);
        setFormInput((prev) => ({ ...prev, [name]: value }));
      }
    } else if (name === "item") {
      if (value === "--- Add New ---") {
        setShowCustomCategoryInput(true);
        setFormInput((prev) => ({ ...prev, [name]: "" }));
        setTimeout(() => customCategoryRef.current?.focus(), 0);
      } else {
        setShowCustomCategoryInput(false);
        setFormInput((prev) => ({ ...prev, [name]: value }));
      }
    } else if (name === "status") {
      if (value === "--- Add New ---") {
        setShowCustomStatusInput(true);
        setFormInput((prev) => ({ ...prev, [name]: "" }));
        setTimeout(() => customStatusRef.current?.focus(), 0);
      } else {
        setShowCustomStatusInput(false);
        setFormInput((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormInput((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCustomInputChange = (e, fieldName) => {
    setFormInput((prev) => ({ ...prev, [fieldName]: e.target.value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const payload = { ...formInput, added_by: userInfo?.username, user_team: userInfo?.team, added_at: new Date(),};
    console.log(payload);
    if (formInput.status === "") {
      return toast.error('Please select a status')
    }
    handleSave(payload);
  };

  return (
    <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg shadow-inner">
      <h2 className="text-xl font-bold text-gray-700 mb-4">
        Add New Log Entry
      </h2>
      <form onSubmit={handleFormSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
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
          <div>
            <label htmlFor="buyer" className="block text-sm font-medium text-gray-700">Buyer</label>
            <input
              id="buyer"
              name="buyer"
              value={buyer}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
            </input>
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
          <div>
            <label htmlFor="style" className="block text-sm font-medium text-gray-700">Style</label>
            <input
              type="text"
              id="style"
              name="style"
              value={styleCode}
              onChange={handleChange}
              placeholder="Style"
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <div>
            <label htmlFor="item" className="block text-sm font-medium text-gray-700">Item</label>
            <input
              id="item"
              name="item"
              value={category || ""}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>

          <div>
            <label htmlFor="version" className="block text-sm font-medium text-gray-700">Version</label>
            <input
              id="version"
              name="version"
              value={version || ""}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>

          <div>
            <label htmlFor="body" className="block text-sm font-medium text-gray-700">Body</label>
            <input
              type="text"
              id="body"
              name="body"
              value={formInput.body}
              onChange={handleChange}
              placeholder="Body"
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
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
        </div>
        <div>
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
        <div className="flex justify-end space-x-3 mt-4">
          (
          <button
            type="submit"
            className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md"
          >
            Add Log
          </button>
          )
        </div>
      </form>
    </div>
  );
};

export default AddEditForm;