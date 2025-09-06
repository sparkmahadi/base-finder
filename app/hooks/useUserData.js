// hooks/useUserData.js
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { getAuthHeaders } from "../utils/getAuthHeaders";

export const useUserData = (initialUsers = []) => {
  const [users, setUsers] = useState(initialUsers);
  const [isLoading, setIsLoading] = useState(!initialUsers.length);
  const [isSearching, setIsSearching] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const USERS_API_URL = `${BASE_URL}/users`;

  // Fetch all users from API
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(USERS_API_URL, {
        headers: getAuthHeaders(),
      });
      setUsers(data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setIsLoading(false);
    }
  }, [USERS_API_URL]);

  // Utility to refetch users (for components)
  const refetchUsers = async () => {
    await fetchUsers();
  };

  // Initial fetch on mount if no initialUsers provided
  useEffect(() => {
    if (!initialUsers.length) {
      fetchUsers();
    } else {
      setIsLoading(false);
    }
  }, [initialUsers.length, fetchUsers]);

  return {
    users,
    isLoading,
    isSearching,
    fetchUsers,   // Full fetch utility
    refetchUsers, // Manual refetch for components
    setUsers,     // Optional: allow manual update
  };
};
