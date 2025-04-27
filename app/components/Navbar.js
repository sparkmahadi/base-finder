"use client";

import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <nav className="bg-blue-600 p-4 flex justify-between items-center">
      <div className="text-white font-bold text-xl cursor-pointer" onClick={() => router.push("/")}>
        BaseFinder
      </div>
      <div className="flex space-x-4">
        <button onClick={() => router.push("/samples")} className="text-white hover:text-gray-300">
          Samples
        </button>
        <button onClick={() => router.push("/dashboard")} className="text-white hover:text-gray-300">
          Dashboard
        </button>
        <button onClick={handleLogout} className="text-white hover:text-gray-300">
          Logout
        </button>
      </div>
    </nav>
  );
}
