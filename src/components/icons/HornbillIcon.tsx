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
    <path d="M12.5,9.5A5.5,5.5,0,0,1,7,15H2.5A.5.5,0,0,1,2,14.5V11A.5.5,0,0,1,2.5,10.5H7" />
    <path d="M12.5,9.5S14,4,18,4s4,3,4,5.5a4.5,4.5,0,0,1-9,0Z" />
    <path d="M15,9.5a.5.5,0,0,1,.5-.5h2a.5.5,0,0,1,.5.5v2a.5.5,0,0,1-.5.5h-2a.5.5,0,0,1-.5-.5Z" />
    <path d="M12,14m-1,0a1,1,0,1,0,2,0a1,1,0,1,0-2,0" />
  </svg>
);
