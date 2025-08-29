"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/app/context/AuthContext";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Users = () => {
  const { isAuthenticated, userInfo } = useAuth();
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Form states for new/edited user
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [team, setTeam] = useState("");
  const [role, setRole] = useState("viewer");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // NEW STATES for verification and approval
  const [verification, setVerification] = useState(false);
  const [approval, setApproval] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchTeams();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/users`
      );
      setUsers(response.data);
    } catch (err) {
      console.error("Error fetching users:", err);
      toast.error(
        err.response?.data?.message || "Failed to fetch users. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      return token ? { Authorization: `Bearer ${token}` } : null;
    }
    return null;
  };

  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const API_URL = `${BASE_URL}/teams`;

  // Fetch teams
  const fetchTeams = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(API_URL, { headers: getAuthToken() });
      setTeams(data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setUsername("");
    setName("");
    setEmail("");
    setTeam(""),
      setRole("viewer");
    setPassword("");
    setCurrentUser(null);
    setShowPassword(false);
    // Reset new states
    setVerification(false);
    setApproval(false);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Creating user...");
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users`, {
        username,
        name,
        email,
        team,
        role,
        password,
        verification, // Include new fields
        approval,     // Include new fields
      });
      toast.update(toastId, {
        render: "User created successfully!",
        type: "success",
        isLoading: false,
        autoClose: 5000,
      });
      setShowForm(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      console.error("Error creating user:", err);
      toast.update(toastId, {
        render:
          err.response?.data?.message || "Failed to create user. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    }
  };

  const handleEditUser = (user) => {
    setCurrentUser(user);
    setUsername(user.username);
    setName(user.name);
    setEmail(user.email);
    setTeam(user.team);
    setRole(user.role);
    setPassword(""); // Never pre-fill password for security
    setShowPassword(false); // Default to hidden when editing
    // Set new states from the user object
    setVerification(user.verification || false); // Default to false if not present
    setApproval(user.approval || false);       // Default to false if not present
    setShowForm(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const toastId = toast.loading("Updating user..."); // This creates the loading toast

    try {
      const updateData = { username, name, email, team, role, verification, approval };
      if (password) {
        updateData.password = password;
      }

      // --- IMPORTANT DEBUGGING POINTS ---
      console.log("Frontend: Sending update request with ID:", currentUser._id);
      console.log("Frontend: Sending update data:", updateData);

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${currentUser._id}`,
        updateData
      );

      // --- CRUCIAL CHECKS AFTER RESPONSE ---
      console.log("Frontend: Received API response STATUS:", response.status); // Log the HTTP status code
      console.log("Frontend: Received API response DATA:", response.data);   // Log the full response body

      // This code *should* be executed if the response is 200 OK
      toast.update(toastId, {
        render: response.data.message || "User updated successfully!",
        type: "success",
        isLoading: false,
        autoClose: 5000,
      });
      console.log("Frontend: Toast updated to SUCCESS with message:", response.data.message);

      setShowForm(false);
      resetForm();
      fetchUsers(); // Refresh the user list
    } catch (err) {
      // --- THIS BLOCK IS EXECUTED ON ANY ERROR ---
      console.error("Frontend: An error occurred during update request.");
      console.error("Frontend: Error object:", err);
      console.error("Frontend: Error response status:", err.response?.status); // Log error status
      console.error("Frontend: Error response data:", err.response?.data);   // Log error data
      console.error("Frontend: Error message (from catch):", err.message);

      toast.update(toastId, {
        render:
          err.response?.data?.message || "Failed to update user. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
      console.log("Frontend: Toast updated to ERROR with message:", err.response?.data?.message || "Default error message");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }
    const toastId = toast.loading("Deleting user...");
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${userId}`
      );
      toast.update(toastId, {
        render: "User deleted successfully!",
        type: "success",
        isLoading: false,
        autoClose: 5000,
      });
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
      toast.update(toastId, {
        render:
          err.response?.data?.message || "Failed to delete user. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    }
  };

  const isAdmin = isAuthenticated && userInfo?.role === "admin";

  if (loading) {
    return <div className="p-5">Loading users...</div>;
  }

  return (
    <div className="p-5">

      <h1 className="text-3xl font-bold mb-6">User List</h1>

      {isAdmin && (
        <button
          onClick={() => {
            setShowForm(true);
            resetForm();
          }}
          className="mb-5 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
        >
          Add New User
        </button>
      )}

      {showForm && isAdmin && (
        <div className="border border-gray-300 p-5 mb-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">
            {currentUser ? "Edit User" : "Add New User"}
          </h2>
          <form onSubmit={currentUser ? handleUpdateUser : handleCreateUser}>
            {/* Username */}
            <div className="mb-4">
              <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
                Username:
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/* Name */}
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
                Name:
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/* Email */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                Email:
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Team */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                Team:
              </label>
              <select
                name="team"
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                className="w-full p-2 mb-4 border rounded"
              >
                <option value="">Select Team</option> {/* default placeholder */}
                {teams?.map(team => <option key={team._id} value={team?.team_name}>{team?.team_name}</option>)}
              </select>
            </div>


            {/* Role */}
            <div className="mb-4">
              <label htmlFor="role" className="block text-gray-700 text-sm font-bold mb-2">
                Role:
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-blue-500"
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {/* Password */}
            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
                Password:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={!currentUser}
                  placeholder={
                    currentUser
                      ? "Leave blank to keep current password"
                      : "Enter password"
                  }
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-blue-500"
                />
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 whitespace-nowrap"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                )}
              </div>
            </div>
            {/* Verification Checkbox */}
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                id="verification"
                checked={verification}
                onChange={(e) => setVerification(e.target.checked)}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="verification" className="text-gray-700 text-sm font-bold">
                Verification
              </label>
            </div>
            {/* Approval Checkbox */}
            <div className="mb-6 flex items-center">
              <input
                type="checkbox"
                id="approval"
                checked={approval}
                onChange={(e) => setApproval(e.target.checked)}
                className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="approval" className="text-gray-700 text-sm font-bold">
                Approval
              </label>
            </div>

            {/* Form Buttons */}
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
              >
                {currentUser ? "Update User" : "Create User"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* User List Display */}
      <ul className="list-none p-0">
        {users?.map((user) => (
          <li
            key={user._id}
            className="border border-gray-200 p-4 mb-3 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 shadow-sm"
          >
            <div className="mb-2 sm:mb-0">
              <strong className="text-lg font-medium">{user.name}</strong>{" "}
              <span className="text-gray-600">({user.username})</span> -{" "}
              <span className="text-blue-600">{user.email}</span> - Role:{" "}
              <span className="font-semibold text-purple-700">{user.role}</span>
              <span className="text-blue-600"></span> - Team:{" "}
              <span className="font-semibold text-purple-700">{user.team}</span>
              <br />
              <small className="text-gray-500 text-sm">
                Created: {new Date(user.createdAt).toLocaleDateString()}
              </small>
              {/* Display verification and approval status */}
              <div className="mt-1 text-sm">
                Verification:{" "}
                <span className={`font-semibold ${user.verification ? 'text-green-600' : 'text-red-600'}`}>
                  {user.verification ? "Verified" : "Not Verified"}
                </span>
                <span className="mx-2">|</span>
                Approval:{" "}
                <span className={`font-semibold ${user.approval ? 'text-green-600' : 'text-red-600'}`}>
                  {user.approval ? "Approved" : "Pending"}
                </span>
              </div>
            </div>
            {isAdmin && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditUser(user)}
                  className="px-3 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 transition duration-150 ease-in-out"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteUser(user._id)}
                  className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
                >
                  Delete
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Users;