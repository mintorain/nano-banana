import React from 'react';

const DiceIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <path d="M16 8h.01"></path>
    <path d="M12 12h.01"></path>
    <path d="M8 16h.01"></path>
    <path d="M8 8h.01"></path>
    <path d="M16 16h.01"></path>
  </svg>
);

export default DiceIcon;