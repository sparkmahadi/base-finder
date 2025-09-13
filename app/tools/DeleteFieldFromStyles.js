"use client";
import axios from "axios";
import React, { useState } from "react";
import { getAuthHeaders } from "../utils/getAuthHeaders";

const DeleteFieldFromStyles = () => {
    const [field, setField] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    // List of deletable top-level fields
    const fields = [
        "factory_name",
        "factory_code",
        "buyer",
        "season",
        "style",
        "descr",
        "fabric",
        "status",
        "item",
        "similar",
        "prints",
        "version",
    ];

    const handleDelete = async (e) => {
        e.preventDefault();
        if (!field) {
            setMessage("⚠️ Please select a field.");
            return;
        }

        try {
            setLoading(true);
            setMessage("");

            // const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/styles/delete-field`, {
            //     method: "DELETE",
            //     headers: { "Content-Type": "application/json" },
            //     body: JSON.stringify({ field }),
            // });

            const res = await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/styles/delete-field`, {headers: getAuthHeaders(),  data: { field }},)

            const data = res.data;

            if (res.ok) {
                setMessage(`✅ ${data.message}`);
                setField(""); // reset selection
            } else {
                setMessage(`❌ ${data.message}`);
            }
        } catch (err) {
            console.error(err);
            setMessage("❌ Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-md mt-10">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Delete Field from All Styles
            </h2>

            <form onSubmit={handleDelete} className="space-y-4">
                <div>
                    <label
                        htmlFor="field"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Select Field
                    </label>
                    <select
                        id="field"
                        value={field}
                        onChange={(e) => setField(e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-gray-300 p-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                        <option value="">-- Select a field --</option>
                        {fields.map((f) => (
                            <option key={f} value={f}>
                                {f}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg shadow-md disabled:opacity-50"
                >
                    {loading ? "Deleting..." : "Delete Field"}
                </button>
            </form>

            {message && <p className="mt-4 text-center text-sm">{message}</p>}
        </div>
    );
};

export default DeleteFieldFromStyles;
