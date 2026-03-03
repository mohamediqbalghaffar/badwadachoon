const { app, BrowserWindow, screen, ipcMain, protocol, net } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let bubbleWindow;

// ─── Collapsed / Expanded sizes ────────────────────────────────────────────
const BUBBLE_SIZE = { w: 80, h: 80 };
const EXPANDED_SIZE = { w: 240, h: 300 };

// ─── Register custom app:// protocol BEFORE app is ready ──────────────────
// This fixes the Next.js static export issue where all assets use absolute
// paths like /_next/static/... which break under file:// protocol.
if (!isDev) {
    protocol.registerSchemesAsPrivileged([
        {
            scheme: 'app',
            privileges: {
                secure: true,
                standard: true,
                supportFetchAPI: true,
                corsEnabled: true,
            },
        },
    ]);
}

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        show: false,
        icon: path.join(__dirname, '../public/logo.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    const startUrl = isDev
        ? 'http://localhost:3000'
        : 'app://localhost/';

    mainWindow.loadURL(startUrl);

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
        if (bubbleWindow) bubbleWindow.close();
    });
}

function createBubbleWindow() {
    const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;

    bubbleWindow = new BrowserWindow({
        width: BUBBLE_SIZE.w,
        height: BUBBLE_SIZE.h,
        x: sw - BUBBLE_SIZE.w - 20,
        y: sh - BUBBLE_SIZE.h - 20,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        resizable: false,
        hasShadow: false,
        skipTaskbar: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    bubbleWindow.setAlwaysOnTop(true, 'screen-saver');
    bubbleWindow.setVisibleOnAllWorkspaces(true);

    const bubbleUrl = isDev
        ? 'http://localhost:3000/floating-bubble'
        : 'app://localhost/floating-bubble';

    bubbleWindow.loadURL(bubbleUrl);

    bubbleWindow.on('closed', () => {
        bubbleWindow = null;
    });
}

// ─── IPC: Drag ─────────────────────────────────────────────────────────────
ipcMain.on('move-bubble', (_, { x, y }) => {
    if (bubbleWindow) bubbleWindow.setPosition(x, y);
});

// ─── IPC: Resize ───────────────────────────────────────────────────────────
ipcMain.on('resize-bubble', (_, { width, height }) => {
    if (!bubbleWindow) return;
    const [cx, cy] = bubbleWindow.getPosition();
    const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;
    const nx = Math.min(cx, sw - width - 10);
    const ny = Math.min(cy, sh - height - 10);
    bubbleWindow.setSize(width, height);
    bubbleWindow.setPosition(nx, ny);
});

// ─── IPC: Open main window ─────────────────────────────────────────────────
ipcMain.on('open-main-window', (_, { tab } = {}) => {
    if (!mainWindow) {
        createMainWindow();
        return;
    }
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
    if (tab) {
        mainWindow.webContents.executeJavaScript(
            `window.location.href = '/?tab=${tab}'`
        );
    }
});

// ─── IPC: Hide bubble ──────────────────────────────────────────────────────
ipcMain.on('hide-bubble', () => {
    if (bubbleWindow) bubbleWindow.hide();
});

// ─── IPC: Get screen bounds ────────────────────────────────────────────────
ipcMain.handle('get-screen-bounds', () => {
    return screen.getPrimaryDisplay().workAreaSize;
});

// ─── App lifecycle ─────────────────────────────────────────────────────────
app.on('ready', () => {
    // ── Register app:// protocol handler (production only) ──────────────
    if (!isDev) {
        const outDir = path.join(__dirname, '../out');

        protocol.handle('app', (request) => {
            const url = new URL(request.url);
            let filePath = url.pathname;

            // Remove leading slash and decode URI
            filePath = decodeURIComponent(filePath.replace(/^\//, ''));

            // Map to the out/ directory  
            let fullPath = path.join(outDir, filePath);

            // If path has no extension, try index.html (SPA routing)
            if (!path.extname(fullPath)) {
                // Try exact folder/index.html first
                const indexPath = path.join(fullPath, 'index.html');
                const fs = require('fs');
                if (fs.existsSync(indexPath)) {
                    fullPath = indexPath;
                } else {
                    fullPath = path.join(outDir, 'index.html');
                }
            }

            return net.fetch('file://' + fullPath);
        });
    }

    createMainWindow();
    createBubbleWindow();
});

app.on('window-all-closed', () => {
    app.quit();
});

app.on('activate', () => {
    if (!mainWindow) createMainWindow();
});
