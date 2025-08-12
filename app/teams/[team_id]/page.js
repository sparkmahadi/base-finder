"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import TeamDetails from "@/app/components/TeamDetails"; // adjust path as needed

export default function TeamPage() {
    const { team_id: teamId } = useParams();
    const router = useRouter();

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
                    axios.get(`http://localhost:5000/api/v2/teams/${teamId}`),
                    axios.get("http://localhost:5000/api/v2/utilities/buyers"),
                    axios.get("http://localhost:5000/api/v2/users"),
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
            await axios.put(`http://localhost:5000/api/v2/teams/${teamId}`, updatedData);
            const { data } = await axios.get(`http://localhost:5000/api/v2/teams/${teamId}`);
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
