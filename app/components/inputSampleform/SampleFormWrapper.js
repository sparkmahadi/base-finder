"use client";

import React, { useState } from "react";
import InputSampleForm from "./InputSampleForm"; // multi-step form
import SinglePageSampleForm from "./SinglePageSampleForm";

const SampleFormWrapper = () => {
  const [mobileView, setMobileView] = useState(false);

  return (
    <div className="p-4">
      <div className="flex justify-center mb-4">
        <button
          onClick={() => setMobileView(!mobileView)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Switch to {mobileView ? "Multi-Step" : "Single Page"} View
        </button>
      </div>

      {mobileView ? <SinglePageSampleForm /> : <InputSampleForm />}
    </div>
  );
};

export default SampleFormWrapper;
