import { useState, useCallback, useEffect } from 'react'; // Add useEffect
import { toast } from 'react-toastify';
import { updateSample } from '../services/sampleService';

/**
 * Custom hook for managing sample editing form state and save functionality.
 * @param {Object} initialSample - The initial sample data.
 * @param {function} setSample - Setter for the main sample state in the component.
 * @param {function} setIsEditing - Setter for the editing state in the component.
 * @returns {Object} An object containing editedSample, handleChange, handleSave, loading, error, shiftPreference, setShiftPreference.
 */
export const useSampleForm = (initialSample, setSample, setIsEditing) => {
    const [editedSample, setEditedSample] = useState(initialSample);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [shiftPreference, setShiftPreference] = useState('none'); // Default to 'none'

    // Use useEffect to update editedSample when initialSample changes
    // This handles cases where `sample` is fetched asynchronously or re-fetched.
    useEffect(() => {
        if (initialSample) { // Only update if initialSample is not null
            setEditedSample(initialSample);
            setShiftPreference('none'); // Reset shift preference when sample changes
        }
    }, [initialSample]);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setEditedSample((prev) => ({ ...prev, [name]: value }));
    }, []);

    const handleSave = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const oldPosition = initialSample?.position; // Use initialSample for original position
            const payload = {
                ...editedSample,
                oldPosition: oldPosition,
                shiftPreference: shiftPreference,
                // Ensure shelf and division are correctly typed if needed by backend
                shelf: editedSample.shelf,
                division: editedSample.division,
            };

            const data = await updateSample(id, payload);

            setSample(data.updatedSample); // Update main sample state
            setEditedSample(data.updatedSample); // Keep edited state in sync
            setIsEditing(false);
            setShiftPreference('none'); // Reset after save
            toast.success("Sample updated successfully!");
        } catch (err) {
            console.error('Error saving sample:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Failed to save sample. Please try again.');
            toast.error(err.response?.data?.message || 'Failed to save sample. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [editedSample, initialSample, setSample, setIsEditing, shiftPreference]); // Include shiftPreference in dependencies

    return { editedSample, handleChange, handleSave, loading, error, shiftPreference, setShiftPreference };
};