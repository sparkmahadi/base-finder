"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { getAuthHeaders } from "../utils/getAuthHeaders";
import { useUserData } from "../hooks/useUserData";
import { useBuyerData } from "../hooks/useBuyerData";

export default function TeamsManager() {
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const API_URL = `${BASE_URL}/teams`;
  const USERS_API_URL = `${BASE_URL}/users`;

  const router = useRouter();

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {users} = useUserData();
  const {buyers} = useBuyerData();

  const [formData, setFormData] = useState({
    team_name: "",
    buyers: [],
    members: [], // will contain objects like { user_id, username, role }
  });

  // Fetch teams
  const fetchTeams = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get(API_URL, {headers: getAuthHeaders()});
      setTeams(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
    setLoading(false);
  };


  // Toggle buyer selection
  const toggleBuyer = (username) => {
    setFormData((prev) => {
      const buyers = prev.buyers.includes(username)
        ? prev.buyers.filter((b) => b !== username)
        : [...prev.buyers, username];
      return { ...prev, buyers };
    });
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  // Handle change for team_name
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Add user as member with default role "member"
  const addMember = (user) => {
    if (formData.members.find((m) => m.user_id === user._id)) {
      // already added
      return;
    }
    setFormData((prev) => ({
      ...prev,
      members: [...prev.members, { user_id: user._id, username: user.username, role: "member" }],
    }));
  };

  // Remove member by user_id
  const removeMember = (user_id) => {
    setFormData((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m.user_id !== user_id),
    }));
  };

  // Change role of member
  const changeMemberRole = (user_id, role) => {
    setFormData((prev) => ({
      ...prev,
      members: prev.members.map((m) => (m.user_id === user_id ? { ...m, role } : m)),
    }));
  };

  // Create team API call
  const createTeam = async () => {
    setLoading(true);
    setError("");

    if (formData.buyers.length === 0) {
      setError("Select at least one buyer");
      setLoading(false);
      return;
    }

    if (!formData.team_name) {
      setError("Team name is required");
      setLoading(false);
      return;
    }

    if (formData.members.length === 0) {
      setError("Add at least one member");
      setLoading(false);
      return;
    }

    const validMembers = formData.members.every(
      (m) => m.user_id && m.username && m.role
    );
    if (!validMembers) {
      setError("Members must have all fields filled");
      setLoading(false);
      return;
    }

    try {
      const body = {
        team_name: formData.team_name,
        buyers: formData.buyers,
        members: formData.members,
      };

      await axios.post(API_URL, body);
      setFormData({ team_name: "", buyers: [], members: [] });
      fetchTeams();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
    setLoading(false);
  };

  // Delete team
  const deleteTeam = async (id) => {
    setLoading(true);
    setError("");
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchTeams();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Teams Manager</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {loading && (
        <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded">
          Loading...
        </div>
      )}

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Create New Team</h2>
        <input
          name="team_name"
          value={formData.team_name}
          onChange={handleChange}
          placeholder="Team Name"
          className="w-full p-2 mb-3 border border-gray-300 rounded"
          disabled={loading}
        />
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Select Buyers</h3>
          <div className="max-h-40 overflow-y-auto border rounded p-2 grid grid-cols-2 md:grid-cols-3 gap-2 bg-gray-50">
            {buyers.length === 0 && (
              <p className="col-span-full text-gray-500">No buyers found</p>
            )}
            {buyers?.map((buyer) => {
              const isSelected = formData.buyers.includes(buyer.value);
              return (
                <button
                  key={buyer._id}
                  type="button"
                  onClick={() => toggleBuyer(buyer.value)}
                  disabled={loading}
                  className={`text-left p-2 rounded border ${isSelected
                      ? "bg-green-300 border-green-500"
                      : "hover:bg-blue-100 border-gray-300"
                    }`}
                  aria-pressed={isSelected}
                  aria-label={`${isSelected ? "Deselect" : "Select"} buyer ${buyer.value
                    }`}
                >
                  {buyer.value}
                </button>
              );
            })}
          </div>
        </div>

        {/* Users list for adding members */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Select Members</h3>
          <div className="max-h-40 overflow-y-auto border rounded p-2 grid grid-cols-2 md:grid-cols-3 gap-2 bg-gray-50">
            {users.length === 0 && (
              <p className="col-span-full text-gray-500">No users found</p>
            )}
            {users.map((user) => {
              const isAdded = formData.members.some((m) => m.user_id === user._id);
              return (
                <button
                  key={user._id}
                  type="button"
                  disabled={loading || isAdded}
                  onClick={() => addMember(user)}
                  className={`text-left p-2 rounded border ${isAdded
                      ? "bg-green-200 border-green-400 cursor-not-allowed"
                      : "hover:bg-blue-100 border-gray-300"
                    }`}
                  title={isAdded ? "Already added" : "Add member"}
                >
                  {user.username} ({user.email || user._id})
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected members with role selector */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Team Members</h3>
          {formData.members.length === 0 && (
            <p className="text-gray-500">No members selected</p>
          )}
          <ul className="space-y-2">
            {formData.members.map(({ user_id, username, role }) => (
              <li
                key={user_id}
                className="flex items-center gap-4 border p-2 rounded bg-white"
              >
                <span className="flex-grow">{username}</span>
                <select
                  value={role}
                  onChange={(e) => changeMemberRole(user_id, e.target.value)}
                  disabled={loading}
                  className="border rounded p-1"
                >
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                </select>
                <button
                  type="button"
                  onClick={() => removeMember(user_id)}
                  disabled={loading}
                  className="text-red-600 hover:text-red-800 font-bold text-xl"
                  aria-label={`Remove ${username}`}
                >
                  &times;
                </button>
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={createTeam}
          disabled={loading}
          className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Create Team
        </button>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Teams List</h2>
        {teams.length === 0 && !loading && (
          <p className="text-gray-600">No teams found.</p>
        )}
        <ul className="space-y-6">
          {teams.map((team) => (
            <li
              key={team._id}
              className="border rounded p-4 shadow-sm bg-white"
            >
              <h3 className="text-lg font-bold">{team.team_name}</h3>
              <p>
                <span className="font-semibold">Buyers:</span>{" "}
                {team.buyers.join(", ")}
              </p>
              <p>
                <span className="font-semibold">Members:</span>{" "}
                {team.members.map((m) => `${m.username} (${m.role})`).join(", ")}
              </p>
              <p className="text-sm text-gray-500">
                Created At: {new Date(team.created_at).toLocaleString()}
              </p>
              <button
                onClick={() => router.push(`/teams/${team._id}`)}
                disabled={loading}
                className="mt-3 bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 disabled:opacity-50"
              >
                Edit
              </button>
              <button
                onClick={() => deleteTeam(team._id)}
                disabled={loading}
                className="mt-3 bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 disabled:opacity-50"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
