// hooks/useSampleData.js
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

/**
 * Custom hook for managing sample data, including fetching, deleting, taking, and putting back samples.
 *
 * @param {Array} initialSamples - Initial array of samples, usually from server-side props.
 * @returns {Object} An object containing sample data, loading states, and action functions.
 */
export const useSampleData = (initialSamples) => {
  const [samples, setSamples] = useState(initialSamples);
  const [isLoading, setIsLoading] = useState(!initialSamples.length); // General loading for initial fetch
  const [isMutating, setIsMutating] = useState(false); // For delete, take, put back actions
  const [isSearching, setIsSearching] = useState(false); // For search/filter operations

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Function to refresh the entire sample list from the API
  const refreshSamples = useCallback(async (searchTerm = "") => {
    setIsLoading(true); // General loading for refresh
    try {
      const res = await axios.get(`${API_BASE_URL}/api/samples`, {
        params: { search: searchTerm }, // Pass search term for refresh too
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setSamples(res.data.samples || []);
      if(res.data?.message){
          toast.success(res.data?.message);
      }
      if (searchTerm && (!res.data.samples || res.data.samples.length === 0)) {
        toast.info("No matching samples found for your search term.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch sample list.");
      console.error("Error refreshing samples:", err);
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL]);

  // Initial data fetch or refresh if initialSamples is empty
  useEffect(() => {
    if (!initialSamples.length) {
      refreshSamples();
    } else {
      setIsLoading(false); // If initial data was provided, turn off loading immediately
    }
  }, [initialSamples.length, refreshSamples]);

  // Centralized handleDelete function
  const handleDelete = useCallback(async (id, reduceOtherPositions) => {
    setIsMutating(true);
    try {
      const res = await axios.delete(
        `${API_BASE_URL}/api/samples/${id}?reducePositions=${reduceOtherPositions}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (res.data?.success) {
        toast.success("Sample deleted successfully!");
        if (res.data?.message) toast.success(res.data.message);
        refreshSamples(); // Refresh data after successful delete
      } else {
        toast.error(res.data?.message || "Failed to delete sample.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete sample: Network Error");
      console.error("Delete sample error:", err);
    } finally {
      setIsMutating(false);
    }
  }, [API_BASE_URL, refreshSamples]);

  // Centralized handleTake function
  const handleTake = useCallback(async (id, purpose, userInfo) => {
    setIsMutating(true);
    const body = {
      taken_by: userInfo?.username,
      purpose,
      taken_at: new Date().toISOString(),
    };
    try {
      const res = await axios.put(`${API_BASE_URL}/api/samples/${id}/take`, body, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.data?.success) {
        toast.success(res.data.message);
        refreshSamples();
      } else {
        toast.error(res.data?.message || "Failed to take sample.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to take sample: Network Error");
      console.error("Take sample error:", err);
    } finally {
      setIsMutating(false);
    }
  }, [API_BASE_URL, refreshSamples]);

  // Centralized handlePutBack function
  const handlePutBack = useCallback(async (sampleId, newPosition, returnPurpose, userInfo) => {
    setIsMutating(true);
    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/samples/putback/${sampleId}`,
        { position: newPosition, returned_by: userInfo?.username, return_purpose: returnPurpose },
        {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (res.data?.success) {
        toast.success(res.data.message);
        refreshSamples();
      } else {
        toast.error(res.data?.message || "Failed to put back sample.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "An unexpected error occurred while putting back the sample.");
      console.error("Put back API call failed:", err);
    } finally {
      setIsMutating(false);
    }
  }, [API_BASE_URL, refreshSamples]);

  return {
    samples,
    isLoading,
    isMutating,
    isSearching,
    refreshSamples,
    handleDelete,
    handleTake,
    handlePutBack,
    setIsSearching, // Expose to allow the component to set this for search operations
  };
};