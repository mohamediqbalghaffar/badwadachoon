// Standalone layout for the floating bubble overlay window.
// This bypasses the ClientLayout (auth, sidebar, etc.) so the bubble
// renders as a clean transparent overlay.
import React from 'react';

export const metadata = {
    title: 'HTS Bubble',
};

export default function FloatingBubbleLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
