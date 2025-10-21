"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import Loader from "../Loader";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Styles for date picker

// --- Helper Functions for API Calls ---
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
};


// --- InputSampleForm Component ---

const SinglePageSampleForm = () => {
    const { isAuthenticated, userInfo } = useAuth();

    // --- States ---
    const [loading, setLoading] = useState(true);
    const [samplesInLocation, setSamplesInLocation] = useState([]);
    const [loadingSamples, setLoadingSamples] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    // New states for custom inputs
    const [showCustomCategoryInput, setShowCustomCategoryInput] = useState(false);
    const [showCustomBuyerInput, setShowCustomBuyerInput] = useState(false);
    const [showCustomStatusInput, setShowCustomStatusInput] = useState(false);
    const [showCustomShelfInput, setShowCustomShelfInput] = useState(false);
    const [showCustomDivisionInput, setShowCustomDivisionInput] = useState(false);

    // Existing API calls
    const apiFetchCategories = async () => {
        const response = await axios.get(`${API_BASE_URL}/utilities/categories`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    };

    const apiFetchBuyers = async () => {
        const response = await axios.get(`${API_BASE_URL}/utilities/buyers`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    };

    const apiFetchStatuses = async () => {
        const response = await axios.get(`${API_BASE_URL}/utilities/statuses`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    };
    const apiFetchShelfs = async () => {
        const response = await axios.get(`${API_BASE_URL}/utilities/shelfs`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    };
    const apiFetchDivisions = async () => {
        const response = await axios.get(`${API_BASE_URL}/utilities/divisions`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    };

    const apiFetchSamplesByLocation = async (shelf, division) => {
        const response = await axios.get(`${API_BASE_URL}/samples-by-location?shelf=${shelf}&division=${division}`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    };

    const apiSubmitSample = async (sampleData) => {
        const response = await axios.post(`${API_BASE_URL}/samples`, sampleData, {
            headers: getAuthHeaders(),
        });
        return response.data;
    };

    // NEW API calls for adding utilities (implement these on your backend!)
    const apiCreateCategory = async (categoryName) => {
        const response = await axios.post(`${API_BASE_URL}/utilities/categories`, { value: categoryName, createdBy: userInfo?.name }, {
            headers: getAuthHeaders(),
        });
        return response.data;
    };

    const apiCreateBuyer = async (buyerName) => {
        const response = await axios.post(`${API_BASE_URL}/utilities/buyers`, { value: buyerName, createdBy: userInfo?.name }, {
            headers: getAuthHeaders(),
        });
        return response.data;
    };

    // Assuming you have an endpoint to add a new status or it's handled implicitly
    const apiCreateStatus = async (statusName) => {
        // This might be a more generic utility endpoint or specific to statuses.
        // For now, assuming it adds it if not exists.
        const response = await axios.post(`${API_BASE_URL}/utilities/statuses`, { value: statusName, createdBy: userInfo?.name }, {
            headers: getAuthHeaders(),
        });
        return response.data;
    };

    const apiCreateShelf = async (shelfNumber) => {
        const response = await axios.post(`${API_BASE_URL}/utilities/shelfs`, { value: shelfNumber, createdBy: userInfo?.name }, {
            headers: getAuthHeaders(),
        });
        return response.data;
    };

    const apiCreateDivision = async (divisionNumber) => {
        const response = await axios.post(`${API_BASE_URL}/utilities/divisions`, { value: divisionNumber, createdBy: userInfo?.name }, {
            headers: getAuthHeaders(),
        });
        return response.data;
    };

    const initialFormData = {
        sample_date: new Date(),
        category: "",
        style: "",
        no_of_sample: "",
        shelf: "",
        division: "",
        position: "",
        status: "ok",
        comments: "",
        added_at: new Date().toISOString(),
        buyer: "",
        team: userInfo?.team,
        released: ""
    };

    const [formData, setFormData] = useState(initialFormData);

    const [options, setOptions] = useState({
        categories: [],
        no_of_samples: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        shelfs: [],
        divisions: [1, 2, 3],
        statuses: [],
        buyers: []
    });

    // Function to re-fetch all options (used after adding a new utility item)
    const refetchAllOptions = useCallback(async () => {
        setLoading(true); // Small local loader while options are refetched
        const [categoriesRes, buyersRes, statusesRes, shelfsRes, divisionsRes] = await Promise.allSettled([
            apiFetchCategories(),
            apiFetchBuyers(),
            apiFetchStatuses(),
            apiFetchShelfs(),
            apiFetchDivisions(),
        ]);

        setOptions((prev) => {
            const newOptions = { ...prev };

            if (categoriesRes.status === 'fulfilled') {
                console.log(categoriesRes);
                newOptions.categories = categoriesRes.value.data || categoriesRes.value || [];
            } else {
                console.error("Category re-fetch error:", categoriesRes.reason);
            }
            if (buyersRes.status === 'fulfilled') {
                newOptions.buyers = buyersRes.value.data || [];
            } else {
                console.error("Buyer re-fetch error:", buyersRes.reason);
            }

            if (statusesRes.status === 'fulfilled') {
                newOptions.statuses = statusesRes.value.data || statusesRes.value || [];
            } else {
                console.error("Status re-fetch error:", statusesRes.reason);
            }
            if (shelfsRes.status === 'fulfilled') {
                newOptions.shelfs = shelfsRes.value.data || shelfsRes.value || [];
            } else {
                console.error("shelfs re-fetch error:", shelfsRes.reason);
            }

            if (divisionsRes.status === 'fulfilled') {
                newOptions.divisions = divisionsRes.value.data || divisionsRes.value || [];
            } else {
                console.error("divisions re-fetch error:", divisionsRes.reason);
            }
            return newOptions;
        });
        setLoading(false);
    }, []); // No external dependencies, just re-fetches

    // Effect for initial data fetching
    useEffect(() => {
        if (isAuthenticated) {
            refetchAllOptions();
        }
    }, [isAuthenticated, refetchAllOptions]);

    // Effect for fetching samples by location (triggered in Step 2)
    useEffect(() => {
        const fetchSamplesForLocation = async () => {
            const { shelf, division } = formData;

            // Only fetch if shelf and division are valid numbers and not custom inputs
            if (String(shelf) && String(division) && !isNaN(parseInt(shelf)) && !isNaN(parseInt(division)) && !showCustomShelfInput && !showCustomDivisionInput) {
                setLoadingSamples(true);
                setSamplesInLocation([]);

                try {
                    const res = await apiFetchSamplesByLocation(shelf, division);
                    setSamplesInLocation(res.samples || []);
                    if (res.samples && res.samples.length > 0) {
                        toast.info(`Found ${res.samples.length} samples in Shelf ${shelf}, Division ${division}.`, {
                            position: "top-right",
                            autoClose: 3000,
                        });
                    } else {
                        toast.info(`No samples found in Shelf ${shelf}, Division ${division}.`, {
                            position: "top-right",
                            autoClose: 3000,
                        });
                    }
                } catch (err) {
                    toast.error("Failed to fetch samples for this location.");
                    console.error("Error fetching samples by location:", err);
                    setSamplesInLocation([]);
                } finally {
                    setLoadingSamples(false);
                }
            } else {
                setSamplesInLocation([]);
            }
        };

        if (currentStep === 2 && formData.shelf && formData.division) {
            fetchSamplesForLocation();
        } else if (currentStep !== 2) {
            setSamplesInLocation([]);
        }
    }, [formData.shelf, formData.division, currentStep, showCustomShelfInput, showCustomDivisionInput]);

    // --- Handlers ---

    // Generic handleChange for text/number inputs (used in Step 3 and for custom inputs)
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    // Specific handler for Category & Buyer card selections in Step 1
    const handleCategoryBuyerSelect = useCallback((name, value) => {
        setFormData(prev => {
            let updatedFormData = { ...prev, [name]: value };

            if (name === "category" && value) {
                // Handle auto-filling buyer if a category card is clicked and it includes buyer info
                const cat_values = value.split("—"); // Assuming '—' is the separator for category and buyer
                if (!showCustomBuyerInput) {
                    const autoBuyer = cat_values[cat_values.length - 1]?.trim();
                    // Only auto-fill if the extracted buyer exists in our options or is the current formData.buyer
                    if (autoBuyer && (options.buyers.some(b => b.name === autoBuyer) || formData.buyer === autoBuyer)) {
                        updatedFormData.buyer = autoBuyer;
                    } else if (!formData.buyer) { // If no buyer is currently set, clear it if auto-fill fails
                        updatedFormData.buyer = "";
                    }
                }
            }
            return updatedFormData;
        });
    }, [showCustomBuyerInput, formData.buyer, options.buyers]);

    // Specific handler for location/status selection in Step 2 (box-like tables)
    const handleLocationStatusSelect = useCallback((name, value) => {
        setFormData(prev => {
            let updatedFormData = { ...prev };
            // Reset custom input flags if a predefined option is selected
            if (name === "status") setShowCustomStatusInput(false);
            if (name === "shelf") setShowCustomShelfInput(false);
            if (name === "division") setShowCustomDivisionInput(false);

            updatedFormData[name] = value;
            return updatedFormData;
        });
    }, []);

    // Handlers for custom input fields (these update formData directly)
    const handleCustomInputChange = useCallback((name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSampleDateChange = useCallback((date) => {
        setFormData(prev => ({ ...prev, sample_date: date }));
    }, []);

    // --- Navigation Handlers ---
    const handleNext = () => {
        if (currentStep === 1) {
            if (!formData.category || !formData.buyer || (showCustomCategoryInput && !formData.category.trim()) || (showCustomBuyerInput && !formData.buyer.trim())) {
                toast.error("Please select or enter both a category and a buyer.");
                return;
            }
        } else if (currentStep === 2) {
            if (!formData.shelf || !formData.division || !formData.status || (showCustomShelfInput && (!formData.shelf || isNaN(parseInt(formData.shelf)))) || (showCustomDivisionInput && (!formData.division || isNaN(parseInt(formData.division)))) || (showCustomStatusInput && !formData.status.trim())) {
                toast.error("Please select or enter Shelf, Division, and Status.");
                return;
            }
        } else if (currentStep === 3) {
            if (!formData.style || !formData.no_of_sample || !formData.position) {
                toast.error("Please fill in Style, No. of Samples, and Position.");
                return;
            }
        }
        setCurrentStep((prev) => prev + 1);
    };

    const handleBack = () => {
        setCurrentStep((prev) => prev - 1);
    };

    const getAuthToken = () => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("token");
            return token ? { Authorization: `Bearer ${token}` } : null;
        }
        return null;
    };

    // Jump to a specific step with validation
    const goToStep = useCallback((step) => {
        // Prevent jumping forward to uncompleted steps
        if (step > currentStep) {
            if (currentStep === 1 && (!formData.category || !formData.buyer || (showCustomCategoryInput && !formData.category.trim()) || (showCustomBuyerInput && !formData.buyer.trim()))) {
                toast.error("Please complete Step 1 before proceeding.");
                return;
            }
            if (currentStep === 2 && (!formData.shelf || !formData.division || !formData.status || (showCustomShelfInput && (!formData.shelf || isNaN(parseInt(formData.shelf)))) || (showCustomDivisionInput && (!formData.division || isNaN(parseInt(formData.division)))) || (showCustomStatusInput && !formData.status.trim()))) {
                toast.error("Please complete Step 2 before proceeding.");
                return;
            }
            if (currentStep === 3 && (!formData.style || !formData.no_of_sample || !formData.position)) {
                toast.error("Please complete Step 3 before proceeding.");
                return;
            }
        }
        setCurrentStep(step);
    }, [currentStep, formData, showCustomCategoryInput, showCustomBuyerInput, showCustomStatusInput, showCustomShelfInput, showCustomDivisionInput]);


    // Reset all form selections
    const handleResetAll = useCallback(() => {
        setFormData(initialFormData);
        setSamplesInLocation([]);
        setShowCustomCategoryInput(false);
        setShowCustomBuyerInput(false);
        setShowCustomStatusInput(false);
        setShowCustomShelfInput(false);
        setShowCustomDivisionInput(false);
        setCurrentStep(1); // Go back to the very first step
        toast.info("All selections have been reset.");
    }, [initialFormData]);

    // position increaser handler
    const handleIncreasePositions = async (shelf, division, currentPosition) => {
        setLoading(true);
        console.log(shelf, division);
        const body = { shelf: parseInt(shelf), division: parseInt(division), currentPosition: parseInt(currentPosition) }
        try {
            const res = await axios.patch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/samples/increase-positions-by-shelf-division`, body, { headers: getAuthToken() });
            console.log(res);
            const data = res?.data;
            if (data?.success) {
                toast.success(data?.message);
                toast.success(`Total positions modified- ${data?.modifiedCount}`);
                return true;
            } else {
                toast.error("Data cannot be modified or no data available!!!")
                return false;
            }
        } catch (err) {
            toast.error("Failed to fetch sample details.");
            return false;
        } finally {
            setLoading(false);
        }
    }

    // --- Submission Handler ---
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate all current custom inputs before attempting to save them
            if (showCustomCategoryInput && !formData.category.trim()) { toast.error("Please enter a custom category name."); setLoading(false); return; }
            if (showCustomBuyerInput && !formData.buyer.trim()) { toast.error("Please enter a custom buyer name."); setLoading(false); return; }
            if (showCustomStatusInput && !formData.status.trim()) { toast.error("Please enter a custom status."); setLoading(false); return; }
            if (showCustomShelfInput && (!formData.shelf || isNaN(parseInt(formData.shelf)))) { toast.error("Please enter a valid custom shelf number."); setLoading(false); return; }
            if (showCustomDivisionInput && (!formData.division || isNaN(parseInt(formData.division)))) { toast.error("Please enter a valid custom division number."); setLoading(false); return; }
            if ((!formData.position || isNaN(parseInt(formData.position)))) { toast.error("Please enter a valid position number."); setLoading(false); return; }
            if (!formData.sample_date) { toast.error("Please select a sample date."); setLoading(false); return; }

            // check the position number by shelf and division and shift samples down greater than that
            const samplesShift = await handleIncreasePositions(formData.shelf, formData.division, (parseInt(formData.position) - 1));

            // Continue only if samplesShift is true (meaning positions were successfully shifted or no shift was needed)
            if (samplesShift) {
                // --- Pre-submission: Add new utilities if needed ---
                // These calls should run even if the item already exists on the backend,
                // the backend should handle uniqueness.
                if (showCustomCategoryInput && formData.category.trim()) {
                    await apiCreateCategory(formData.category.trim());
                    toast.success(`New Category "${formData.category}" added.`);
                }
                if (showCustomBuyerInput && formData.buyer.trim()) {
                    await apiCreateBuyer(formData.buyer.trim());
                    toast.success(`New Buyer "${formData.buyer}" added.`);
                }
                if (showCustomStatusInput && formData.status.trim()) {
                    await apiCreateStatus(formData.status.trim());
                    toast.success(`New Status "${formData.status}" added.`);
                }
                if (showCustomShelfInput && formData.shelf) {
                    await apiCreateShelf(parseInt(formData.shelf));
                    toast.success(`New Shelf "${formData.shelf}" added.`);
                }
                if (showCustomDivisionInput && formData.division) {
                    await apiCreateDivision(parseInt(formData.division));
                    toast.success(`New Division "${formData.division}" added.`);
                }

                // After adding new utilities, refresh options for next entry (optional but good UX)
                if (showCustomCategoryInput || showCustomBuyerInput || showCustomStatusInput) { // Shelf/Division aren't dynamic dropdowns yet
                    await refetchAllOptions();
                }

                const payload = {
                    ...formData,
                    sample_date: formData.sample_date.toISOString().split('T')[0], // Format date for API
                    added_by: userInfo?.username,
                    added_at: new Date().toISOString(), // Ensure fresh added_at timestamp
                };
                console.log("Submitting formData:", payload);

                const res = await apiSubmitSample(payload);

                if (res.success) {
                    toast.success("Sample saved successfully! Ready for next entry.");

                    // Reset only Step 3 & 4 related fields, keep others
                    setFormData(prev => ({
                        ...prev,
                        style: "",
                        no_of_sample: "",
                        position: "",
                        comments: "",
                        released: "",
                        sample_date: new Date(), // Reset date to current for next entry
                        added_at: new Date().toISOString(), // Update added_at for next entry
                    }));
                    setSamplesInLocation([]); // Clear location samples as a new one is added
                    setShowCustomCategoryInput(false); // Hide custom input fields after submission
                    setShowCustomBuyerInput(false);
                    setShowCustomStatusInput(false);
                    setShowCustomShelfInput(false);
                    setShowCustomDivisionInput(false);

                    setCurrentStep(3); // Jump back to Step 3 for quick new entry with preserved selections
                }
            } else {
                // If samplesShift is false, it means handleIncreasePositions indicated an issue
                // The error message would have been shown by handleIncreasePositions, so we just return.
                setLoading(false); // Ensure loading is off if we don't proceed
                return;
            }
        } catch (err) {
            toast.error("Failed to save sample or add new utilities.");
            console.error("Submission error:", err);
            // If submission fails, remain on the current step.
        } finally {
            setLoading(false);
        }
    }, [formData, userInfo, showCustomCategoryInput, showCustomBuyerInput, showCustomStatusInput, showCustomShelfInput, showCustomDivisionInput, refetchAllOptions]);


    // Show a full-page loader while initial data is being fetched
    if (loading && currentStep === 1) return <Loader />;


    
  if (!userInfo?.approval) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-semibold text-red-600">
        <h2>System: Your account is not approved yet!!! Contact Admin...</h2>
      </div>
    );
  }

  if (!userInfo?.verification) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-semibold text-red-600">
        <h2>System: Your account is not verified yet!!! Contact Admin...</h2>
      </div>
    )
  };

  
    return (
        <div className="p-4 bg-white text-black shadow rounded max-w-6xl mx-auto my-8">
            <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">Input Sample Details</h2>

            {/* Progress Indicator with clickable steps */}
            <div className="flex justify-between mb-6 text-sm font-medium text-gray-500">
                {[{ step: 1, name: 'Category & Buyer' }, { step: 2, name: 'Location & Status' }, { step: 3, name: 'Sample Details' }, { step: 4, name: 'Date & Review' }]?.map((stepInfo) => (
                    <button
                        type="button"
                        key={stepInfo.step}
                        onClick={() => goToStep(stepInfo.step)}
                        className={`flex-1 text-center px-2 py-1 rounded-full transition-colors duration-200 ease-in-out
                              ${currentStep === stepInfo.step ? 'bg-blue-200 text-blue-800 font-semibold' : 'bg-gray-100 hover:bg-gray-200'}
                              ${stepInfo.step < currentStep || (currentStep === stepInfo.step && currentStep > 1) ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}
                          `}
                        // Disable if trying to jump ahead to a step not yet completed
                        disabled={stepInfo.step > currentStep &&
                            ((stepInfo.step > 1 && (!formData.category || !formData.buyer || (showCustomCategoryInput && !formData.category.trim()) || (showCustomBuyerInput && !formData.buyer.trim()))) ||
                                (stepInfo.step > 2 && (!formData.shelf || !formData.division || !formData.status || (showCustomShelfInput && (!formData.shelf || isNaN(parseInt(formData.shelf)))) || (showCustomDivisionInput && (!formData.division || isNaN(parseInt(formData.division)))) || (showCustomStatusInput && !formData.status.trim()))) ||
                                (stepInfo.step > 3 && (!formData.style || !formData.no_of_sample || !formData.position)))}
                    >
                        {stepInfo.step}. {stepInfo.name}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-10">

                {/* --- Step 1: Category & Buyer Selection --- */}
                <div className="animate-fade-in">
                    <h3 className="text-xl font-semibold mb-4">Step 1: Choose Category and Buyer</h3>

                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Select Category:</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {options.categories?.map((cat) => (
                                <button
                                    type="button"
                                    key={cat._id}
                                    onClick={() => {
                                        setShowCustomCategoryInput(false);
                                        handleCategoryBuyerSelect('category', cat.value);
                                    }}
                                    className={`p-3 rounded-lg border-2 transition-all duration-200 ease-in-out
                                              ${formData.category === cat.value && !showCustomCategoryInput ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md' : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'}
                                              text-sm font-medium`}
                                >
                                    {cat.value}
                                </button>
                            ))}
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCustomCategoryInput(true);
                                    setFormData(prev => ({ ...prev, category: "" })); // Clear category when switching
                                }}
                                className={`p-3 rounded-lg border-2 transition-all duration-200 ease-in-out
                                          ${showCustomCategoryInput ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md' : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'}
                                          text-sm font-medium`}
                            >
                                Add New Category
                            </button>
                        </div>

                        {showCustomCategoryInput && (
                            <input
                                type="text"
                                name="category" // Use 'category' directly
                                value={formData.category}
                                onChange={(e) => handleCustomInputChange('category', e.target.value)}
                                placeholder="Enter New Category Name"
                                className="mt-3 p-2 border rounded w-full focus:ring-blue-500 focus:border-blue-500"
                                required={showCustomCategoryInput}
                            />
                        )}
                        {!formData.category && <p className="text-red-500 text-xs mt-2">Category is required.</p>}
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Select Buyer:</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {console.log(options)}
                            {options?.buyers?.map((buyer) => (
                                <button
                                    type="button"
                                    key={buyer._id || buyer.value}
                                    onClick={() => {
                                        setShowCustomBuyerInput(false);
                                        handleCategoryBuyerSelect('buyer', buyer.value || buyer);
                                    }}
                                    className={`p-3 rounded-lg border-2 transition-all duration-200 ease-in-out
                                              ${formData.buyer === (buyer.value || buyer) && !showCustomBuyerInput ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md' : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'}
                                              text-sm font-medium`}
                                >
                                    {buyer.value || buyer}
                                </button>
                            ))}
                            {
                                userInfo.role === "admin" &&
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCustomBuyerInput(true);
                                        setFormData(prev => ({ ...prev, buyer: "" })); // Clear buyer when switching
                                    }}
                                    className={`p-3 rounded-lg border-2 transition-all duration-200 ease-in-out
                                          ${showCustomBuyerInput ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md' : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'}
                                          text-sm font-medium`}
                                >
                                    Add New Buyer
                                </button>
                            }
                        </div>

                        {showCustomBuyerInput && (
                            <input
                                type="text"
                                name="buyer" // Use 'buyer' directly
                                value={formData.buyer}
                                onChange={(e) => handleCustomInputChange('buyer', e.target.value)}
                                placeholder="Enter New Buyer Name"
                                className="mt-3 p-2 border rounded w-full focus:ring-blue-500 focus:border-blue-500"
                                required={showCustomBuyerInput}
                            />
                        )}
                        {!formData.buyer && <p className="text-red-500 text-xs mt-2">Buyer is required.</p>}
                    </div>
                </div>


                {/* --- Step 2: Location (Shelf, Division) & Status Selection --- */}
                <div className="animate-fade-in">
                    <h3 className="text-xl font-semibold mb-4">Step 2: Set Location and Status</h3>

                    {/* Shelf Selection */}
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Select Shelf:</label>
                        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                            {options.shelfs?.map((shelf) => (
                                <button
                                    type="button"
                                    key={shelf._id}
                                    onClick={() => {
                                        setShowCustomShelfInput(false);
                                        handleLocationStatusSelect('shelf', shelf.value);
                                    }}
                                    className={`p-2 rounded-lg border-2 transition-all duration-200 ease-in-out text-center
                                              ${formData.shelf === shelf.value && !showCustomShelfInput ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md' : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'}
                                              text-sm font-medium`}
                                >
                                    {shelf.value}
                                </button>
                            ))}
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCustomShelfInput(true);
                                    setFormData(prev => ({ ...prev, shelf: "" }));
                                }}
                                className={`p-2 rounded-lg border-2 transition-all duration-200 ease-in-out text-center
                                          ${showCustomShelfInput ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md' : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'}
                                          text-sm font-medium`}
                            >
                                Add New Shelf
                            </button>
                        </div>
                        {showCustomShelfInput && (
                            <input
                                type="number"
                                name="shelf"
                                value={formData.shelf}
                                onChange={(e) => handleCustomInputChange('shelf', e.target.value)}
                                placeholder="Enter New Shelf Number"
                                className="mt-3 p-2 border rounded w-full focus:ring-blue-500 focus:border-blue-500"
                                required={showCustomShelfInput}
                            />
                        )}
                        {!formData.shelf && <p className="text-red-500 text-xs mt-2">Shelf is required.</p>}
                    </div>

                    {/* Division Selection */}
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Select Division:</label>
                        <div className="flex gap-2">
                            {options.divisions?.map((division) => (
                                <button
                                    type="button"
                                    key={division._id}
                                    onClick={() => {
                                        setShowCustomDivisionInput(false);
                                        handleLocationStatusSelect('division', division.value);
                                    }}
                                    className={`flex-1 p-2 rounded-lg border-2 transition-all duration-200 ease-in-out text-center
                                              ${formData.division === division.value && !showCustomDivisionInput ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md' : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'}
                                              text-sm font-medium`}
                                >
                                    {division.value}
                                </button>
                            ))}
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCustomDivisionInput(true);
                                    setFormData(prev => ({ ...prev, division: "" }));
                                }}
                                className={`flex-1 p-2 rounded-lg border-2 transition-all duration-200 ease-in-out text-center
                                          ${showCustomDivisionInput ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md' : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'}
                                          text-sm font-medium`}
                            >
                                Add New Division
                            </button>
                        </div>
                        {showCustomDivisionInput && (
                            <input
                                type="number"
                                name="division"
                                value={formData.division}
                                onChange={(e) => handleCustomInputChange('division', e.target.value)}
                                placeholder="Enter New Division Number"
                                className="mt-3 p-2 border rounded w-full focus:ring-blue-500 focus:border-blue-500"
                                required={showCustomDivisionInput}
                            />
                        )}
                        {!formData.division && <p className="text-red-500 text-xs mt-2">Division is required.</p>}
                    </div>

                    {/* Display Samples in Location */}
                    {(formData.shelf && formData.division && !showCustomShelfInput && !showCustomDivisionInput) ? (
                        <div className="mt-2 mb-6 p-3 bg-gray-100 rounded border border-gray-300">
                            {loadingSamples ? (
                                <p className="text-center text-gray-700">Loading samples for this location...</p>
                            ) : samplesInLocation.length > 0 ? (
                                <>
                                    <h3 className="text-lg font-semibold mb-2 text-gray-800">Samples in Shelf {formData.shelf}, Division {formData.division}: Total - {samplesInLocation.length} Packets</h3>
                                    <ul className="list-disc pl-5 text-gray-700 max-h-40 overflow-y-auto custom-scrollbar">
                                        {samplesInLocation?.map((sample) => (
                                            <li key={sample._id.$oid || sample._id}>
                                                <strong>Style:</strong> {sample.style} | <strong>Category:</strong> {sample.category} | <strong>Buyer:</strong> {sample.buyer} | <strong>Status:</strong> {sample.status}
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            ) : (
                                <p className="text-center text-gray-600">No samples found in Shelf {formData.shelf}, Division {formData.division}.</p>
                            )}
                        </div>
                    ) : (
                        <div className="mt-2 mb-6 p-3 bg-gray-100 rounded border border-gray-300 text-center text-gray-600">
                            Select Shelf and Division to view existing samples.
                        </div>
                    )}

                    {/* Status Selection */}
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Select Status:</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {options.statuses?.map((status) => (
                                <button
                                    type="button"
                                    key={status._id}
                                    onClick={() => {
                                        setShowCustomStatusInput(false);
                                        handleLocationStatusSelect('status', status?.value);
                                    }}
                                    className={`p-3 rounded-lg border-2 transition-all duration-200 ease-in-out
                                              ${formData.status === status?.value && !showCustomStatusInput ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md' : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'}
                                              text-sm font-medium`}
                                >
                                    {status?.value}
                                </button>
                            ))}
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCustomStatusInput(true);
                                    setFormData(prev => ({ ...prev, status: "" })); // Clear status when switching
                                }}
                                className={`p-3 rounded-lg border-2 transition-all duration-200 ease-in-out
                                          ${showCustomStatusInput ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md' : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'}
                                          text-sm font-medium`}
                            >
                                Add New Status
                            </button>
                        </div>

                        {showCustomStatusInput && (
                            <input
                                type="text"
                                name="status" // Use 'status' directly
                                value={formData.status}
                                onChange={(e) => handleCustomInputChange('status', e.target.value)}
                                placeholder="Enter New Status"
                                className="mt-3 p-2 border rounded w-full focus:ring-blue-500 focus:border-blue-500"
                                required={showCustomStatusInput}
                            />
                        )}
                        {!formData.status && <p className="text-red-500 text-xs mt-2">Status is required.</p>}
                    </div>
                </div>

                {/* --- Step 3: Sample Details (Style, No. of Samples, Position, Comments, Released) --- */}
                <div className="animate-fade-in grid gap-4">
                    <h3 className="text-xl font-semibold mb-2">Step 3: Enter Sample Specifics</h3>

                    {/* Style Input */}
                    <div>
                        <label htmlFor="style" className="block text-gray-700 text-sm font-bold mb-2">Style Code:</label>
                        <input
                            id="style"
                            type="text"
                            name="style"
                            value={formData.style}
                            onChange={handleChange}
                            placeholder="e.g., ABC-123"
                            className="border p-2 rounded w-full focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>

                    {/* No. of Samples Dropdown */}
                    <div>
                        <label htmlFor="no_of_sample" className="block text-gray-700 text-sm font-bold mb-2">Number of Samples:</label>
                        <select
                            id="no_of_sample"
                            name="no_of_sample"
                            value={formData.no_of_sample}
                            onChange={handleChange}
                            className="border p-2 rounded w-full focus:ring-blue-500 focus:border-blue-500"
                            required
                        >
                            <option value="">Select quantity</option>
                            {options.no_of_samples?.map((n) => (
                                <option key={`num-${n}`} value={n}>{n}</option>
                            ))}
                        </select>
                    </div>

                    {/* Position Input */}
                    <div>
                        <label htmlFor="position" className="block text-gray-700 text-sm font-bold mb-2">Position in Division:</label>
                        <input
                            id="position"
                            name="position"
                            type="number"
                            value={formData.position}
                            onChange={handleChange}
                            placeholder="e.g., 1, 2, 3..."
                            className="border p-2 rounded w-full focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>

                    {/* Comments Input */}
                    <div>
                        <label htmlFor="comments" className="block text-gray-700 text-sm font-bold mb-2">Comments (Optional):</label>
                        <input
                            id="comments"
                            name="comments"
                            type="text"
                            value={formData.comments}
                            onChange={handleChange}
                            placeholder="Any additional notes"
                            className="border p-2 rounded w-full focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Released Input */}
                    <div>
                        <label htmlFor="released" className="block text-gray-700 text-sm font-bold mb-2">Released To (Optional):</label>
                        <input
                            id="released"
                            name="released"
                            type="text"
                            value={formData.released}
                            onChange={handleChange}
                            placeholder="Name of person/department released to"
                            className="border p-2 rounded w-full focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* --- Step 4: Sample sample_date & Review --- */}
                <div className="animate-fade-in grid gap-4">
                    <h3 className="text-xl font-semibold mb-2">Step 4: Select Date & Review</h3>

                    {/* Date Picker */}
                    <div className="mb-4">
                        <label htmlFor="sample_date" className="block text-gray-700 text-sm font-bold mb-2">Sample Date:</label>
                        <DatePicker
                            id="sample_date" // Added ID
                            selected={formData.sample_date}
                            onChange={handleSampleDateChange}
                            dateFormat="yyyy-MM-dd"
                            className="border p-2 rounded w-full focus:ring-blue-500 focus:border-blue-500"
                            wrapperClassName="w-full"
                            required
                        />
                    </div>

                    {/* Review Section */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="text-lg font-semibold mb-3 text-blue-800">Review Sample Details:</h4>
                        <ul className="text-sm text-gray-700 grid grid-cols-1 md:grid-cols-2 gap-2">
                            <li><strong>Date:</strong> {formData.sample_date instanceof Date ? formData.sample_date.toLocaleDateString() : 'N/A'}</li>
                            <li><strong>Category:</strong> {formData.category || 'N/A'}</li>
                            <li><strong>Buyer:</strong> {formData.buyer || 'N/A'}</li>
                            <li><strong>Style:</strong> {formData.style || 'N/A'}</li>
                            <li><strong>No. of Samples:</strong> {formData.no_of_sample || 'N/A'}</li>
                            <li><strong>Shelf:</strong> {formData.shelf || 'N/A'}</li>
                            <li><strong>Division:</strong> {formData.division || 'N/A'}</li>
                            <li><strong>Position:</strong> {formData.position || 'N/A'}</li>
                            <li><strong>Status:</strong> {formData.status || 'N/A'}</li>
                            <li><strong>Comments:</strong> {formData.comments || 'None'}</li>
                            <li><strong>Released:</strong> {formData.released || 'None'}</li>
                            <li><strong>Added By:</strong> {userInfo?.username || 'Unknown'}</li>
                        </ul>
                    </div>
                </div>

                {/* --- Navigation Buttons & Reset --- */}
                <div className="flex justify-between mt-6 items-center">

                    {(
                        <button
                            type="submit"
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-md"
                        >
                            Submit Sample
                        </button>
                    )}

                    {/* Reset All Selections Button - always visible */}
                    <button
                        type="button"
                        onClick={handleResetAll}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors shadow-md ml-auto"
                    >
                        Reset All
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SinglePageSampleForm;