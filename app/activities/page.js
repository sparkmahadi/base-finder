"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

const ActivitiesList = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

    const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const API_URL = `${BASE_URL}/activities`; 

    const getAuthToken = () => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : null;
  }
  return null;
};

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_URL, {headers: getAuthToken()});
        setActivities(response.data.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch activities");
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  if (loading) return <p className="text-center mt-4">Loading activities...</p>;
  if (error) return <p className="text-center mt-4 text-red-600">{error}</p>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-center">Activity Log</h2>
      <ul className="space-y-2">
        {activities.map((activity) => {
          const date = new Date(activity.timestamp);
          return (
            <li
              key={activity._id.$oid}
              className="border p-3 rounded shadow-sm hover:bg-gray-50 transition"
            >
              <p className="text-gray-800">{activity.message}</p>
              <p className="text-sm text-gray-500">
                {date.toLocaleString()}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ActivitiesList;
