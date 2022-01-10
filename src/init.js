const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');
const isDev = require('electron-is-dev');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({width: 900, height: 680, webPreferences: {webSecurity: false}});
  mainWindow.loadURL('http://localhost:3000/')
  //   mainWindow.loadURL(url.format({
//       pathname: path.join(__dirname, 'index.js'),
//       protocol: "file",
//       slashes: "true"
//   }));
  mainWindow.on('closed', () => mainWindow = null);
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('certificate-error', function(event, webContents, url, error, 
    certificate, callback) {
        event.preventDefault();
        callback(true);
  });