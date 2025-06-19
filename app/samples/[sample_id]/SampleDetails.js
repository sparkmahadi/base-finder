import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';

// Import your new hooks
import { useSampleForm } from '../hooks/useSampleForm';
import { useSampleModalActions } from '../hooks/useSampleModalActions';
import { useSamplePositionManagement } from '../hooks/useSamplePositionManagement';
import { useDivisionalSampleDisplay } from '../hooks/useDivisionalSampleDisplay';

// Assuming you have these components and helper functions
import Loader from '../components/Loader'; // Adjust path
import Modal from '../components/Modal'; // Adjust path
import SampleListRow from '../components/SampleListRow'; // Adjust path
import { editableFields, nonEditableFields, tableHeadings } from '@/app/utils/structures';

// Helper for date formatting
const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
        return new Date(dateString).toLocaleString();
    } catch {
        return '-';
    }
};


function SampleDetails() {
    const router = useRouter();
    const { id } = router.query;

    const [sample, setSample] = useState(null);
    const [isLoadingInitial, setIsLoadingInitial] = useState(true);
    const [errorInitial, setErrorInitial] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [refetchTrigger, setRefetchTrigger] = useState(0); // To trigger re-fetching after actions

    // Dummy user info - replace with actual context/auth data, e.g., from a useContext hook
    const [userInfo] = useState({ username: 'john.doe', role: 'admin' });

    // --- Data Fetching for Main SampleDetails ---
    const fetchSampleDetails = useCallback(async () => {
        if (!id) return;
        setIsLoadingInitial(true);
        setErrorInitial(null);
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            setSample(res.data);
            setErrorInitial(null); // Clear any previous errors
        } catch (err) {
            console.error("Error fetching sample details:", err);
            setErrorInitial(err.response?.data?.message || "Failed to load sample details.");
            setSample(null); // Ensure sample is null on error
        } finally {
            setIsLoadingInitial(false);
        }
    }, [id]);

    useEffect(() => {
        fetchSampleDetails();
    }, [id, refetchTrigger, fetchSampleDetails]); // Add fetchSampleDetails to deps

    // --- Using the Custom Hooks ---
    const {
        editedSample,
        handleChange,
        handleSave,
        loading: savingLoading,
        error: savingError,
        shiftPreference,
        setShiftPreference
    } = useSampleForm(sample, setSample, setIsEditing); // Pass sample, setSample, setIsEditing

    const {
        loading: modalActionsLoading,
        isTakeModalOpen, openTakeModal, closeTakeModal,
        takePurpose, setTakePurpose, handleConfirmTake,
        isPutBackModalOpen, openPutBackModal, closePutBackModal,
        putBackPosition, setPutBackPosition, putBackPurpose, setPutBackPurpose, handleConfirmPutBack,
        isDeleteConfirmModalOpen, openDeleteConfirmModal, closeDeleteConfirmModal, handleConfirmDelete,
        modalTargetSampleId // Get the ID of the sample currently targeted by a modal
    } = useSampleModalActions(userInfo, setRefetchTrigger); // No longer pass currentSampleId at hook init

    const {
        showOtherSamplesInDivision,
        divisionalSamples,
        loadingDivisionalSamples,
        errorDivisionalSamples,
        handleShowOtherSamplesInDivision,
        handleHideOtherSamplesInDivision,
        fetchSamplesInDivision
    } = useDivisionalSampleDisplay();

    const {
        loadingPositionActions,
        handleIncreasePositions,
        handleReducePositions,
        handleNormalizeConsecutiveDivision,
    } = useSamplePositionManagement(fetchSamplesInDivision); // Pass fetcher from divisional display hook

    // Combine all relevant loading and error states for main UI feedback
    const overallLoading = isLoadingInitial || savingLoading || modalActionsLoading || loadingPositionActions || loadingDivisionalSamples;
    const overallError = errorInitial || savingError || errorDivisionalSamples; // Combine errors

    // Function to handle edit mode toggle
    const handleEdit = useCallback(() => {
        setIsEditing(true);
        // useSampleForm's useEffect will sync editedSample to current sample
    }, []);

    // --- Conditional Renderings for Loading/Error/No Sample ---
    if (isLoadingInitial) {
        return <Loader message="Loading sample details..." />;
    }

    if (overallError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4">
                <div className="text-center p-8 bg-white shadow-lg rounded-lg border border-red-200">
                    <p className="text-red-600 text-xl font-semibold mb-4">Error: {overallError}</p>
                    <p className="text-gray-600 mb-6">We couldn&apos;t load the sample data. Please check your network connection or try again.</p>
                    <button
                        onClick={() => setRefetchTrigger(prev => prev + 1)} // Trigger re-fetch
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition duration-200 ease-in-out"
                    >
                        Retry
                    </button>
                    <button
                        onClick={() => router.back()}
                        className="ml-4 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg shadow-md transition duration-200 ease-in-out"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (!sample && !isLoadingInitial) { // Ensure it's not just loading
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4">
                <div className="text-center p-8 bg-white shadow-lg rounded-lg border border-yellow-200">
                    <p className="text-yellow-700 text-xl font-semibold mb-4">No Sample Found</p>
                    <p className="text-gray-600 mb-6">The sample ID might be incorrect or the sample does not exist.</p>
                    <button
                        onClick={() => router.push('/samples')}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition duration-200 ease-in-out"
                    >
                        Browse All Samples
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className='flex justify-center'>
            {/* main division */}
            <div className="p-8 max-w-5xl mx-auto bg-gray-50 min-h-screen">
                <div className="bg-white shadow-xl rounded-lg p-8">
                    <h1 className="text-3xl font-extrabold text-gray-800 mb-6 border-b pb-4">
                        Sample Details
                    </h1>

                    {/* Editable Fields Section */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-700 mb-4">
                            {isEditing ? 'Edit Sample Information' : 'General Information'}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            {editableFields.map((field) => (
                                <div key={field.key} className="flex flex-col">
                                    <label className="text-sm font-medium text-gray-600 mb-1 capitalize">
                                        {field.label}
                                    </label>
                                    {isEditing ? (
                                        field.type === 'textarea' ? (
                                            <textarea
                                                name={field.key}
                                                value={editedSample[field.key] ?? ''}
                                                onChange={handleChange}
                                                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                                                rows="3"
                                            />
                                        ) : (
                                            <>
                                                <input
                                                    type={field.type}
                                                    name={field.key}
                                                    value={editedSample[field.key] ?? ''}
                                                    onChange={handleChange}
                                                    className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                                                />
                                                {/* --- NEW: Shifting Options for Position Field --- */}
                                                {field.key === 'position' && (
                                                    <div className="mt-3 p-3 bg-gray-50 rounded-md border border-gray-200">
                                                        <p className="font-semibold text-gray-700 mb-2">How to adjust other samples?</p>
                                                        <label className="flex items-center mb-1">
                                                            <input
                                                                type="radio"
                                                                className="form-radio text-blue-600 h-4 w-4"
                                                                name="shiftOption"
                                                                value="none"
                                                                checked={shiftPreference === 'none'}
                                                                onChange={() => setShiftPreference('none')}
                                                            />
                                                            <span className="ml-2 text-gray-800">
                                                                No shifting (Only update this sample&apos;s position, may cause duplicates)
                                                            </span>
                                                        </label>
                                                        <label className="flex items-center mb-1">
                                                            <input
                                                                type="radio"
                                                                className="form-radio text-blue-600 h-4 w-4"
                                                                name="shiftOption"
                                                                value="makeSpace"
                                                                checked={shiftPreference === 'makeSpace'}
                                                                onChange={() => setShiftPreference('makeSpace')}
                                                            />
                                                            <span className="ml-2 text-gray-800">
                                                                Shift to make space (Push samples at or after new position down by 1)
                                                            </span>
                                                        </label>
                                                        <label className="flex items-center">
                                                            <input
                                                                type="radio"
                                                                className="form-radio text-blue-600 h-4 w-4"
                                                                name="shiftOption"
                                                                value="adjustSequence"
                                                                checked={shiftPreference === 'adjustSequence'}
                                                                onChange={() => setShiftPreference('adjustSequence')}
                                                            />
                                                            <span className="ml-2 text-gray-800">
                                                                Adjust sequence (Re-order samples between old and new positions)
                                                            </span>
                                                        </label>
                                                    </div>
                                                )}
                                            </>
                                        )
                                    ) : (
                                        <p className="text-gray-800 font-semibold bg-gray-100 p-2 rounded-md">
                                            {field.isDate ? formatDate(sample?.[field.key]) : sample?.[field.key] ?? '-'}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={() => handleSave(sample?._id)}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-5 rounded-lg shadow-md transition duration-200 ease-in-out"
                                    disabled={overallLoading}
                                >
                                    {overallLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button
                                    onClick={() => { setIsEditing(false); setEditedSample(sample); setShiftPreference('none'); }} // Reset to original sample
                                    className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-5 rounded-lg shadow-md transition duration-200 ease-in-out"
                                    disabled={overallLoading}
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={handleEdit}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg shadow-md transition duration-200 ease-in-out"
                                    disabled={overallLoading}
                                >
                                    Edit Sample
                                </button>
                                {sample?.availability !== "no" ? (
                                    <button
                                        onClick={() => openTakeModal(sample?._id)}
                                        className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-sm font-medium shadow-md transition duration-200"
                                        disabled={overallLoading}
                                    >
                                        Take
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => openPutBackModal(sample?._id)}
                                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 rounded text-sm font-medium shadow-md transition duration-200"
                                        disabled={overallLoading}
                                    >
                                        Put Back
                                    </button>
                                )}
                                {userInfo?.role === "admin" && (
                                    <>
                                        <button
                                            onClick={() => openDeleteConfirmModal(sample?._id)}
                                            className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-sm font-medium shadow-md transition duration-200"
                                            disabled={overallLoading}
                                        >
                                            Delete
                                        </button>
                                        <button
                                            onClick={() => handleReducePositions(sample?.shelf, sample?.division, sample?.position)}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded text-sm font-medium shadow-md transition duration-200"
                                            disabled={overallLoading}
                                        >
                                            Reduce Positions
                                        </button>
                                        <button
                                            onClick={() => handleIncreasePositions(sample?.shelf, sample?.division, sample?.position)}
                                            className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded text-sm font-medium shadow-md transition duration-200"
                                            disabled={overallLoading}
                                        >
                                            Increase Positions
                                        </button>
                                        <button
                                            onClick={() => handleShowOtherSamplesInDivision(sample?.shelf, sample?.division)}
                                            className="bg-sky-600 hover:bg-sky-700 text-white px-2 py-1 rounded text-sm font-medium shadow-md transition duration-200"
                                            disabled={overallLoading}
                                        >
                                            Show Full Division
                                        </button>
                                        <button
                                            onClick={() => handleNormalizeConsecutiveDivision(sample?.shelf, sample?.division)}
                                            className="bg-orange-600 hover:bg-orange-700 text-white px-2 py-1 rounded text-sm font-medium shadow-md transition duration-200"
                                            disabled={overallLoading}
                                        >
                                            Normalize Division
                                        </button>
                                    </>
                                )}
                            </>
                        )}
                    </div>

                    {/* Non-Editable Fields Section */}
                    <div className="mb-8 mt-8">
                        <h2 className="text-2xl font-bold text-gray-700 mb-4">
                            System Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            {nonEditableFields.map((field) => (
                                <div key={field.key} className="flex flex-col">
                                    <label className="text-sm font-medium text-gray-600 mb-1 capitalize">
                                        {field.label}
                                    </label>
                                    <p className="text-gray-800 font-semibold bg-gray-100 p-2 rounded-md">
                                        {field.isDate ? formatDate(sample?.[field.key]) : sample?.[field.key] ?? '-'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Taken Logs */}
                    <h2 className="text-2xl font-bold text-gray-700 mt-10 mb-4 border-b pb-3">
                        Taken Logs
                    </h2>
                    {sample?.taken_logs && sample.taken_logs.length > 0 ? (
                        <ul className="space-y-3 pl-5 text-gray-700">
                            {sample.taken_logs.map((log, idx) => (
                                <li key={idx} className="bg-gray-50 p-3 rounded-md shadow-sm">
                                    <span className="font-semibold">Taken By:</span>{' '}
                                    {log.taken_by ?? '-'},{' '}
                                    <span className="font-semibold">at:</span>{' '}
                                    {formatDate(log.taken_at)},{' '}
                                    <span className="font-semibold">Purpose:</span>{' '}
                                    {log.purpose || 'N/A'}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 italic">No taken logs available.</p>
                    )}

                    {/* Returned Logs */}
                    <h2 className="text-2xl font-bold text-gray-700 mt-10 mb-4 border-b pb-3">
                        Returned Logs
                    </h2>
                    {sample?.returned_log && sample.returned_log.length > 0 ? (
                        <ul className="space-y-3 pl-5 text-gray-700">
                            {sample.returned_log.map((log, idx) => (
                                <li key={idx} className="bg-gray-50 p-3 rounded-md shadow-sm">
                                    <span className="font-semibold">Returned By:</span>{' '}
                                    {log.returned_by ?? '-'},{' '}
                                    <span className="font-semibold">at:</span>{' '}
                                    {formatDate(log.returned_at)},{' '}
                                    <span className="font-semibold">Returned Position:</span>{' '}
                                    {log.position || 'N/A'}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 italic">No returned logs available.</p>
                    )}
                </div>
            </div>

            {/* Side Division for Other Samples */}
            {showOtherSamplesInDivision && (
                <div className="p-8 max-w-2xl w-full bg-white shadow-xl rounded-lg ml-8 self-start sticky top-8">
                    <h2 className="text-2xl font-extrabold text-gray-800 mb-6 border-b pb-4">
                        Samples in Division {sample?.shelf}-{sample?.division}
                    </h2>
                    {loadingDivisionalSamples ? (
                        <Loader message="Loading other samples in this division..." />
                    ) : divisionalSamples.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full border-collapse text-sm text-center whitespace-nowrap">
                                <thead className="bg-gray-100 text-xs text-gray-700 uppercase">
                                    <tr>
                                        {tableHeadings?.map(({ label, key }, idx) => (
                                            <th key={idx} className="px-3 py-3 border-b-2 border-gray-200 font-semibold lg:max-w-32">
                                                <div className="flex flex-col gap-1 items-center justify-center lg:max-w-32">
                                                    <span className="font-semibold truncate">{label}</span>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {divisionalSamples.map((divSample, idx) => (
                                        <SampleListRow
                                            key={divSample._id}
                                            sample={divSample}
                                            index={idx}
                                            userRole={userInfo?.role}
                                            userInfo={userInfo}
                                            // Pass open modal functions, which now accept the ID
                                            handleDelete={() => openDeleteConfirmModal(divSample._id)}
                                            handleTake={() => openTakeModal(divSample._id)}
                                            handlePutBack={() => openPutBackModal(divSample._id)}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">No other samples found in this division.</p>
                    )}
                    <button
                        onClick={handleHideOtherSamplesInDivision}
                        className="mt-6 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-5 rounded-lg shadow-md transition duration-200 ease-in-out"
                    >
                        Hide Division Samples
                    </button>
                </div>
            )}

            {/* Modals - Passed directly from the useSampleModalActions hook */}
            {/* The modal content should reflect `modalTargetSampleId` if needed */}
            <Modal
                isOpen={isTakeModalOpen}
                onClose={closeTakeModal}
                title="Take Sample"
                footer={
                    <>
                        <button
                            onClick={closeTakeModal}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-4 py-2 rounded-md transition-colors duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirmTake}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition-colors duration-200"
                            disabled={overallLoading}
                        >
                            {overallLoading ? 'Taking...' : 'Confirm Take'}
                        </button>
                    </>
                }
            >
                <p className="mb-4 text-gray-700">Please enter a **purpose** for taking sample **{modalTargetSampleId}**:</p>
                <input
                    type="text"
                    value={takePurpose}
                    onChange={(e) => setTakePurpose(e.target.value)}
                    placeholder="e.g., For client meeting, Internal review"
                    className="border border-gray-300 w-full p-2.5 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                    aria-label="Purpose for taking sample"
                />
            </Modal>

            <Modal
                isOpen={isPutBackModalOpen}
                onClose={closePutBackModal}
                title="Put Back Sample"
                footer={
                    <>
                        <button
                            onClick={closePutBackModal}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-4 py-2 rounded-md transition-colors duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirmPutBack}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition-colors duration-200"
                            disabled={overallLoading}
                        >
                            {overallLoading ? 'Putting Back...' : 'Confirm Put Back'}
                        </button>
                    </>
                }
            >
                <p className="mb-4 text-gray-700">Please enter the **new position** for sample **{modalTargetSampleId}**:</p>
                <input
                    type="text"
                    value={putBackPosition}
                    onChange={(e) => setPutBackPosition(e.target.value)}
                    placeholder="e.g., 1-A-5"
                    className="border border-gray-300 w-full p-2.5 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                    aria-label="New position for sample"
                />
                <p className="mt-4 mb-4 text-gray-700">Optional: Enter a **purpose** for putting back the sample:</p>
                <input
                    type="text"
                    value={putBackPurpose}
                    onChange={(e) => setPutBackPurpose(e.target.value)}
                    placeholder="e.g., Returned after review"
                    className="border border-gray-300 w-full p-2.5 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                    aria-label="Purpose for putting back sample"
                />
            </Modal>

            <Modal
                isOpen={isDeleteConfirmModalOpen}
                onClose={closeDeleteConfirmModal}
                title="Confirm Deletion"
                footer={
                    <>
                        <button
                            onClick={closeDeleteConfirmModal}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-4 py-2 rounded-md transition-colors duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirmDelete}
                            className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-md transition-colors duration-200"
                            disabled={overallLoading}
                        >
                            {overallLoading ? 'Deleting...' : 'Delete Sample'}
                        </button>
                    </>
                }
            >
                <p className="text-gray-700">Are you sure you want to delete sample **{modalTargetSampleId}**? This action cannot be undone.</p>
            </Modal>
        </div>
    );
}

export default SampleDetails;