import React, { useState, useEffect, memo } from "react";
import { toast } from "react-toastify";
import { getAuthHeaders } from "../utils/getAuthHeaders";
import axios from "axios";

export default function TeamDetails({ team, allBuyers = [], allUsers = [], onUpdate, onCancel }) {
    // Local state for editing the team
    const [formData, setFormData] = useState({
        team_name: "",
        buyers: [],
        members: [],
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Sync props team to local form state on mount or team change
    useEffect(() => {
        if (team) {
            setFormData({
                team_name: team.team_name || "",
                buyers: Array.isArray(team.buyers) ? team.buyers : [],
                members: Array.isArray(team.members)
                    ? team.members.map((m) => ({
                        user_id: m.user_id || m._id || "",
                        username: m.username || "",
                        role: m.role || "member",
                    }))
                    : [],
            });
            setError("");
        }
    }, [team]);

    // Handle input change for team name
    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    // Toggle buyer in buyers array
    const toggleBuyer = (username) => {
        setFormData((prev) => {
            const buyers = prev.buyers.includes(username)
                ? prev.buyers.filter((b) => b !== username)
                : [...prev.buyers, username];
            return { ...prev, buyers };
        });
    };

    const addMember = (user) => {
        if (formData.members.find((m) => m.user_id === user._id)) return; // prevent duplicates
        setFormData((prev) => ({
            ...prev,
            members: [...prev.members, { user_id: user._id, username: user.username, role: "member" }],
        }));
    };


    // Change role of member
    const changeMemberRole = (user_id, role) => {
        setFormData((prev) => ({
            ...prev,
            members: prev.members.map((m) =>
                m.user_id === user_id ? { ...m, role } : m
            ),
        }));
    };

    // Remove member
    const removeMember = (user_id) => {
        setFormData((prev) => ({
            ...prev,
            members: prev.members.filter((m) => m.user_id !== user_id),
        }));
    };

    // Form submit handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!formData.team_name.trim()) {
            setError("Team name is required");
            return;
        }
        if (formData.buyers.length === 0) {
            setError("Select at least one buyer");
            return;
        }
        if (formData.members.length === 0) {
            setError("Add at least one member");
            return;
        }

        const validMembers = formData.members.every(
            (m) => m.user_id && m.username && m.role
        );
        if (!validMembers) {
            setError("All members must have user_id, username and role");
            return;
        }

        try {
            setLoading(true);

            // ✅ 1) Update team first
            await onUpdate({
                team_name: formData.team_name,
                buyers: formData.buyers,
                members: formData.members,
            });

            console.log("after update", formData)

            // ✅ 2) Then update all users (in parallel)
            await Promise.all(
                formData.members.map((member) =>
                    handleUpdateUser(member.user_id, formData.team_name)
                )
            );

            toast.success("Team and users updated successfully!");
        } catch (err) {
            console.error("Error updating team or users:", err);
            setError("Failed to update team or users. Please try again.");
        } finally {
            setLoading(false);
        }
    };


    const handleUpdateUser = async (userId, team) => {
        const toastId = toast.loading(`Updating user ${userId}...`);
        console.log(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${userId}`);
        
        try {
            const updateData = { team };
            console.log("Frontend: Updating user:", userId, "with data:", updateData);
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${userId}`,
                updateData, { headers: getAuthHeaders() }
            );
            console.log("response", response);

            toast.update(toastId, {
                render: response.data.message || `User ${userId} updated successfully!`,
                type: "success",
                isLoading: false,
                autoClose: 3000,
            });
        } catch (err) {
            toast.update(toastId, {
                render: err.response?.data?.message || `Failed to update user ${userId}`,
                type: "error",
                isLoading: false,
                autoClose: 3000,
            });
        }
    };


    if (!team) {
        return (
            <div className="p-4 text-center text-gray-600">
                No team selected to view details.
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
            <h2 className="text-2xl font-bold mb-6">Edit Team Details</h2>

            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Team Name */}
                <div>
                    <label htmlFor="team_name" className="block font-semibold mb-1">
                        Team Name
                    </label>
                    <input
                        id="team_name"
                        name="team_name"
                        type="text"
                        value={formData.team_name}
                        onChange={handleChange}
                        disabled={loading}
                        className="w-full border border-gray-300 rounded p-2"
                    />
                </div>

                {/* Buyers */}
                <div>
                    <label className="block font-semibold mb-2">Buyers</label>
                    <div className="max-h-40 overflow-y-auto border rounded p-2 grid grid-cols-2 md:grid-cols-3 gap-2 bg-gray-50">
                        {allBuyers.length === 0 && (
                            <p className="col-span-full text-gray-500">No buyers available</p>
                        )}
                        {allBuyers.map((buyer) => {
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

                {/* Members */}
                <div>
                    <label className="block font-semibold mb-2">Members</label>
                    {formData.members.length === 0 ? (
                        <p className="text-gray-500">No members assigned.</p>
                    ) : (
                        <ul className="space-y-3">
                            {formData.members.map(({ user_id, username, role }) => (
                                <li
                                    key={user_id}
                                    className="flex items-center justify-between border p-2 rounded"
                                >
                                    <div>
                                        <span className="font-medium">{username}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
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
                                            aria-label={`Remove member ${username}`}
                                        >
                                            &times;
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>


                {/* Add Members from allUsers */}
                <div>
                    <label className="block font-semibold mb-2">Add More Members</label>
                    <div className="max-h-40 overflow-y-auto border rounded p-2 grid grid-cols-2 md:grid-cols-3 gap-2 bg-gray-50">
                        {allUsers.length === 0 && (
                            <p className="col-span-full text-gray-500">No users available</p>
                        )}
                        {allUsers.map((user) => {
                            const alreadyAdded = formData.members.some(m => m.user_id === user._id);
                            return (
                                <button
                                    key={user._id}
                                    type="button"
                                    onClick={() => addMember(user)}
                                    disabled={loading || alreadyAdded}
                                    className={`text-left p-2 rounded border ${alreadyAdded
                                        ? "bg-green-200 border-green-400 cursor-not-allowed"
                                        : "hover:bg-blue-100 border-gray-300"
                                        }`}
                                    title={alreadyAdded ? "Already added" : "Add member"}
                                >
                                    {user.username} {user.email ? `(${user.email})` : ""}
                                </button>
                            );
                        })}
                    </div>
                </div>



                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                    >
                        {loading ? "Updating..." : "Update Team"}
                    </button>

                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={loading}
                            className="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
