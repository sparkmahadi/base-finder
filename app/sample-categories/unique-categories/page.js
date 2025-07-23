"use client"

import Loader from "@/app/components/Loader";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function CategoryUploader() {
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const [pairs, setPairs] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);

    useEffect(() => {
        fetchUniqueCategories();
    }, []);

    const fetchUniqueCategories = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/utilities/unique-category-buyers`);
            console.log(res);
            setPairs(res?.data?.categories);
            setLoading(false);
        } catch (err) {
            setLoading(false);
            toast.error("Failed to fetch samples");
        }
    };

    const toggleSelection = (pair) => {
        const exists = selectedRows.some(
            (item) =>
                item.cat_name === pair.cat_name && item.buyer_name === pair.buyer_name
        );
        if (exists) {
            setSelectedRows((prev) =>
                prev.filter(
                    (item) =>
                        item.cat_name !== pair.cat_name || item.buyer_name !== pair.buyer_name
                )
            );
        } else {
            setSelectedRows((prev) => [...prev, pair]);
        }
    };

    const handleSubmit = async () => {
        if (selectedRows.length === 0) {
            toast.info("Please select at least one row to upload.");
            return;
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/utilities/categories/bulk`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ categories: selectedRows }),
        });

        const result = await res.json();
        if (result.redirect) {
            router.push("/categories");
        } else if (result.success) {
            toast.info("Uploaded selected categories!");
        } else {
            toast.info("Upload failed: " + result.message);
        }
    };

    if(loading){
        return <Loader/>
    }

    return (
        <div className="p-4">
            <h2 className="text-lg font-bold mb-4">Select Categories to Upload</h2>
            <ul className="space-y-2">
                {pairs.map((pair, idx) => {
                    const isSelected = selectedRows.some(
                        (item) =>
                            item.cat_name === pair.cat_name &&
                            item.buyer_name === pair.buyer_name
                    );
                    return (
                        <li
                            key={idx}
                            className="flex items-center gap-4 border p-2 rounded hover:bg-gray-50"
                        >
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelection(pair)}
                            />
                            <span>
                                {pair.cat_name} - {pair.buyer_name} (
                                <span className="text-gray-500">
                                    Total Samples: {pair.totalSamples}
                                </span>
                                )
                            </span>
                        </li>
                    );
                })}
            </ul>
            <button
                onClick={handleSubmit}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                Upload Selected Categories
            </button>
        </div>
    );
}
