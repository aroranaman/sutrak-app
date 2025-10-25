import React from 'react';

export const HornbillIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12,6.5C12,6.5,15,2,22,6" />
    <path d="M13,9.5A3.5,3.5,0,0,1,6,13H3a1,1,0,0,1-1-1V9a1,1,0,0,1,1-1H8" />
    <path d="M7,13c0,2.5,2,4,5,4s5-1.5,5-4" />
    <circle cx="10" cy="11.5" r="1" />
  </svg>
);
