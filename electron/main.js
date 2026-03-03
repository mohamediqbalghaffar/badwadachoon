const { app, BrowserWindow, screen, ipcMain } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let bubbleWindow;

// ─── Collapsed / Expanded sizes ────────────────────────────────────────────
const BUBBLE_SIZE = { w: 80, h: 80 };
const EXPANDED_SIZE = { w: 240, h: 300 };

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
        : `file://${path.join(__dirname, '../out/index.html')}`;

    mainWindow.loadURL(startUrl);

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // When main window is closed, close everything
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
        skipTaskbar: true,        // don't show in taskbar — stays as overlay only
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
        : `file://${path.join(__dirname, '../out/floating-bubble.html')}`;

    bubbleWindow.loadURL(bubbleUrl);

    bubbleWindow.on('closed', () => {
        bubbleWindow = null;
    });
}

// ─── IPC: Drag — move bubble window ────────────────────────────────────────
ipcMain.on('move-bubble', (_, { x, y }) => {
    if (bubbleWindow) bubbleWindow.setPosition(x, y);
});

// ─── IPC: Resize bubble (collapsed ↔ expanded) ────────────────────────────
ipcMain.on('resize-bubble', (_, { width, height }) => {
    if (!bubbleWindow) return;
    const [cx, cy] = bubbleWindow.getPosition();
    const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;

    // Keep bubble inside screen when expanding
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
    // If a specific tab was requested, navigate to it
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
    createMainWindow();
    createBubbleWindow();
});

// Quit only when main window is explicitly closed (not minimized)
app.on('window-all-closed', () => {
    app.quit();
});

app.on('activate', () => {
    if (!mainWindow) createMainWindow();
});
