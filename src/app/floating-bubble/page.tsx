'use client';

import * as React from 'react';

// ─── Types ─────────────────────────────────────────────────────────────────
declare global {
    interface Window {
        electronAPI?: {
            moveBubble: (x: number, y: number) => void;
            resizeBubble: (w: number, h: number) => void;
            openMainWindow: (tab?: string) => void;
            hideBubble: () => void;
            getScreenBounds: () => Promise<{ width: number; height: number }>;
        };
    }
}

// ─── Sizes (must match main.js) ────────────────────────────────────────────
const COLLAPSED_W = 80;
const COLLAPSED_H = 80;
const EXPANDED_W = 240;
const EXPANDED_H = 300;

export default function FloatingBubblePage() {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const [isDragging, setIsDragging] = React.useState(false);

    // Drag tracking
    const dragStartMouse = React.useRef({ x: 0, y: 0 });
    const dragStartWin = React.useRef({ x: 0, y: 0 });
    const hasDragged = React.useRef(false);

    // ── Drag Handling ──────────────────────────────────────────────────────
    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return;
        e.preventDefault();
        hasDragged.current = false;
        setIsDragging(true);

        dragStartMouse.current = { x: e.screenX, y: e.screenY };
        // We track window pos from the click position in screen coords
        dragStartWin.current = {
            x: e.screenX - e.clientX,
            y: e.screenY - e.clientY,
        };
    };

    React.useEffect(() => {
        if (!isDragging) return;

        const onMouseMove = (e: MouseEvent) => {
            const dx = Math.abs(e.screenX - dragStartMouse.current.x);
            const dy = Math.abs(e.screenY - dragStartMouse.current.y);
            if (dx > 3 || dy > 3) hasDragged.current = true;

            const newX = dragStartWin.current.x + e.clientX;
            const newY = dragStartWin.current.y + e.clientY;
            window.electronAPI?.moveBubble(newX, newY);
        };

        const onMouseUp = () => {
            setIsDragging(false);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [isDragging]);

    // ── Toggle expand / collapse ───────────────────────────────────────────
    const handleClick = () => {
        if (hasDragged.current) return; // don't toggle if it was a drag

        const next = !isExpanded;
        setIsExpanded(next);

        if (next) {
            window.electronAPI?.resizeBubble(EXPANDED_W, EXPANDED_H);
        } else {
            window.electronAPI?.resizeBubble(COLLAPSED_W, COLLAPSED_H);
        }
    };

    const openApp = (tab?: string) => {
        window.electronAPI?.openMainWindow(tab);
    };

    const closeBubble = (e: React.MouseEvent) => {
        e.stopPropagation();
        window.electronAPI?.hideBubble();
    };

    // ── Collapsed View ─────────────────────────────────────────────────────
    if (!isExpanded) {
        return (
            <div
                style={{
                    width: '100vw',
                    height: '100vh',
                    background: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: isDragging ? 'grabbing' : 'grab',
                    userSelect: 'none',
                }}
                onMouseDown={handleMouseDown}
                onClick={handleClick}
            >
                {/* Outer glow ring */}
                <div style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                    padding: 2,
                    boxShadow: '0 4px 24px rgba(124,58,237,0.6), 0 0 0 3px rgba(124,58,237,0.2)',
                    animation: 'pulse-ring 2.5s cubic-bezier(0.66,0,0,1) infinite',
                }}>
                    {/* Inner circle */}
                    <div style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #1e1345, #0a1128)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                    }}>
                        <img
                            src="/logo.png"
                            alt="HTS"
                            style={{ width: 44, height: 44, objectFit: 'contain' }}
                            draggable={false}
                        />
                    </div>
                </div>

                <style>{`
                    @keyframes pulse-ring {
                        0%   { box-shadow: 0 4px 24px rgba(124,58,237,0.6), 0 0 0 0 rgba(124,58,237,0.4); }
                        70%  { box-shadow: 0 4px 24px rgba(124,58,237,0.6), 0 0 0 12px rgba(124,58,237,0); }
                        100% { box-shadow: 0 4px 24px rgba(124,58,237,0.6), 0 0 0 0 rgba(124,58,237,0); }
                    }
                `}</style>
            </div>
        );
    }

    // ── Expanded View ──────────────────────────────────────────────────────
    return (
        <div
            style={{
                width: '100vw',
                height: '100vh',
                background: 'transparent',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'flex-end',
                userSelect: 'none',
            }}
        >
            <div style={{
                width: EXPANDED_W - 16,
                background: 'linear-gradient(145deg, rgba(20,15,50,0.97), rgba(10,17,40,0.98))',
                backdropFilter: 'blur(20px)',
                borderRadius: 20,
                border: '1px solid rgba(124,58,237,0.35)',
                boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
                overflow: 'hidden',
                margin: 8,
            }}>
                {/* Header — drag handle */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '12px 14px 10px',
                        background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(6,182,212,0.15))',
                        borderBottom: '1px solid rgba(255,255,255,0.07)',
                        cursor: isDragging ? 'grabbing' : 'grab',
                    }}
                    onMouseDown={handleMouseDown}
                >
                    <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 2px 10px rgba(124,58,237,0.5)',
                    }}>
                        <img src="/logo.png" alt="HTS" style={{ width: 22, height: 22, objectFit: 'contain' }} draggable={false} />
                    </div>

                    <div style={{ flex: 1 }}>
                        <p style={{ color: '#fff', fontSize: 11, fontWeight: 700, margin: 0, letterSpacing: '0.03em' }}>
                            Tasks (by HTS)
                        </p>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9, margin: 0 }}>
                            Quick access
                        </p>
                    </div>

                    {/* Collapse button */}
                    <button
                        onClick={handleClick}
                        style={{
                            width: 22, height: 22, borderRadius: '50%',
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1,
                            flexShrink: 0,
                            transition: 'background 0.2s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                        title="Collapse"
                    >
                        ─
                    </button>

                    {/* Close button */}
                    <button
                        onClick={closeBubble}
                        style={{
                            width: 22, height: 22, borderRadius: '50%',
                            background: 'rgba(239,68,68,0.2)',
                            border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#f87171', fontSize: 14, lineHeight: 1,
                            flexShrink: 0,
                            transition: 'background 0.2s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.4)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.2)')}
                        title="Hide"
                    >
                        ×
                    </button>
                </div>

                {/* Action Buttons */}
                <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>

                    {/* Open App */}
                    <ActionButton
                        icon="🏠"
                        label="Open App"
                        sublabel="Go to main window"
                        color="#7c3aed"
                        onClick={() => openApp()}
                    />

                    {/* Tasks */}
                    <ActionButton
                        icon="✅"
                        label="Tasks"
                        sublabel="View all tasks"
                        color="#06b6d4"
                        onClick={() => openApp('tasks')}
                    />

                    {/* Letters */}
                    <ActionButton
                        icon="📄"
                        label="Letters"
                        sublabel="View approval letters"
                        color="#8b5cf6"
                        onClick={() => openApp('letters')}
                    />

                    {/* Archives */}
                    <ActionButton
                        icon="🗂️"
                        label="Archives"
                        sublabel="Browse archived items"
                        color="#10b981"
                        onClick={() => openApp('archives')}
                    />
                </div>
            </div>
        </div>
    );
}

// ─── Reusable action button ────────────────────────────────────────────────
function ActionButton({
    icon, label, sublabel, color, onClick,
}: {
    icon: string;
    label: string;
    sublabel: string;
    color: string;
    onClick: () => void;
}) {
    const [hovered, setHovered] = React.useState(false);

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '8px 10px',
                background: hovered ? `${color}22` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${hovered ? color + '55' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 12,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.18s ease',
                transform: hovered ? 'translateX(-2px)' : 'none',
            }}
        >
            <span style={{ fontSize: 18, flexShrink: 0, width: 28, textAlign: 'center' }}>{icon}</span>
            <div style={{ flex: 1, overflow: 'hidden' }}>
                <p style={{ color: '#fff', fontSize: 11, fontWeight: 600, margin: 0, letterSpacing: '0.02em' }}>
                    {label}
                </p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9, margin: 0, marginTop: 1 }}>
                    {sublabel}
                </p>
            </div>
            <span style={{ color: `${color}cc`, fontSize: 12, flexShrink: 0 }}>›</span>
        </button>
    );
}
