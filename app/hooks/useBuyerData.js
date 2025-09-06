// hooks/useBuyerData.js
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { getAuthHeaders } from "../utils/getAuthHeaders";

export const useBuyerData = (initialBuyers = []) => {
  const [buyers, setBuyers] = useState(initialBuyers);
  const [isLoading, setIsLoading] = useState(!initialBuyers.length);
  const [isSearching, setIsSearching] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const BUYERS_API_URL = `${BASE_URL}/utilities/buyers`;

  // Fetch all buyers from API
  const fetchBuyers = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(BUYERS_API_URL, {
        headers: getAuthHeaders(),
      });
      console.log(data);
      setBuyers(data.data || []);
    } catch (err) {
      console.error("Error fetching buyers:", err);
    } finally {
      setIsLoading(false);
    }
  }, [BUYERS_API_URL]);

  // Optional: Search buyers by term
  const searchBuyers = useCallback(
    async (searchTerm) => {
      setIsSearching(true);
      try {
        const { data } = await axios.get(`${BUYERS_API_URL}/search/${searchTerm}`, {
          headers: getAuthHeaders(),
        });
        setBuyers(data.data || []);
      } catch (err) {
        console.error("Error searching buyers:", err);
      } finally {
        setIsSearching(false);
      }
    },
    [BUYERS_API_URL]
  );

  // Refetch utility for components
  const refetchBuyers = async () => {
    await fetchBuyers();
  };

  // Initial fetch on mount if no initial buyers provided
  useEffect(() => {
    if (!initialBuyers.length) {
      fetchBuyers();
    } else {
      setIsLoading(false);
    }
  }, [initialBuyers.length, fetchBuyers]);

  return {
    buyers,
    isLoading,
    isSearching,
    fetchBuyers,   // Full fetch utility
    searchBuyers,  // Search utility
    refetchBuyers, // Manual refetch for components
    setBuyers,     // Optional: allow manual update
  };
};
