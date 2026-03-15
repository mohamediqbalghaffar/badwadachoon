const { app, BrowserWindow, screen, ipcMain } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let bubbleWindow;
let panelWindow;
let localServer;        // http.Server
let serverPort = null;  // assigned at runtime

const BUBBLE_W = 80, BUBBLE_H = 80;

// ─── MIME types ────────────────────────────────────────────────────────────
const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript',
    '.mjs': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.txt': 'text/plain',
    '.webmanifest': 'application/manifest+json',
};

// ─── Tiny static file server ───────────────────────────────────────────────
function startLocalServer(outDir, callback) {
    const server = http.createServer((req, res) => {
        // Strip query string and decode
        let urlPath = decodeURIComponent(req.url.split('?')[0]);

        // Map URL to filesystem path inside out/
        let filePath = path.join(outDir, urlPath);

        const tryFile = (fp) => {
            fs.readFile(fp, (err, data) => {
                if (err) {
                    // SPA fallback: serve index.html for unknown routes
                    fs.readFile(path.join(outDir, 'index.html'), (e2, html) => {
                        if (e2) { res.writeHead(404); res.end('Not found'); return; }
                        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                        res.end(html);
                    });
                    return;
                }
                const ext = path.extname(fp).toLowerCase();
                const mime = MIME[ext] || 'application/octet-stream';
                res.writeHead(200, { 'Content-Type': mime });
                res.end(data);
            });
        };

        if (!path.extname(filePath)) {
            // Route without extension — try: flat .html, folder/index.html, spa-fallback
            const flatHtml = path.join(outDir, urlPath.replace(/^\//, '') + '.html');
            const nestedHtml = path.join(filePath, 'index.html');

            fs.access(flatHtml, fs.constants.F_OK, (e1) => {
                if (!e1) { tryFile(flatHtml); return; }
                fs.access(nestedHtml, fs.constants.F_OK, (e2) => {
                    if (!e2) { tryFile(nestedHtml); return; }
                    tryFile(path.join(outDir, 'index.html')); // SPA fallback
                });
            });
        } else {
            tryFile(filePath);
        }
    });

    // Port 0 = OS assigns a free port automatically
    server.listen(0, '127.0.0.1', () => {
        callback(null, server.address().port);
    });

    server.on('error', (err) => callback(err, null));
    return server;
}

// ─── Windows ───────────────────────────────────────────────────────────────
function createMainWindow(port) {
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

    const url = isDev ? 'http://localhost:3000' : `http://127.0.0.1:${port}/`;
    mainWindow.loadURL(url);

    mainWindow.once('ready-to-show', () => mainWindow.show());
    mainWindow.on('closed', () => {
        mainWindow = null;
        if (bubbleWindow) bubbleWindow.close();
    });
}

function createBubbleWindow(port) {
    const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;

    bubbleWindow = new BrowserWindow({
        width: BUBBLE_W,
        height: BUBBLE_H,
        x: sw - BUBBLE_W - 20,
        y: sh - BUBBLE_H - 20,
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

    const url = isDev
        ? 'http://localhost:3000/floating-bubble'
        : `http://127.0.0.1:${port}/floating-bubble`;
    bubbleWindow.loadURL(url);

    bubbleWindow.on('closed', () => { bubbleWindow = null; });
}

function createPanelWindow(port) {
    const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;

    panelWindow = new BrowserWindow({
        width: 420,
        height: 620,
        x: sw - 440,
        y: sh - 660,
        frame: true,           // real title bar with minimize / close
        alwaysOnTop: true,
        resizable: true,
        skipTaskbar: false,    // shows in taskbar so user can switch to it
        title: 'Tasks (by HTS)',
        icon: path.join(__dirname, '../public/logo.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    panelWindow.setAlwaysOnTop(true, 'floating');

    const url = isDev ? 'http://localhost:3000' : `http://127.0.0.1:${port}/`;
    panelWindow.loadURL(url);

    // Hide instead of close so bubble can reopen it
    panelWindow.on('close', (e) => {
        e.preventDefault();
        panelWindow.hide();
    });
}

// ─── IPC ───────────────────────────────────────────────────────────────────
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

ipcMain.on('toggle-panel', () => {
    if (!panelWindow) { createPanelWindow(serverPort); return; }
    if (panelWindow.isVisible()) {
        panelWindow.hide();
    } else {
        panelWindow.show();
        panelWindow.focus();
    }
});

ipcMain.on('open-main-window', (_, { tab } = {}) => {
    if (!mainWindow) { createMainWindow(serverPort); return; }
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
    if (isDev) {
        // Dev mode: Next.js already running on 3000
        createMainWindow(null);
        createBubbleWindow(null);
        createPanelWindow(null);
        return;
    }

    // Production: start local HTTP server to serve the out/ folder
    const outDir = path.join(__dirname, '../out');
    localServer = startLocalServer(outDir, (err, port) => {
        if (err) {
            console.error('Failed to start local server:', err);
            app.quit();
            return;
        }
        serverPort = port;
        console.log(`Local server running on http://127.0.0.1:${port}`);
        createMainWindow(port);
        createBubbleWindow(port);
        createPanelWindow(port);
    });
});

app.on('window-all-closed', () => {
    if (localServer) localServer.close();
    app.quit();
});

app.on('activate', () => {
    if (!mainWindow) createMainWindow(serverPort);
});
