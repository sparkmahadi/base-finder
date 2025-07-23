"use client"

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from "next/navigation";
import { toast } from 'react-toastify';
import axios from 'axios';

const Tools = () => {
    const { userInfo } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const handleConvertToNumbers = async () => {
        setLoading(true);
        try {
            const res = await axios.patch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/utilities/convert-shelfs-divisions-positions-to-numbers`, userInfo);
            console.log(res);
            const data = res?.data;
            if (data?.success) {
                toast.success(data?.message);
            } else {
                toast.error(data?.message);
                toast.error("Data cannot be modified or no data available!!!")
            }
        } catch (err) {
            toast.error("Failed to fetch sample details.");
        } finally {
            setLoading(false);
        }
    }


    const handleAddSampleIdsToExistingDocuments = async () => {
        setLoading(true);
        try {
            const res = await axios.patch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/samples/add-unique-ids-to-existing-samples`, userInfo);
            console.log(res);
            const data = res?.data;
            if (data?.success) {
                toast.success(data?.message);
            } else {
                toast.error(data?.message);
                toast.error("Data cannot be modified or no data available!!!")
            }
        } catch (err) {
            toast.error("Failed to fetch sample details.");
        } finally {
            setLoading(false);
        }
    }

    const handleResetAndReassignIDs = async () => {
        setLoading(true);
        try {
            const res = await axios.patch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/samples/reset-and-reassign-unique-ids-to-existing-samples`, userInfo);
            console.log(res);
            const data = res?.data;
            if (data?.success) {
                toast.success(data?.message);
            } else {
                toast.error(data?.message);
                toast.error("Data cannot be modified or no data available!!!")
            }
        } catch (err) {
            toast.error("Failed to fetch sample details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>

            <div className="p-6">
                <h1 className="text-2xl font-semibold mb-6">Tools</h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {
                        userInfo?.role === "admin" &&
                        <>
                            <div
                                className="bg-white rounded-2xl shadow-md p-4 flex items-center justify-between hover:shadow-lg transition"
                            >
                                <div>
                                    <h2 className="text-gray-600 text-sm">Convert shelf, division, position fields to numbers from string</h2>
                                    <button onClick={handleConvertToNumbers} className='bg-sky-600 hover:bg-sky-700 text-white font-medium px-3 py-1.5 rounded-md text-sm transition-colors duration-200 shadow-sm hover:shadow-md cursor-pointer"'>Convert Fields</button>
                                </div>
                            </div>

                            <div
                                className="bg-white rounded-2xl shadow-md p-4 flex items-center justify-between hover:shadow-lg transition"
                            >
                                <div>
                                    <h2 className="text-gray-600 text-sm">Watch and resolve positional conflicts</h2>
                                    <button onClick={() => router.push("/tools/position-conflict-checker")} className='bg-sky-600 hover:bg-sky-700 text-white font-medium px-3 py-1.5 rounded-md text-sm transition-colors duration-200 shadow-sm hover:shadow-md cursor-pointer"'>Look Up</button>
                                </div>
                            </div>

                            <div
                                className="bg-white rounded-2xl shadow-md p-4 flex items-center justify-between hover:shadow-lg transition"
                            >
                                <div>
                                    <h2 className="text-gray-600 text-sm">Add a unique sample_id to all samples in db</h2>
                                    <button onClick={handleAddSampleIdsToExistingDocuments} className='bg-sky-600 hover:bg-sky-700 text-white font-medium px-3 py-1.5 rounded-md text-sm transition-colors duration-200 shadow-sm hover:shadow-md cursor-pointer"'>Add Unique Ids</button>
                                </div>
                            </div>


                            <div
                                className="bg-white rounded-2xl shadow-md p-4 flex items-center justify-between hover:shadow-lg transition"
                            >
                                <div>
                                    <h2 className="text-gray-600 text-sm">Add a unique sample_id to all samples in db</h2>
                                    <button onClick={handleResetAndReassignIDs} className='bg-sky-600 hover:bg-sky-700 text-white font-medium px-3 py-1.5 rounded-md text-sm transition-colors duration-200 shadow-sm hover:shadow-md cursor-pointer"'>Reset and Reassign Unique Ids</button>
                                </div>
                            </div>

                        </>
                    }

                </div>
            </div>

        </div>
    );
};

export default Tools;