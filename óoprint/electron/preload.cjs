const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    print: (content, options) => ipcRenderer.invoke('print', content, options),
    getPrinters: () => ipcRenderer.invoke('get-printers'),
    isElectron: true
});
