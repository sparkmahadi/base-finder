"use client"

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/app/context/AuthContext";

const Users = () => {
  const {isAuthenticated, userInfo} = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
console.log(userInfo);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users`);
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <div>Loading users...</div>;
  }

  return (
    <div>
      <h1>User List</h1>
      <ul>
        {users?.map((user) => (
          <li key={user._id}>
            <strong>{user.name}</strong> ({user.username}) - {user.email} - Role: {user.role}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Users;
