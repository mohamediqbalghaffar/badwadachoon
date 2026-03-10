'use client';

import * as React from 'react';

// ─── Types ─────────────────────────────────────────────────────────────────
declare global {
    interface Window {
        electronAPI?: {
            moveBubble: (x: number, y: number) => void;
            resizeBubble: (w: number, h: number) => void;
            togglePanel: () => void;
            openMainWindow: (tab?: string) => void;
            hideBubble: () => void;
            getScreenBounds: () => Promise<{ width: number; height: number }>;
        };
        AndroidBubble?: {
            openApp: (tab?: string) => void;
            closeBubble: () => void;
            collapseBubble: () => void;
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
    const [showMenu, setShowMenu] = React.useState(false); // right-click shortcut menu

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

    // ── Click: open the compact panel (Messenger-style) ──────────────────────
    const handleClick = () => {
        if (hasDragged.current) return;

        if (window.AndroidBubble) {
            // Android: native service handles the panel — collapse the overlay
            window.AndroidBubble.collapseBubble();
            return;
        }

        // Electron: toggle the compact panel window (single click = open/close)
        if (window.electronAPI?.togglePanel) {
            window.electronAPI.togglePanel();
            return;
        }

        // Fallback (browser preview): toggle inline menu
        setShowMenu(prev => !prev);
    };

    // ── Right-click: show shortcut menu ────────────────────────────────────
    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!window.AndroidBubble) {
            setShowMenu(prev => !prev);
        }
    };

    const openApp = (tab?: string) => {
        setShowMenu(false);
        if (window.AndroidBubble) {
            window.AndroidBubble.openApp(tab || '');
        } else {
            window.electronAPI?.openMainWindow(tab);
        }
    };

    const closeBubble = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.AndroidBubble) {
            window.AndroidBubble.closeBubble();
        } else {
            window.electronAPI?.hideBubble();
        }
    };

    const showExpanded = showMenu || (typeof window !== 'undefined' && !!window.AndroidBubble);

    // ── Collapsed View (always shown; shortcut menu overlaid on right-click) ───
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
                position: 'relative',
            }}
            onMouseDown={handleMouseDown}
            onClick={handleClick}
            onContextMenu={handleContextMenu}
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

            {/* Right-click shortcut menu */}
            {showMenu && (
                <div
                    onClick={e => e.stopPropagation()}
                    style={{
                        position: 'absolute',
                        bottom: '100%',
                        right: 0,
                        marginBottom: 8,
                        width: 220,
                        background: 'linear-gradient(145deg, rgba(20,15,50,0.97), rgba(10,17,40,0.98))',
                        backdropFilter: 'blur(20px)',
                        borderRadius: 16,
                        border: '1px solid rgba(124,58,237,0.35)',
                        boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
                        overflow: 'hidden',
                        padding: '8px 10px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                        zIndex: 99,
                    }}
                >
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 9, margin: '0 0 4px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Quick Access</p>
                    <ActionButton icon="✅" label="Tasks" sublabel="View all tasks" color="#06b6d4" onClick={() => openApp('tasks')} />
                    <ActionButton icon="📄" label="Letters" sublabel="View approval letters" color="#8b5cf6" onClick={() => openApp('letters')} />
                    <ActionButton icon="🗂️" label="Archives" sublabel="Browse archived items" color="#10b981" onClick={() => openApp('archives')} />
                    <button
                        onClick={closeBubble}
                        style={{
                            marginTop: 2,
                            padding: '6px 0',
                            background: 'rgba(239,68,68,0.15)',
                            border: '1px solid rgba(239,68,68,0.3)',
                            borderRadius: 10,
                            color: '#f87171',
                            fontSize: 11,
                            cursor: 'pointer',
                            fontWeight: 600,
                        }}
                    >
                        ✕  Hide Bubble
                    </button>
                </div>
            )}

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
