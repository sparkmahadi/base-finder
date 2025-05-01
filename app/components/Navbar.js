"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext"; // adjust path

export default function Navbar() {
  const router = useRouter();
  const { isAuthenticated, logout, getUserInfo, userInfo } = useAuth();
  // getUserInfo();
  console.log(userInfo);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <nav className="bg-blue-600 p-4 flex justify-between items-center">
      {/* Logo / Title */}
      <div
        className="text-white font-bold text-xl cursor-pointer"
        onClick={() => router.push("/")}
      >
        BaseFinder
      </div>

      {/* Navigation Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={() => router.push("/samples")}
          className="text-white hover:text-gray-300"
        >
          Samples
        </button>
        <button
          onClick={() => router.push("/samples/add-sample")}
          className="text-white hover:text-gray-300"
        >
          Add Samples
        </button>
        <button
          onClick={() => router.push("/samples/taken-samples")}
          className="text-white hover:text-gray-300"
        >
          Taken Samples
        </button>

        {isAuthenticated ? (
          <>
            <button
              onClick={() => router.push("/dashboard")}
              className="text-white hover:text-gray-300"
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push("/profile")}
              className="text-white hover:text-gray-300"
            >
              {userInfo?.username}
            </button>
            <button
              onClick={handleLogout}
              className="text-white hover:text-gray-300"
            >
              Logout
            </button>
          </> 
        ) : (
          <>
            <button
              onClick={() => router.push("/login")}
              className="text-white hover:text-gray-300"
            >
              Login
            </button>
            <button
              onClick={() => router.push("/register")}
              className="text-white hover:text-gray-300"
            >
              Register
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
