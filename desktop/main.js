const { app, BrowserWindow, dialog } = require('electron');
const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');
const path = require('path');

const PORT = 9192;
let backendProcess = null;
let mainWindow = null;

function ensureDirectory(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function backendExecutable() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'backend', 'virtual-bartender-backend.exe');
  }
  return path.join(__dirname, '..', 'runtime', 'backend', 'virtual-bartender-backend.exe');
}

function frontendDirectory() {
  if (app.isPackaged) return path.join(process.resourcesPath, 'frontend');
  return path.join(__dirname, '..', 'runtime', 'frontend');
}

function startBackend() {
  const appData = app.getPath('userData');
  const dataDir = path.join(appData, 'data');
  const mediaDir = path.join(dataDir, 'images');
  const backupDir = path.join(appData, 'backups');
  ensureDirectory(dataDir);
  ensureDirectory(mediaDir);
  ensureDirectory(backupDir);

  const exe = backendExecutable();
  if (!fs.existsSync(exe)) throw new Error(`Backend executable was not found: ${exe}`);

  backendProcess = spawn(exe, [], {
    windowsHide: true,
    env: {
      ...process.env,
      VB_PORT: String(PORT),
      DATABASE_URL: `sqlite:///${path.join(dataDir, 'bartender.db').replace(/\\/g, '/')}`,
      MEDIA_PATH: mediaDir,
      BACKUP_DIR: backupDir,
      FRONTEND_DIST_PATH: frontendDirectory()
    }
  });

  backendProcess.on('exit', (code) => {
    backendProcess = null;
    if (!app.isQuitting && code !== 0) {
      dialog.showErrorBox('Virtual Bartender', 'The local Virtual Bartender service stopped unexpectedly.');
    }
  });
}

function waitForBackend(timeoutMs = 30000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const tryRequest = () => {
      const request = http.get(`http://127.0.0.1:${PORT}/`, (response) => {
        response.resume();
        resolve();
      });
      request.on('error', () => {
        if (Date.now() - started >= timeoutMs) reject(new Error('Timed out waiting for the local service.'));
        else setTimeout(tryRequest, 250);
      });
      request.setTimeout(1000, () => request.destroy());
    };
    tryRequest();
  });
}

async function createWindow() {
  startBackend();
  await waitForBackend();

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 900,
    minHeight: 650,
    backgroundColor: '#17120d',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  await mainWindow.loadURL(`http://127.0.0.1:${PORT}/`);
}

app.whenReady().then(() => createWindow().catch((error) => {
  dialog.showErrorBox('Virtual Bartender could not start', error.message);
  app.quit();
}));

app.on('window-all-closed', () => app.quit());

app.on('before-quit', () => {
  app.isQuitting = true;
  if (backendProcess) backendProcess.kill();
});
