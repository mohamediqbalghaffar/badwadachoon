"use client";

import React, { useEffect, useState } from "react";

export const HTSLogoBackground = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate normalized mouse position (-1 to 1)
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Parallax translation factors
  const tx1 = mousePosition.x * 20;
  const ty1 = mousePosition.y * 20;
  const tx2 = mousePosition.x * -15;
  const ty2 = mousePosition.y * -15;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-[0.08] dark:opacity-[0.15]">
      {/* Background radial gradient to give a subtle glow around the logo */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(227,30,36,0.1)_0%,transparent_50%)] dark:bg-[radial-gradient(circle_at_center,rgba(227,30,36,0.2)_0%,transparent_60%)]"></div>
      
      <svg
        viewBox="0 0 800 400"
        className="w-[120vw] h-auto max-w-[1200px] animate-logo-float"
        style={{
          transform: `translate(${tx1}px, ${ty1}px)`,
          transition: "transform 0.2s ease-out",
        }}
      >
        <defs>
          <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff4b4b" />
            <stop offset="100%" stopColor="#cc0000" />
          </linearGradient>
          
          <linearGradient id="grayGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#888888" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#dddddd" stopOpacity="0.3" />
          </linearGradient>

          <linearGradient id="grayGradient2" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#666666" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#bbbbbb" stopOpacity="0.2" />
          </linearGradient>

          <linearGradient id="grayGradient3" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#aaaaaa" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#eeeeee" stopOpacity="0.4" />
          </linearGradient>

          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="15" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <g transform={`translate(${tx2}, ${ty2})`} style={{ transition: "transform 0.4s ease-out" }}>
          {/* Orbital Swooshes */}
          <g className="origin-center animate-logo-orbit" style={{ animationDuration: '40s' }}>
            <ellipse 
              cx="400" cy="200" rx="300" ry="120" 
              fill="none" stroke="url(#grayGradient1)" strokeWidth="6" 
              transform="rotate(-20 400 200)"
              className="animate-logo-draw"
              strokeDasharray="1800"
              strokeDashoffset="0"
              style={{ animationDuration: '8s', animationDirection: 'alternate' }}
            />
          </g>

          <g className="origin-center animate-logo-orbit" style={{ animationDuration: '50s', animationDirection: 'reverse' }}>
            <ellipse 
              cx="400" cy="200" rx="320" ry="100" 
              fill="none" stroke="url(#grayGradient2)" strokeWidth="4" 
              transform="rotate(-5 400 200)"
              className="animate-logo-draw"
              strokeDasharray="1800"
              strokeDashoffset="0"
              style={{ animationDuration: '10s', animationDelay: '2s', animationDirection: 'alternate' }}
            />
          </g>

          <g className="origin-center animate-logo-orbit" style={{ animationDuration: '45s' }}>
            <ellipse 
              cx="400" cy="200" rx="280" ry="140" 
              fill="none" stroke="url(#grayGradient3)" strokeWidth="8" 
              transform="rotate(10 400 200)"
              className="animate-logo-draw"
              strokeDasharray="1800"
              strokeDashoffset="0"
              style={{ animationDuration: '9s', animationDelay: '1s', animationDirection: 'alternate' }}
            />
          </g>

          {/* HTS Text Base Glow */}
          <text 
            x="400" y="240" 
            textAnchor="middle" 
            fontFamily="Impact, sans-serif" 
            fontSize="180" 
            fontWeight="bold" 
            fill="url(#redGradient)" 
            filter="url(#glow)"
            className="animate-logo-pulse opacity-50"
            letterSpacing="5"
          >
            HTS
          </text>

          {/* HTS Text Main */}
          <text 
            x="400" y="240" 
            textAnchor="middle" 
            fontFamily="Impact, sans-serif" 
            fontSize="180" 
            fontWeight="bold" 
            fill="url(#redGradient)" 
            letterSpacing="5"
          >
            HTS
          </text>
        </g>
      </svg>
    </div>
  );
};
