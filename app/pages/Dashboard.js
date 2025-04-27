"use client";


import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await API.get("/protected"); // Protected backend route
        setUser(res.data);
      } catch (error) {
        router.push("/login");
      }
    }
    fetchUser();
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold">
        Welcome, {user.username}!
      </h1>
    </div>
  );
}
