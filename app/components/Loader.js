import React from 'react';
import "./Loader.css";

const Loader = () => {
  return (
      <div className='min-h-screen flex justify-center items-center'>
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
      </div>
  );
}


export default Loader;
