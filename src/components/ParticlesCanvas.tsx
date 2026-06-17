"use client";

import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radiusCurrent: number;
  radiusPrevious: number;
  colorIndex: number;
}

export const ParticlesCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    let mousePosition = { x: -1000, y: -1000 };

    const updateSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    
    window.addEventListener('resize', updateSize);
    updateSize();

    const handleMouseMove = (e: MouseEvent) => {
      mousePosition.x = e.clientX;
      mousePosition.y = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    const isDarkMode = document.documentElement.classList.contains("dark") || 
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Brand colors matching the HTS logo theme and general dashboard feel
    const currentColors = isDarkMode 
      ? ["rgba(227, 30, 36, 0.8)", "rgba(59, 130, 246, 0.8)", "rgba(255, 255, 255, 0.6)"]
      : ["rgba(227, 30, 36, 0.7)", "rgba(59, 130, 246, 0.7)", "rgba(0, 0, 0, 0.4)"];

    const previousColors = isDarkMode
      ? ["rgba(227, 30, 36, 0.4)", "rgba(59, 130, 246, 0.4)", "rgba(255, 255, 255, 0.2)"]
      : ["rgba(227, 30, 36, 0.2)", "rgba(59, 130, 246, 0.2)", "rgba(0, 0, 0, 0.1)"];

    let cardRects: DOMRect[] = [];
    let frameCount = 0;

    const updateCardRects = () => {
      const cardElements = document.querySelectorAll('.glass');
      cardRects = Array.from(cardElements).map(el => el.getBoundingClientRect());
    };

    const initParticles = () => {
      particles = [];
      const particleCount = Math.min(Math.floor((width * height) / 15000), 100);
      for (let i = 0; i < particleCount; i++) {
        const radiusCurrent = Math.random() * 3 + 3.5;
        const radiusPrevious = (radiusCurrent - 3.5) / 3 * 2 + 1; // Map 3.5 - 6.5 to 1 - 3
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radiusCurrent,
          radiusPrevious,
          colorIndex: Math.floor(Math.random() * currentColors.length),
        });
      }
    };
    initParticles();

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      frameCount++;
      if (frameCount % 15 === 0 || cardRects.length === 0) {
        updateCardRects();
      }

      const connectionDistance = 120;
      const mouseRepelDistance = 100;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off edges
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Mouse interaction (repel)
        const dxMouse = mousePosition.x - p.x;
        const dyMouse = mousePosition.y - p.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

        if (distMouse < mouseRepelDistance) {
          const angle = Math.atan2(dyMouse, dxMouse);
          const force = (mouseRepelDistance - distMouse) / mouseRepelDistance;
          p.x -= Math.cos(angle) * force * 2;
          p.y -= Math.sin(angle) * force * 2;
        }

        // Check if particle is behind any card
        let isInsideCard = false;
        for (let r = 0; r < cardRects.length; r++) {
          const rect = cardRects[r];
          if (p.x >= rect.left && p.x <= rect.right && p.y >= rect.top && p.y <= rect.bottom) {
            isInsideCard = true;
            break;
          }
        }

        const radius = isInsideCard ? p.radiusPrevious : p.radiusCurrent;
        const color = isInsideCard ? previousColors[p.colorIndex] : currentColors[p.colorIndex];

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        // Connect particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            
            const opacity = 1 - (dist / connectionDistance);
            const isDark = isDarkMode ? 255 : 0;
            ctx.strokeStyle = `rgba(${isDark}, ${isDark}, ${isDark}, ${opacity * 0.15})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };
    
    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 z-0 pointer-events-none"
    />
  );
};
