"use client";

import React, { useEffect, useState } from "react";
import { ShoppingCart, Heart, PackageCheck, Eye, PersonStanding, UtilityPole, PenToolIcon, RecycleIcon } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { useRouter } from "next/navigation";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const router = useRouter();
    const {isAuthenticated, userInfo} = useAuth();
  const [loading, setLoading] = useState(false);
  const [samples, setSamples] = useState([]);
  const [categories, setCategories] = useState([]);
  const [takenSamples, setTakenSamples] = useState([]);
  const [deletedSamples, setDeletedSamples] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    setLoading(true);
    fetchSamples();
    fetchTakenSamples();
    fetchDeletedSamples();
    fetchCategories();
    fetchUsers();
    setLoading(false);
  }, []);

  const fetchSamples = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples`);
      setSamples(res?.data?.samples);
      setLoading(false);
    } catch (err) {
      toast.error("Failed to fetch samples");
      setLoading(false);
    }
  };

  const fetchTakenSamples = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/taken-samples`);
      setTakenSamples(res?.data?.samples);
      setLoading(false);
    } catch (err) {
      toast.error("Failed to fetch samples");
      setLoading(false);
    }
  };

  const fetchDeletedSamples = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/deleted-samples`);
      setDeletedSamples(res?.data?.samples);
      setLoading(false);
    } catch (err) {
      toast.error("Failed to fetch samples");
      setLoading(false);
    }
  };
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/utilities/categories`);
      console.log(res);
      setCategories(res?.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      toast.error("Failed to fetch samples");
    }
  };
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users`);
      console.log(res);
      setUsers(res?.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      toast.error("Failed to fetch samples");
    }
  };


  // You can replace these numbers with real data later
  const stats = [
    {
      title: "Total Samples",
      icon: <PackageCheck className="h-6 w-6 text-blue-600" />,
      link: '/samples',
      value: samples?.length,
    },
    {
      title: "Samples Taken",
      icon: <Eye className="h-6 w-6 text-green-600" />,
      link: '/samples/taken-samples',
      value: takenSamples?.length,
    },
    {
      title: "Favorites",
      icon: <Heart className="h-6 w-6 text-red-500" />,
      link: '/',
      value: 10,
    },
    {
      title: "Total Categories",
      icon: <ShoppingCart className="h-6 w-6 text-purple-500" />,
      link: '/sample-categories',
      value: categories?.length,
    },
  ];
  const adminStats = [
    {
      title: "Total Users",
      icon: <PersonStanding className="h-6 w-6 text-purple-500" />,
      link: '/dashboard/users',
      value: users?.length,
    },
    {
      title: "Deleted Samples",
      icon: <RecycleIcon className="h-6 w-6 text-purple-500" />,
      link: '/samples/deleted-samples',
      value: deletedSamples?.length,
    },
    {
      title: "Unique Categories in Samples",
      icon: <PersonStanding className="h-6 w-6 text-purple-500" />,
      link: '/sample-categories/unique-categories',
      value: users?.length,
    },
    {
      title: "Utilities",
      icon: <UtilityPole className="h-6 w-6 text-purple-500" />,
      link: '/sample-utilities/',
      value: 'N/A',
    },
    {
      title: "Tools",
      icon: <PenToolIcon className="h-6 w-6 text-purple-500" />,
      link: '/tools/',
      value: 'N/A',
    },
  ]

  if (loading) {
    return <Loader />
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Dashboard Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            onClick={() => router.push(stat?.link)}
            key={index}
            className="bg-white rounded-2xl shadow-md p-4 flex items-center justify-between hover:shadow-lg transition cursor-pointer"
          >
            <div>
              <h2 className="text-gray-600 text-sm">{stat.title}</h2>
              <p className="text-xl font-bold">{stat.value}</p>
            </div>
            {stat.icon}
          </div>
        ))}
        {
          userInfo?.role === "admin" &&
          adminStats.map((stat, index) => (
            <div
              onClick={() => router.push(stat?.link)}
              key={index}
              className="bg-white rounded-2xl shadow-md p-4 flex items-center justify-between hover:shadow-lg transition cursor-pointer"
            >
              <div>
                <h2 className="text-gray-600 text-sm">{stat.title}</h2>
                <p className="text-xl font-bold">{stat.value}</p>
              </div>
              {stat.icon}
            </div>
          ))
        }

      </div>
    </div>
  );
};

export default Dashboard;
