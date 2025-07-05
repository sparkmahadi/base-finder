import React from 'react';

const Cabinet = () => {
    const data1 = [
        { shelf: 1, division: 1 },
        { shelf: 1, division: 2 },
        { shelf: 1, division: 3 },

        { shelf: 2, division: 1 },
        { shelf: 2, division: 2 },
        { shelf: 2, division: 3 },

        { shelf: 3, division: 1 },
        { shelf: 3, division: 2 },
        { shelf: 3, division: 3 },
    ]


    const boxes = [
        {
            box_name: "Box 1",
            sections: [
                {
                    row_labels: ["S1 D1", "S1 D2", "S1 D3"],
                    values: ["0", "0", "0"]
                },
                {
                    row_labels: ["OVS", "Celio", "Monica"],
                    values: []
                },
                {
                    row_labels: ["S2 D2", "S2 D2", "S2 D2"],
                    values: ["0", "0", "0"]
                },
                {
                    row_labels: ["Carters", "BRI", "BRI+Packets"],
                    values: []
                },
                {
                    row_labels: ["S3 D1", "S3 D2", "S3 D3"],
                    values: ["33", "36", "35"],
                    description: "Bodysuit"
                }
            ]
        },
        {
            box_name: "Box 2",
            sections: [
                {
                    row_labels: ["S4 D1", "S4 D2", "S4 D3"],
                    values: ["3", "0", "0"],
                    description: "Bodysuit (Produced)"
                },
                {
                    row_labels: ["S5 D1", "S5 D2", "S5 D3"],
                    values: ["20", "30", "22"],
                    description: "Top-Bottom"
                },
                {
                    row_labels: ["S6 D1", "S6 D2", "S6 D3"],
                    values: ["0", "0", "0"],
                    description: "Packets (BRI, LPP+Carters, Merchant BRI)"
                }
            ]
        },
        {
            box_name: "Box 3",
            sections: [
                {
                    row_labels: ["S7 D1", "S7 D2", "S7 D3"],
                    values: ["0", "0", "0"]
                },
                {
                    row_labels: ["S8 D1", "S8 D2", "S8 D3"],
                    values: ["0", "0", "0"]
                },
                {
                    row_labels: ["OVS N", "Bodysuit N", "0"],
                    values: []
                },
                {
                    row_labels: ["S9 D1", "S9 D2", "S9 D3"],
                    values: ["27", "26", "30"],
                    description: "Leggings / Top"
                }
            ]
        },
        {
            box_name: "Box 4",
            sections: [
                {
                    row_labels: ["S10 D1", "S10 D2", "S10 D3"],
                    values: ["18", "20", "22"],
                    description: "Sleepsuit"
                },
                {
                    row_labels: ["S11 D1", "S11 D2", "S11 D3"],
                    values: ["21", "17", "21"],
                    description: "Jumpsuit"
                },
                {
                    row_labels: ["S12 D1", "S12 D2", "S12 D3"],
                    values: ["0", "0", "0"],
                    description: "Ladies"
                }
            ]
        }
    ];

    return (
        <div>
            <h3>Cabinet</h3>

            {/* <div className='grid grid-cols-3 max-w-96 gap-y-5 mb-3 border-2'>
                {
                data1.map((loc, i) =>
                    <div key={i} className='border-2 text-center'>
                        S{loc.shelf} D{loc.division}
                    </div>
                )
            }
            </div> */}


            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                {boxes.map((box, index) => (
                    <div key={index} className="border rounded-lg shadow bg-white p-2">
                        <h2 className="text-center font-semibold mb-2">{box.box_name}</h2>
                        <div className="grid grid-cols-3 gap-2 text-center text-sm">
                            {box.sections.map((section, sIndex) => (
                                <div key={sIndex} className="contents">
                                    {section.row_labels.map((label, i) => (
                                        <div key={`label-${sIndex}-${i}`} className='font-semibold'>{label}</div>
                                    ))}
                                    {section.values.map((value, i) => (
                                        <div key={`value-${sIndex}-${i}`}>{value}</div>
                                    ))}
                                    {section.description &&
                                        section.row_labels.map((_, i) => (
                                            <div key={`desc-${sIndex}-${i}`}>
                                                {i === 0 ? section.description : ""}
                                            </div>
                                        ))}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Cabinet;