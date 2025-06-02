"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return <Loader />
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white p-4 flex justify-between">
        <h1 className="text-xl font-semibold">Dashboard</h1>
      </header>

      <main className="flex-grow p-8 bg-gray-100">{children}</main>

    </div>
  );
}
