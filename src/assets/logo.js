import React from 'react';

const Logo = ({ width = 50, height = 50 }) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 800 800" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Globe with grid and circuit elements */}
      <path d="M400 700C565.685 700 700 565.685 700 400C700 234.315 565.685 100 400 100C234.315 100 100 234.315 100 400C100 565.685 234.315 700 400 700Z" fill="white" stroke="#00394D" strokeWidth="30"/>
      
      {/* Dark blue outer ring */}
      <path d="M400 700C565.685 700 700 565.685 700 400C700 234.315 565.685 100 400 100C234.315 100 100 234.315 100 400C100 565.685 234.315 700 400 700Z" fill="none" stroke="#00394D" strokeWidth="80"/>
      
      {/* Grid lines */}
      <path d="M200 200L600 600" stroke="#00394D" strokeWidth="20"/>
      <path d="M300 150L500 650" stroke="#00394D" strokeWidth="20"/>
      <path d="M150 300L650 500" stroke="#00394D" strokeWidth="20"/>
      <path d="M600 200L200 600" stroke="#00394D" strokeWidth="20"/>
      
      {/* Colored squares in grid */}
      <rect x="250" y="250" width="60" height="60" fill="#B45A40"/>
      <rect x="350" y="350" width="60" height="60" fill="#B45A40"/>
      <rect x="450" y="250" width="60" height="60" fill="#00394D"/>
      <rect x="250" y="450" width="60" height="60" fill="#00394D"/>
      <rect x="450" y="450" width="60" height="60" fill="#B45A40"/>
      <rect x="350" y="180" width="60" height="60" fill="#00394D"/>
      
      {/* Circuit elements */}
      <path d="M500 300C520 300 520 350 550 350C580 350 580 400 600 400" stroke="#B45A40" strokeWidth="15"/>
      <path d="M550 450C570 450 570 500 600 500" stroke="#B45A40" strokeWidth="15"/>
      <circle cx="550" cy="350" r="15" fill="white" stroke="#B45A40" strokeWidth="5"/>
      <circle cx="600" cy="400" r="15" fill="#00394D"/>
      <circle cx="600" cy="500" r="15" fill="white" stroke="#B45A40" strokeWidth="5"/>
      
      {/* Orange swoosh */}
      <path d="M750 400C800 450 800 550 750 600L700 500L750 400Z" fill="#EB9C17"/>
      <path d="M800 450C850 500 850 600 800 650L750 550L800 450Z" fill="#EB9C17"/>
      
      {/* Gear icons */}
      <circle cx="770" cy="680" r="20" fill="#00394D"/>
      <circle cx="770" cy="680" r="10" fill="white"/>
      <path d="M770 650L780 660L790 650L780 640L770 650Z" fill="#00394D"/>
      <path d="M770 710L780 700L790 710L780 720L770 710Z" fill="#00394D"/>
      <path d="M740 680L750 670L750 690L740 680Z" fill="#00394D"/>
      <path d="M800 680L790 670L790 690L800 680Z" fill="#00394D"/>
      
      <circle cx="730" cy="650" r="15" fill="#B45A40"/>
      <circle cx="730" cy="650" r="7" fill="white"/>
      
      <circle cx="810" cy="650" r="12" fill="#A4B8FF"/>
      <circle cx="810" cy="650" r="6" fill="white"/>
    </svg>
  );
};

export default Logo; 