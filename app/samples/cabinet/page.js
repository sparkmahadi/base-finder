"use client";
import React, { useState } from 'react';

const Cabinet = () => {
    const [boxes] = useState([
        {
            box_name: "Box 1",
            shelfs: [
                {
                    divisions: [
                        { label: "S1 D1", value: 0, note: "OVS" },
                        { label: "S1 D2", value: 0, note: "Celio" },
                        { label: "S1 D3", value: 0, note: "Monica" }
                    ]
                },
                {
                    divisions: [
                        { label: "S2 D1", value: 0, note: "Carters" },
                        { label: "S2 D2", value: 0, note: "BRI" },
                        { label: "S2 D3", value: 0, note: "BRI+Packets" }
                    ]
                },
                {
                    divisions: [
                        { label: "S3 D1", value: 33, note: "Bodysuit" },
                        { label: "S3 D2", value: 36, note: "Bodysuit" },
                        { label: "S3 D3", value: 35, note: "Bodysuit" }
                    ]
                }
            ]
        },
        {
            box_name: "Box 2",
            shelfs: [
                {
                    divisions: [
                        { label: "S4 D1", value: 3, note: "Bodysuit (Produced)" },
                        { label: "S4 D2", value: 0, note: "Bodysuit (Produced)" },
                        { label: "S4 D3", value: 0, note: "Bodysuit (Produced)" }
                    ]
                },
                {
                    divisions: [
                        { label: "S5 D1", value: 20, note: "Top-Bottom+ Produced" },
                        { label: "S5 D2", value: 30, note: "Top-Bottom" },
                        { label: "S5 D3", value: 22, note: "Top-Bottom" }
                    ]
                },
                {
                    divisions: [
                        { label: "S6 D1", value: 0, note: "Packets (BRI)" },
                        { label: "S6 D2", value: 0, note: "Packets (LPP+Carters)" },
                        { label: "S6 D3", value: 0, note: "Merchant BRI" }
                    ]
                }
            ]
        },
        {
            box_name: "Box 3",
            shelfs: [
                {
                    divisions: [
                        { label: "S7 D1", value: 0, note: "OVS N" },
                        { label: "S7 D2", value: 0, note: "Bodysuit N" },
                        { label: "S7 D3", value: 0, note: "" }
                    ]
                },
                {
                    divisions: [
                        { label: "S8 D1", value: 0, note: "" },
                        { label: "S8 D2", value: 0, note: "" },
                        { label: "S8 D3", value: 0, note: "" }
                    ]
                },
                {
                    divisions: [
                        { label: "S9 D1", value: 27, note: "Leggings" },
                        { label: "S9 D2", value: 26, note: "Leggings" },
                        { label: "S9 D3", value: 30, note: "Top" }
                    ]
                }
            ]
        },
        {
            box_name: "Box 4",
            shelfs: [
                {
                    divisions: [
                        { label: "S10 D1", value: 18, note: "Sleepsuit" },
                        { label: "S10 D2", value: 20, note: "Sleepsuit" },
                        { label: "S10 D3", value: 22, note: "Sleepsuit" }
                    ]
                },
                {
                    divisions: [
                        { label: "S11 D1", value: 21, note: "Jumpsuit" },
                        { label: "S11 D2", value: 17, note: "Jumpsuit" },
                        { label: "S11 D3", value: 21, note: "Jumpsuit (Produced)" }
                    ]
                },
                {
                    divisions: [
                        { label: "S12 D1", value: 0, note: "Ladies" },
                        { label: "S12 D2", value: 0, note: "Ladies" },
                        { label: "S12 D3", value: 0, note: "Ladies" }
                    ]
                }
            ]
        }
    ]);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center">
            <h3 className="text-3xl font-bold mt-8 mb-6">Cabinet</h3>

            <div
                className="relative w-full max-w-6xl p-6 rounded-lg">
                <div className="grid grid-flow-col grid-rows-2 gap-6">
                    {boxes.map((box, index) => (
                        <div
                            key={index}
                            className="bg-white bg-opacity-90 border rounded-lg shadow-md p-4 backdrop-blur-md"
                        >
                            <h2 className="text-center text-xl font-semibold mb-5">
                                {box.box_name}
                            </h2>
                            <div className="grid grid-cols-1 gap-y-16 justify-center items-center">
                                {box.shelfs.map((shelf, sIndex) => (
                                    <div
                                        key={sIndex}
                                        className="grid grid-cols-3 gap-6 justify-center items-center"
                                    >
                                        {shelf.divisions.map((division, i) => (
                                            <div key={i} className="text-center">
                                                <p className="font-semibold pb-1">{division.label}</p>
                                                <p className="pb-1">{division.value}</p>
                                                <p>{division.note || "-"}</p>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Cabinet;
