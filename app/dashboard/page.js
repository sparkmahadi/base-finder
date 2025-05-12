"use client";

import React, { useEffect, useState } from "react";
import { ShoppingCart, Heart, PackageCheck, Eye } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { useRouter } from "next/navigation";

const Dashboard = () => {
  const router = useRouter();
  const [samples, setSamples] = useState([]);
  const [categories, setCategories] = useState([]);
  const [takenSamples, setTakenSamples] = useState([]);

    useEffect(() => {
      fetchSamples();
      fetchTakenSamples();
      fetchCategories();
    }, []);

    const fetchSamples = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples`);
        setSamples(res?.data?.samples);
      } catch (err) {
        toast.error("Failed to fetch samples");
      }
    };

    const fetchTakenSamples = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/taken-samples`);
        setTakenSamples(res?.data?.samples);
      } catch (err) {
        toast.error("Failed to fetch samples");
      }
    };
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/utilities/categories`);
        console.log(res);
        setCategories(res?.data);
      } catch (err) {
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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Dashboard Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
          onClick={()=>router.push(stat?.link)}
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
      </div>
    </div>
  );
};

export default Dashboard;
