// Global type declarations for the app
// JSX types are handled automatically by Next.js via next-env.d.ts

interface Window {
  electronAPI?: {
    getAppVersion: () => Promise<string>;
    onUpdateAvailable: (callback: (info: { version: string }) => void) => void;
    onUpdateDownloaded: (callback: (info: { version: string }) => void) => void;
    installUpdate: () => void;
    checkForUpdates: () => void;
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
