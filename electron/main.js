const { app, BrowserWindow, screen, ipcMain, protocol } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let bubbleWindow;

const BUBBLE_SIZE = { w: 80, h: 80 };
const EXPANDED_SIZE = { w: 240, h: 300 };

// ─── MIME type map ─────────────────────────────────────────────────────────
const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.webp': 'image/webp',
    '.txt': 'text/plain',
};

// ─── Must register BEFORE app is ready ────────────────────────────────────
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

// ─── Main window ───────────────────────────────────────────────────────────
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

    mainWindow.loadURL(isDev ? 'http://localhost:3000' : 'app://localhost/');

    mainWindow.once('ready-to-show', () => mainWindow.show());
    mainWindow.on('closed', () => {
        mainWindow = null;
        if (bubbleWindow) bubbleWindow.close();
    });
}

// ─── Bubble window ──────────────────────────────────────────────────────────
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
    bubbleWindow.on('closed', () => { bubbleWindow = null; });
}

// ─── IPC handlers ──────────────────────────────────────────────────────────
ipcMain.on('move-bubble', (_, { x, y }) => {
    if (bubbleWindow) bubbleWindow.setPosition(x, y);
});

ipcMain.on('resize-bubble', (_, { width, height }) => {
    if (!bubbleWindow) return;
    const [cx, cy] = bubbleWindow.getPosition();
    const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;
    bubbleWindow.setSize(width, height);
    bubbleWindow.setPosition(
        Math.min(cx, sw - width - 10),
        Math.min(cy, sh - height - 10)
    );
});

ipcMain.on('open-main-window', (_, { tab } = {}) => {
    if (!mainWindow) { createMainWindow(); return; }
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
    if (tab) {
        mainWindow.webContents.executeJavaScript(
            `window.location.href = '/?tab=${tab}'`
        );
    }
});

ipcMain.on('hide-bubble', () => {
    if (bubbleWindow) bubbleWindow.hide();
});

ipcMain.handle('get-screen-bounds', () => screen.getPrimaryDisplay().workAreaSize);

// ─── App ready ────────────────────────────────────────────────────────────
app.on('ready', () => {

    if (!isDev) {
        // Out directory — works with ASAR because Electron's fs module
        // transparently reads files from inside .asar archives
        const outDir = path.join(__dirname, '../out');

        protocol.handle('app', (request) => {
            return new Promise((resolve) => {
                const url = new URL(request.url);
                let relPath = decodeURIComponent(url.pathname).replace(/^\//, '');

                // Build candidate full path inside out/
                let fullPath = path.join(outDir, relPath);

                // No extension → it's a route, try folder/index.html first
                const resolveFile = (fp) => {
                    fs.readFile(fp, (err, data) => {
                        if (err) {
                            // Fall back to root index.html (SPA catch-all)
                            fs.readFile(path.join(outDir, 'index.html'), (err2, html) => {
                                if (err2) {
                                    resolve(new Response('Not Found', { status: 404 }));
                                } else {
                                    resolve(new Response(html, {
                                        status: 200,
                                        headers: { 'Content-Type': 'text/html; charset=utf-8' },
                                    }));
                                }
                            });
                            return;
                        }
                        const ext = path.extname(fp).toLowerCase();
                        const mime = MIME[ext] || 'application/octet-stream';
                        resolve(new Response(data, {
                            status: 200,
                            headers: { 'Content-Type': mime },
                        }));
                    });
                };

                if (!path.extname(fullPath)) {
                    // Try route/index.html (e.g. /floating-bubble → floating-bubble/index.html)
                    const candidate = path.join(fullPath, 'index.html');
                    fs.access(candidate, fs.constants.F_OK, (err) => {
                        if (!err) {
                            resolveFile(candidate);
                        } else {
                            resolveFile(path.join(outDir, 'index.html'));
                        }
                    });
                } else {
                    resolveFile(fullPath);
                }
            });
        });
    }

    createMainWindow();
    createBubbleWindow();
});

app.on('window-all-closed', () => app.quit());
app.on('activate', () => { if (!mainWindow) createMainWindow(); });
