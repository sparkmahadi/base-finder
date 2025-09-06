// hooks/useUtilityData.js
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { getAuthHeaders } from "../utils/getAuthHeaders";
import { toast } from "react-toastify";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/utilities`;

export const useUtilityData = (utilityType, initialData = []) => {
    const [data, setData] = useState(initialData);
    const [isLoading, setIsLoading] = useState(!initialData.length);

    const endpointMap = {
        // seperate collection used for categories in db
        category: "categories", 
        buyer: "buyers",
        status: "statuses",
        shelf: "shelfs",
        division: "divisions",
    };

    const getEndpoint = (type) => `${API_BASE_URL}/${endpointMap[type] || type}`;

    // --- Fetch data ---
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        toast.info({ text: "", type: "" });
        try {
            const response = await axios.get(getEndpoint(utilityType), { headers: getAuthHeaders() });
            if (response.data.success) {
                console.log('data', response.data.data);
                setData(response.data.data || []);
                toast.success(response.data.message)
            } else {
                setData([]);
                toast.info(response.data.message || `Failed to fetch ${utilityType}.`);
            }
        } catch (error) {
            console.error(`Error fetching ${utilityType}:`, error);
            setData([]);
            toast.info(`Server error fetching ${utilityType}.`);
        } finally {
            setIsLoading(false);
        }
    }, [utilityType]);

    // --- Save (add/update) ---
    const saveData = useCallback(
        async ({ value, createdBy, editingItem }) => {
            console.log(`received ${value} as ${utilityType} to save to db by ${createdBy} editing ${editingItem}`)
            if (!value || !createdBy) return;

            setIsLoading(true);
            toast.info({ text: "", type: "" });

            try {
                const payload = { value: value.trim(), createdBy, utility_type: utilityType };

                if (editingItem?._id) payload._id = editingItem._id;

                const method = editingItem?._id ? "put" : "post";
                const endpoint = editingItem?._id
                    ? `${getEndpoint(utilityType)}/${editingItem._id}`
                    : getEndpoint(utilityType);

                const response = await axios[method](endpoint, payload, { headers: getAuthHeaders() });

                if (response.data.success) {
                    toast.success(response.data.message);
                    fetchData();
                } else {
                    toast.info(response.data.message || `Failed to ${editingItem ? "update" : "add"} ${utilityType}.`);
                }
            } catch (error) {
                console.error(`Error saving ${utilityType}:`, error);
                toast.info(`Server error ${editingItem ? "updating" : "adding"} ${utilityType}.`);
            } finally {
                setIsLoading(false);
            }
        },
        [utilityType, fetchData]
    );

    // --- Delete ---
    const deleteData = useCallback(
        async (itemId) => {
            if (!itemId) return;

            setIsLoading(true);
            try {
                const response = await axios.delete(`${getEndpoint(utilityType)}/${itemId}`, { headers: getAuthHeaders() });
                if (response.data.success) {
                    toast.success(response.data.message);
                    fetchData();
                } else {
                    toast.info(response.data.message || `Failed to delete ${utilityType}.`);
                }
            } catch (error) {
                console.error(`Error deleting ${utilityType}:`, error);
                toast.info(`Server error deleting ${utilityType}.`);
            } finally {
                setIsLoading(false);
            }
        },
        [utilityType, fetchData]
    );

    useEffect(() => {
        if (!initialData.length) fetchData();
        else setIsLoading(false);
    }, [initialData.length, fetchData]);

    return {
        data,
        isLoading,
        fetchData,
        saveData,
        deleteData,
        setData, // manual override if needed
    };
};
