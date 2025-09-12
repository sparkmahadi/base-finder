"use client"

import DashboardClient from './DashboardClient';
import axios from "axios";
import { getAuthHeaders } from '../utils/getAuthHeaders';
import { useEffect, useState } from 'react';



export default function DashboardData() {

  const [samples, setSamples] = useState([]);
  const [categories, setCategories] = useState([]);
  const [takenSamples, setTakenSamples] = useState([]);
  const [deletedSamples, setDeletedSamples] = useState([]);
  const [users, setUsers] = useState([]);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  
useEffect(() => {
  const fetchData = async () => {
    try {
      const [samplesRes, takenRes, deletedRes, categoriesRes, usersRes] =
        await Promise.all([
          axios.get(`${API_BASE_URL}/samples`, { headers: getAuthHeaders() }),
          axios.get(`${API_BASE_URL}/samples/taken-samples`, {
            headers: getAuthHeaders(),
          }),
          axios.get(`${API_BASE_URL}/samples/deleted-samples`, {
            headers: getAuthHeaders(),
          }),
          axios.get(`${API_BASE_URL}/utilities/categories`, {
            headers: getAuthHeaders(),
          }),
          axios.get(`${API_BASE_URL}/users`, { headers: getAuthHeaders() }),
        ]);

      setSamples(samplesRes.data?.samples || []);
      setTakenSamples(takenRes.data?.samples || []);
      setDeletedSamples(deletedRes.data?.samples || []);
      setCategories(categoriesRes.data?.data || []);
      setUsers(usersRes.data || []);
    } catch (err) {
      console.error("Error fetching dashboard data", err);
    }
  };

  fetchData();
}, []);


  return (
    <DashboardClient
      samples={samples}
      takenSamples={takenSamples}
      deletedSamples={deletedSamples}
      categories={categories}
      users={users}
    />
  );
}