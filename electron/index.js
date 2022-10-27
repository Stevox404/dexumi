const { app, BrowserWindow } = require('electron')
const path = require('path');
const { spawn, ChildProcess } = require('child_process');
var pjson = require('./package.json');

const PORT = pjson.PORT;


/** @type {ChildProcess} */
let server;
function createWindow() {
    server = spawn('./bin/src/dexumi-backend-linux', {
        cwd: __dirname,
        env: {
            PORT,
        }
    });
    const win = new BrowserWindow({
        autoHideMenuBar: true,
        backgroundColor: '#0b0b0b',
        webPreferences: {
            webSecurity: false,
            allowRunningInsecureContent: true,
            nodeIntegration: true,
            preload: path.join(__dirname, "preload.js")
        }
    });
    win.maximize();

    server.stdout.on('data', fetchView);
    function fetchView(data) {
        const str = data.toString();
        if (/Server running on port/.test(str)) {
            win.loadURL(`http://localhost:${PORT}/`);
            server.stdout.off('data', fetchView);
        }
    }

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
    if (server) server.kill();
    if (process.platform !== 'darwin') {
        app.quit();
    }
})
