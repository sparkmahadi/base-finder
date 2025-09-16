"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/app/context/AuthContext";

export default function UpdateProfile() {
  const { userInfo, loading, setRefetchUser } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    name: "",
  });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Populate form when userInfo loads
  useEffect(() => {
    if (!loading && userInfo) {
      setFormData({
        username: userInfo.username || "",
        email: userInfo.email || "",
        name: userInfo.name || "",
      });
    }
    if (!loading && !userInfo) {
      setError("Failed to load user information.");
    }
  }, [loading, userInfo]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/update-by-user/${userInfo?._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to update profile");
      setRefetchUser(true);
      router.push("/profile"); // Redirect or just stay on page
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Update Profile</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="font-medium">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="font-medium">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {userInfo?.profileImage && (
          <div className="mb-4">
            <h3 className="font-medium">Profile Image</h3>
            <Image
              src={userInfo.profileImage}
              alt="Profile"
              className="w-32 h-32 rounded-full"
              width={128}
              height={128}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          {saving ? "Saving..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
}
