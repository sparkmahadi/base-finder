"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import Image from "next/image";

export default function Profile() {
  const { userInfo, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!loading && !userInfo) {
      setError("Failed to load user information.");
    }
  }, [loading, userInfo]);

  if (loading) {
    return <div>Loading profile...</div>; // Loading message or spinner
  }

  if (error) {
    return <div>{error}</div>; // Display error message
  }

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Profile</h2>

      {/* Display user information */}
      <div className="mb-4">
        <h3 className="font-medium text-lg">Username</h3>
        <p>{userInfo?.username || "No username available"}</p>
      </div>

      <div className="mb-4">
        <h3 className="font-medium text-lg">Email</h3>
        <p>{userInfo?.email || "No email available"}</p>
      </div>

      <div className="mb-4">
        <h3 className="font-medium text-lg">Full Name</h3>
        <p>{userInfo?.name || "No full name available"}</p>
      </div>

      <div className="mb-4">
        <h3 className="font-medium text-lg">Team</h3>
        <p>{userInfo?.team || "No Team assigned"}</p>
      </div>

      <div className="mb-4">
        <h3 className="font-medium text-lg">Role</h3>
        <p>{userInfo?.role || "No role assigned"}</p>
      </div>

      <div className="mb-4">
        <h3 className="font-medium text-lg">Approval</h3>
        <p>{userInfo?.approval ? "Approved" : "Not Approved"}</p>
      </div>

      <div className="mb-4">
        <h3 className="font-medium text-lg">Verificaiton</h3>
        <p>{userInfo?.verified ? "Verified" : "Not Verified"}</p>
      </div>

      {/* Profile Image (optional) */}
      {userInfo?.profileImage && (
        <div className="mb-4">
          <h3 className="font-medium text-lg">Profile Image</h3>
          <Image src={userInfo?.profileImage} alt="Profile" className="w-32 h-32 rounded-full" />
        </div>
      )}

      <div className="flex justify-end mt-6">
        <button
          onClick={() => router.push("profile/update-profile")} // Assuming a page to update profile
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Edit Profile
        </button>
        {userInfo?.team ||
          <button
            onClick={() => window.alert("This feature is still manual. Contact Mahadi!!!")} // Assuming a page to update profile
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
          >
            Request Team
          </button>}
      </div>
    </div>
  );
}
