const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // Bubble drag: tell main process to move the bubble window
    moveBubble: (x, y) => ipcRenderer.send('move-bubble', { x, y }),

    // Bubble resize: tell main process to resize bubble window (collapsed vs expanded)
    resizeBubble: (width, height) => ipcRenderer.send('resize-bubble', { width, height }),

    // Open main app window (bring to foreground)
    openMainWindow: (tab) => ipcRenderer.send('open-main-window', { tab }),

    // Close / hide the bubble
    hideBubble: () => ipcRenderer.send('hide-bubble'),

    // Get screen bounds (so bubble knows where the edges are)
    getScreenBounds: () => ipcRenderer.invoke('get-screen-bounds'),

    // Listen for data updates from main process
    onDataUpdate: (callback) => ipcRenderer.on('data-update', (_, data) => callback(data)),
});
