import { app, BrowserWindow, ipcMain } from 'electron'
import { fileURLToPath } from 'url'
import sjcl from 'sjcl'
import path from 'path'
import fs from 'fs'
import dotenv from 'dotenv'
import os from 'os'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const userDataPath = app.getPath('userData');
const passwordFilePath = path.join(userDataPath, 'master-password.json');
const ENCODING = 'utf8';

let mainView: BrowserWindow | null = null;

const RENDERER_DIST = path.join(__dirname, '../..', 'dist') // Adjust if necessary
const indexHtml = path.join(RENDERER_DIST, 'index.html')
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

function masterPasswordExists() {
  return fs.existsSync(passwordFilePath);
}

function createMainWindow(initialRoute: string) {
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL + initialRoute)
    win.webContents.openDevTools()
  } else {
    win.loadFile(indexHtml, { hash: initialRoute })
  }

  win.on('close', () => {
    mainView = null; // This sets the global mainView to null
  })

  return win
}

app.whenReady().then(() => {
  let route = ''
  if (!masterPasswordExists()) {
    // No master password, go to setup route
    route = '#/setup_password'
  } else {
    // Password exists, user needs to authenticate
    route = '#/auth'
  }

  mainView = createMainWindow(route)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
})
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    let route = masterPasswordExists() ? '#/auth' : '#/setup_password'
    mainView = createMainWindow(route)
  }
})

// IPC handling for password submission from `/setup_password` route
ipcMain.on('password-submitted', (event, data) => {
  // Save master password and salt
  fs.writeFileSync(passwordFilePath, JSON.stringify(data));
  // Once master password is created, navigate to /auth
  if (mainView) {
    const route = '#/auth'
    if (VITE_DEV_SERVER_URL) {
      mainView.loadURL(VITE_DEV_SERVER_URL + route)
    } else {
      mainView.loadFile(indexHtml, { hash: route })
    }
  }
})

// IPC handling for verifying master password from `/auth` route
ipcMain.on('verify-master-password', (event, enteredPassword) => {
  try {
    const data = JSON.parse(fs.readFileSync(passwordFilePath));
    const { hashedPassword, salt } = data;
    const iterations = 10000;

    // Use sjcl to hash the enteredPassword with salt (assuming sjcl is loaded globally or modularly)
    const enteredHashedPasswordBits = sjcl.misc.pbkdf2(enteredPassword, sjcl.codec.hex.toBits(salt), iterations, 256);
    const enteredHashedPasswordHex = sjcl.codec.hex.fromBits(enteredHashedPasswordBits);

    if (enteredHashedPasswordHex === hashedPassword) {
      // Password is correct, navigate to /main
      if (mainView) {
        const route = '#/main'
        if (VITE_DEV_SERVER_URL) {
          mainView.loadURL(VITE_DEV_SERVER_URL + route)
        } else {
          mainView.loadFile(indexHtml, { hash: route })
        }
      }
    } else {
      event.reply('password-incorrect');
    }
  } catch (error) {
    console.error('Error verifying master password:', error);
  }
});
