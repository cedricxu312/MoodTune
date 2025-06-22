import React from 'react';
import './WaveSection.css';

export default function WaveSection({ children }) {
  return (
    <div className="wave-section">
      <div className="content">
        {children}
      </div>
      <div className="wave-wrap">
        <svg className="wave" viewBox="0 0 1440 320">
          <path
            fill="#ffffff"
            fillOpacity="1"
            d="M0,192L48,170.7C96,149,192,107,288,117.3C384,128,480,192,576,197.3C672,203,768,149,864,133.3C960,117,1056,139,1152,160C1248,181,1344,203,1392,213.3L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>
    </div>
  );
}


