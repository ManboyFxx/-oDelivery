const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// if (require('electron-squirrel-startup')) {
//     app.quit();
// }

let mainWindow;

const createWindow = () => {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        icon: path.join(__dirname, '../public/favicon.ico'), // Adjust icon path as needed
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    // Load the app
    // In development, load from the Vite dev server
    // In production, load the local index.html
    const isDev = !app.isPackaged;

    if (isDev) {
        mainWindow.loadURL('http://localhost:12345');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    // Remove menu (optional, for kiosk-like feel)
    // mainWindow.setMenu(null);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Printer handler
ipcMain.handle('print', async (event, content, options) => {
    const printWindow = new BrowserWindow({
        show: false,
        webPreferences: {
            nodeIntegration: true // Simplifies printing content
        }
    });

    try {
        await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(content)}`);

        // Default options
        const printOptions = {
            silent: options?.silent || false,
            printBackground: true,
            deviceName: options?.deviceName || '' // Empty = default printer
        };

        if (!printOptions.deviceName) {
            delete printOptions.deviceName;
        }

        // Print
        await new Promise((resolve, reject) => {
            printWindow.webContents.print(printOptions, (success, errorType) => {
                if (!success) {
                    reject(new Error(errorType));
                } else {
                    resolve();
                }
            });
        });

        printWindow.close();
        return { success: true };
    } catch (error) {
        printWindow.close();
        console.error('Print failed:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('get-printers', async () => {
    const windows = BrowserWindow.getAllWindows();
    const win = windows[0] || mainWindow;
    if (win) {
        return win.webContents.getPrintersAsync();
    }
    return [];
});
