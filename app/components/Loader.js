import React from 'react';
import "./Loader.css";

const Loader = ({ message }) => {
  return (
    <div className='min-h-screen flex flex-col justify-center items-center'>
      <div className="hourglassBackground">
        <div className="hourglassContainer">
          <div className="hourglassCurves" />
          <div className="hourglassCapTop" />
          <div className="hourglassGlassTop" />
          <div className="hourglassSand" />
          <div className="hourglassSandStream" />
          <div className="hourglassCapBottom" />
          <div className="hourglassGlass" />
        </div>
      </div>
      {message && (
        <p className="loader-message mt-4 text-gray-500 text-lg font-semibold">
          {message}
        </p>
      )}
    </div>
  );
}

export default Loader;