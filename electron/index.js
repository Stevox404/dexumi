const { app, BrowserWindow } = require('electron')
const path = require('path');
const { spawn, ChildProcess } = require('child_process');
const pkg = require('./package.json');
const fs = require('fs');
const PORT = pkg.PORT;


/** @type {ChildProcess} */
let server;
function createWindow() {        
    let binPath = path.join(path.dirname(require.main.filename), 'bin');
    if(!fs.existsSync(binPath)) {
        binPath = path.join(process.resourcesPath, 'bin');
    }

    server = spawn(path.join(binPath, 'src/dexumi-backend-linux'), {
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
