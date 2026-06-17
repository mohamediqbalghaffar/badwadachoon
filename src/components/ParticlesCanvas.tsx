"use client";

import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
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
    const colors = isDarkMode 
      ? ["rgba(227, 30, 36, 0.8)", "rgba(59, 130, 246, 0.8)", "rgba(255, 255, 255, 0.6)"]
      : ["rgba(227, 30, 36, 0.7)", "rgba(59, 130, 246, 0.7)", "rgba(0, 0, 0, 0.4)"];

    const initParticles = () => {
      particles = [];
      const particleCount = Math.min(Math.floor((width * height) / 15000), 100);
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 3 + 3.5,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };
    initParticles();

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

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

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
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
