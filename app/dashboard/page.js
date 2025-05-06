"use client";

import React from "react";
import { ShoppingCart, Heart, PackageCheck, Eye } from "lucide-react";

const Dashboard = () => {
  // You can replace these numbers with real data later
  const stats = [
    {
      title: "Total Samples",
      icon: <PackageCheck className="h-6 w-6 text-blue-600" />,
      value: 125,
    },
    {
      title: "Samples Taken",
      icon: <Eye className="h-6 w-6 text-green-600" />,
      value: 48,
    },
    {
      title: "Favorites",
      icon: <Heart className="h-6 w-6 text-red-500" />,
      value: 10,
    },
    {
      title: "Total Categories",
      icon: <ShoppingCart className="h-6 w-6 text-purple-500" />,
      value: 8,
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Dashboard Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-md p-4 flex items-center justify-between hover:shadow-lg transition"
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
