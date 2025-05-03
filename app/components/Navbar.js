"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { Menu, LogOut, User, PlusCircle, LayoutDashboard, List } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const { isAuthenticated, logout, userInfo } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <nav className="bg-blue-600 shadow-md px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <div
          className="text-white font-extrabold text-2xl cursor-pointer tracking-wide"
          onClick={() => router.push("/")}
        >
          BaseFinder
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-6 items-center">
          <NavButton label="Samples" icon={<List size={18} />} onClick={() => router.push("/samples")} />
          <NavButton label="Add Sample" icon={<PlusCircle size={18} />} onClick={() => router.push("/samples/add-sample")} />
          <NavButton label="Upload excel" icon={<PlusCircle size={18} />} onClick={() => router.push("/samples/add-sample/upload-excel")} />
          <NavButton label="Taken Samples" icon={<List size={18} />} onClick={() => router.push("/samples/taken-samples")} />

          {isAuthenticated ? (
            <>
              <NavButton label="Dashboard" icon={<LayoutDashboard size={18} />} onClick={() => router.push("/dashboard")} />
              <div className="relative group">
                <button className="text-white hover:text-gray-200 font-medium flex items-center gap-1">
                  <User size={18} />
                  {userInfo?.username || "User"}
                </button>
                <div className="absolute hidden group-hover:block bg-white text-gray-700 mt-2 right-0 shadow-md rounded-md overflow-hidden w-40 z-20">
                  <div
                    onClick={() => router.push("/profile")}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    Profile
                  </div>
                  <div
                    onClick={handleLogout}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-1"
                  >
                    <LogOut size={16} /> Logout
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <NavButton label="Login" onClick={() => router.push("/login")} />
              <NavButton label="Register" onClick={() => router.push("/register")} />
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu className="text-white" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-blue-700 px-4 py-3 space-y-3 text-white">
          <MobileLink label="Samples" onClick={() => router.push("/samples")} />
          <MobileLink label="Add Sample" onClick={() => router.push("/samples/add-sample")} />
          <MobileLink label="Upload excel" onClick={() => router.push("/samples/add-sample/upload-excel")} />
          <MobileLink label="Taken Samples" onClick={() => router.push("/samples/taken-samples")} />

          {isAuthenticated ? (
            <>
              <MobileLink label="Dashboard" onClick={() => router.push("/dashboard")} />
              <MobileLink label="Profile" onClick={() => router.push("/profile")} />
              <MobileLink label="Logout" onClick={handleLogout} />
            </>
          ) : (
            <>
              <MobileLink label="Login" onClick={() => router.push("/login")} />
              <MobileLink label="Register" onClick={() => router.push("/register")} />
            </>
          )}
        </div>
      )}
    </nav>
  );
}

// Desktop Nav Button
function NavButton({ label, icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-white hover:text-gray-200 font-medium flex items-center gap-1 transition cursor-pointer"
    >
      {icon}
      {label}
    </button>
  );
}

// Mobile Nav Item
function MobileLink({ label, onClick }) {
  return (
    <div
      onClick={onClick}
      className="block text-white font-medium hover:text-gray-300 cursor-pointer"
    >
      {label}
    </div>
  );
}
