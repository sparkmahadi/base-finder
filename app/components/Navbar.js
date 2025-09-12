"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { Menu, LogOut, User, PlusCircle, LayoutDashboard, List } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function Navbar() {
  const router = useRouter();
  const { isAuthenticated, logout, userInfo } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [submenuVisible, setSubmenuVisible] = useState(false);
  const userMenuRef = useRef(null); // Ref for the user menu
  const userIconRef = useRef(null); // Ref for the user icon button

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Close submenu if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userMenuRef.current && !userMenuRef.current.contains(event.target) &&
        userIconRef.current && !userIconRef.current.contains(event.target)
      ) {
        setSubmenuVisible(false); // Close submenu if clicked outside
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleSubmenuToggle = () => {
    setSubmenuVisible((prev) => !prev); // Toggle submenu on click
  };

  const handleSubmenuItemClick = () => {
    setSubmenuVisible(false); // Close submenu after clicking on an item
  };

  const handleMouseEnter = () => {
    setSubmenuVisible(true); // Show submenu on hover
  };

  const handleMouseLeave = () => {
    if (!submenuVisible) {
      setSubmenuVisible(false); // Hide submenu if hover is removed and submenu is not clicked
    }
  };

  return (
    <nav className="bg-gray-700 shadow-md px-6 py-4">
      <div className="mx-5 flex justify-between items-center">
        {/* Logo */}
        <div
          className="text-white font-extrabold text-2xl cursor-pointer tracking-wide"
          onClick={() => router.push("/")}
        >
          BaseFinder V2
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-6 items-center">
          <NavButton label="Samples" icon={<List size={18} />} onClick={() => router.push("/samples")} />
          <NavButton label="Add Sample" icon={<PlusCircle size={18} />} onClick={() => router.push("/samples/add-sample")} />
          <NavButton label="Pattern Release" icon={<PlusCircle size={18} />} onClick={() => router.push("/pattern-release-log")} />
          <NavButton label="Upload excel" icon={<PlusCircle size={18} />} onClick={() => router.push("/samples/add-sample/upload-excel")} />
          <NavButton label="Taken Samples" icon={<List size={18} />} onClick={() => router.push("/samples/taken-samples")} />

          {isAuthenticated ? (
            <>
              <NavButton label="Dashboard" icon={<LayoutDashboard size={18} />} onClick={() => router.push("/dashboard")} />
              <div
                className="relative group"
                ref={userMenuRef}
                onMouseEnter={handleMouseEnter} // Show submenu on hover
                onMouseLeave={handleMouseLeave} // Hide submenu when hover is removed
              >
                <button
                  className="text-white hover:text-gray-200 font-medium flex items-center gap-1"
                  onClick={handleSubmenuToggle} // Toggle submenu visibility on click
                  ref={userIconRef}
                >
                  <User size={18} />
                  {userInfo?.username || "User"}
                </button>
                {/* Submenu */}
                {submenuVisible && (
                  <div className="absolute bg-white text-gray-700 mt-2 right-0 shadow-md rounded-md overflow-hidden w-40 z-20">
                    <div
                      onClick={() => { router.push("/profile"); handleSubmenuItemClick(); }} // Hide submenu after clicking item
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      Profile
                    </div>
                    <div
                      onClick={() => { handleLogout(); handleSubmenuItemClick(); }} // Hide submenu after clicking logout
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-1"
                    >
                      <LogOut size={16} /> Logout
                    </div>
                  </div>
                )}
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
          <MobileLink label="Pattern Release" onClick={() => router.push("/pattern-release-log")} />
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
