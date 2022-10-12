const { app, BrowserWindow } = require('electron')
const path = require('path');
const http = require('http');
const server = require('./backend/index');
var pjson = require('./package.json');

const PROXY_PORT = pjson.PROXY_PORT;

function createWindow() {
    if (!server.listening) {
        server.listen(PROXY_PORT, () => {
            console.info('Server running on port:', PROXY_PORT);
        });
    }

    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            webSecurity: false,
            allowRunningInsecureContent: true,
            nodeIntegration: true,
            preload: path.join(__dirname, "preload.js")
        }
    });

    win.loadURL(`http://localhost:${PROXY_PORT}/`);
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    http.get(`http://localhost:${PROXY_PORT}/shutdown`)
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
