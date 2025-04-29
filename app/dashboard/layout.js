"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  if (isAuthenticated === null) {
    return <h3>Loading...</h3>; // while checking auth, show nothing (no flicker)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <button
          onClick={() => router.push("/sample-categories")}
          className="text-white hover:text-gray-300"
        >
          sample-categories
        </button>
        <button
          onClick={() => router.push("/sample-categories/create-category")}
          className="text-white hover:text-gray-300"
        >
          create-category
        </button>
      </header>

      <main className="flex-grow p-8 bg-gray-100">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center py-4">
        &copy; {new Date().getFullYear()} Your Company. All rights reserved.
      </footer>
    </div>
  );
}
