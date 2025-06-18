import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { takeSampleApi, putBackSampleApi, deleteSampleApi } from '../services/sampleService';

/**
 * Custom hook for handling sample take, put back, and delete actions with modals.
 * It now manages the ID of the sample currently targeted by a modal action.
 * @param {Object} userInfo - User information (e.g., { username: '...' }).
 * @param {function} setRefetchTrigger - Function to trigger a re-fetch of sample data in the calling component.
 * @returns {Object} An object containing modal states, handlers, and action-specific data.
 */
export const useSampleModalActions = (userInfo, setRefetchTrigger) => { // Removed currentSampleId from params
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [modalTargetSampleId, setModalTargetSampleId] = useState(null); // New state to track which sample ID is for the modal

    // Take Modal State
    const [isTakeModalOpen, setIsTakeModalOpen] = useState(false);
    const [takePurpose, setTakePurpose] = useState("");

    // Put Back Modal State
    const [isPutBackModalOpen, setIsPutBackModal] = useState(false);
    const [putBackPosition, setPutBackPosition] = useState("");
    const [putBackPurpose, setPutBackPurpose] = useState("");

    // Delete Modal State
    const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);

    // --- Take Sample Actions ---
    const openTakeModal = useCallback((sampleId) => { // Now accepts sampleId
        setModalTargetSampleId(sampleId);
        setIsTakeModalOpen(true);
    }, []);
    const closeTakeModal = useCallback(() => {
        setIsTakeModalOpen(false);
        setTakePurpose("");
        setModalTargetSampleId(null); // Clear target ID
    }, []);

    const handleConfirmTake = useCallback(async () => {
        if (!takePurpose.trim()) {
            toast.error("Please enter a purpose for taking the sample.");
            return;
        }
        if (!modalTargetSampleId) {
            toast.error("No sample selected for this action.");
            return;
        }

        setLoading(true);
        try {
            const data = await takeSampleApi(modalTargetSampleId, takePurpose, userInfo?.username);
            if (data?.success) {
                toast.success(data.message);
                closeTakeModal();
                if (data.new_taken_sample_id) {
                    router.replace(`/samples/${data.new_taken_sample_id}`);
                } else {
                    setRefetchTrigger((prev) => prev + 1); // Trigger re-fetch in parent
                }
            } else {
                toast.error(data.message || "Failed to take sample.");
            }
        } catch (error) {
            console.error("Error taking sample:", error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Failed to take sample.");
        } finally {
            setLoading(false);
        }
    }, [modalTargetSampleId, takePurpose, userInfo, closeTakeModal, setRefetchTrigger, router]);

    // --- Put Back Sample Actions ---
    const openPutBackModal = useCallback((sampleId) => { // Now accepts sampleId
        setModalTargetSampleId(sampleId);
        setIsPutBackModal(true);
    }, []);
    const closePutBackModal = useCallback(() => {
        setIsPutBackModal(false);
        setPutBackPosition("");
        setPutBackPurpose("");
        setModalTargetSampleId(null); // Clear target ID
    }, []);

    const handleConfirmPutBack = useCallback(async () => {
        if (!putBackPosition.trim()) {
            toast.error("Please enter the new position for the sample.");
            return;
        }
        if (!modalTargetSampleId) {
            toast.error("No sample selected for this action.");
            return;
        }

        setLoading(true);
        try {
            const data = await putBackSampleApi(modalTargetSampleId, putBackPosition, userInfo?.username, putBackPurpose);
            if (data?.success) {
                toast.success(data.message);
                closePutBackModal();
                if (data.new_sample_id) {
                    router.replace(`/samples/${data.new_sample_id}`);
                } else {
                    setRefetchTrigger((prev) => prev + 1); // Trigger re-fetch in parent
                }
            } else {
                toast.error(data.message || "Failed to put back sample.");
            }
        } catch (error) {
            console.error("Error putting back sample:", error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Failed to put back sample.");
        } finally {
            setLoading(false);
        }
    }, [modalTargetSampleId, putBackPosition, putBackPurpose, userInfo, closePutBackModal, setRefetchTrigger, router]);

    // --- Delete Sample Actions ---
    const openDeleteConfirmModal = useCallback((sampleId) => { // Now accepts sampleId
        setModalTargetSampleId(sampleId);
        setIsDeleteConfirmModalOpen(true);
    }, []);
    const closeDeleteConfirmModal = useCallback(() => {
        setIsDeleteConfirmModalOpen(false);
        setModalTargetSampleId(null); // Clear target ID
    }, []);

    const handleConfirmDelete = useCallback(async () => {
        if (!modalTargetSampleId) {
            toast.error("No sample selected for deletion.");
            return;
        }
        setLoading(true);
        try {
            const data = await deleteSampleApi(modalTargetSampleId);
            if (data?.success) {
                toast.success(data.message);
                // If the main sample was deleted, navigate away.
                // Otherwise, just re-fetch if a divisional sample was deleted.
                if (router.query.id === modalTargetSampleId) {
                     router.push('/samples');
                } else {
                    setRefetchTrigger((prev) => prev + 1); // For divisional samples
                }
            } else {
                toast.error(data.message || "Failed to delete sample.");
            }
        } catch (error) {
            console.error("Error deleting sample:", error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Failed to delete sample.");
        } finally {
            closeDeleteConfirmModal();
            setLoading(false);
        }
    }, [modalTargetSampleId, router, closeDeleteConfirmModal, setRefetchTrigger]);

    return {
        loading,
        isTakeModalOpen, openTakeModal, closeTakeModal,
        takePurpose, setTakePurpose, handleConfirmTake,
        isPutBackModalOpen, openPutBackModal, closePutBackModal,
        putBackPosition, setPutBackPosition, putBackPurpose, setPutBackPurpose, handleConfirmPutBack,
        isDeleteConfirmModalOpen, openDeleteConfirmModal, closeDeleteConfirmModal, handleConfirmDelete,
        modalTargetSampleId // Expose this if the modal content needs to display the target ID
    };
};