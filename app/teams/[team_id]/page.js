"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import TeamDetails from "@/app/components/TeamDetails"; // adjust path as needed
import { getAuthHeaders } from "@/app/utils/getAuthHeaders";

export default function TeamPage() {
    const { team_id: teamId } = useParams();
    const router = useRouter();
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

    const [team, setTeam] = useState(null);
    const [usersList, setUsersList] = useState(null);
    const [buyersList, setBuyersList] = useState([]); // <-- full buyers list
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    console.log(usersList);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError("");
            try {
                const [teamRes, buyersRes, usersRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/teams/${teamId}`, {headers: getAuthHeaders()}),
                    axios.get(`${API_BASE_URL}/utilities/buyers`, {headers: getAuthHeaders()}),
                    axios.get(`${API_BASE_URL}/users`, {headers: getAuthHeaders()}),
                ]);
                setTeam(teamRes.data.data);
                setBuyersList(buyersRes.data.data || []);
                setUsersList(usersRes.data || []);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
            }
            setLoading(false);
        };
        fetchData();
    }, [teamId]);

    const handleUpdate = async (updatedData) => {
        try {
            await axios.put(`${API_BASE_URL}/teams/${teamId}`, updatedData);
            const { data } = await axios.get(`${API_BASE_URL}/teams/${teamId}`);
            setTeam(data.data);
            alert("Team updated successfully!");
        } catch (err) {
            alert("Update failed: " + (err.response?.data?.message || err.message));
        }
    };

    if (loading) return <p className="p-6 text-center">Loading team details...</p>;
    if (error) return <p className="p-6 text-center text-red-600">{error}</p>;
    if (!team) return <p className="p-6 text-center">Team not found.</p>;

    return (
        <div className="p-6">
            <TeamDetails
                team={team}
                allBuyers={buyersList} // <-- pass buyers list here
                allUsers={usersList} // <-- pass buyers list here
                onUpdate={handleUpdate}
                onCancel={() => router.push("/teams")}
            />
        </div>
    );
}
