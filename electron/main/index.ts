import { app, BrowserWindow, shell, ipcMain, screen, Tray, Menu, nativeImage, dialog } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path, { dirname } from "path";
import dotenv from "dotenv";
import fs from "fs";
import sjcl from "sjcl";
import os from 'node:os';

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const userDataPath = app.getPath('userData');
const passwordFilePath = path.join(userDataPath, 'master-password.json');
const ENCODING = 'utf8';

console.log('User Data Path:', userDataPath);
console.info('Password File Path:', passwordFilePath);

let welcomeView; // variable for the welcome page
let mainView; // variable for the main text edit page
let passwordInputWindow;  // variable for the password input window
let tray = null; // Tray should be initialized properly

// load env variables
dotenv.config();
if (!process.env.USER_FILE_PATH) {
  console.error('Error: USER_FILE_PATH is not defined in the .env file.');
  console.warn('Please check your .env file and set the USER_FILE_PATH variable.');
  process.exit(1);
}

// function checks if master password exists
function masterPasswordExists() {
  return fs.existsSync(passwordFilePath);
}

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs   > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.APP_ROOT = path.join(__dirname, '../..')

export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith('6.1')) app.disableHardwareAcceleration()

  // Disable hardware acceleration before app is ready
app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

const preload = path.join(__dirname, '../preload/index.mjs')
const indexHtml = path.join(RENDERER_DIST, 'index.html')

async function renderMainWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  const windowWidth = Math.floor(width * 0.8); // 80% of screen width
  const windowHeight = Math.floor(height * 0.8); // 80% of screen height

  // Path for dir with txt file
  const userFilesDir = path.dirname(process.env.USER_FILE_PATH);
  const filePath = path.resolve(process.env.USER_FILE_PATH);

  mainView = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    title: 'Main window',
    icon: path.join(process.env.VITE_PUBLIC, 'favicon.ico'),
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: false,
      contextIsolation: true,
      zoomFactor: 1
    },
    resizable: true,
    fullscreenable: true,
  })

  mainView.setMinimumSize(200, 200);
  mainView.loadFile("./src/windows/main/index.html");

  if (VITE_DEV_SERVER_URL) { // #298
    mainView.loadURL(VITE_DEV_SERVER_URL)
    // Open devTool if the app is not packaged
    mainView.webContents.openDevTools()
  } else {
    mainView.loadFile(indexHtml)
  }

  // Test actively push message to the Electron-Renderer
  mainView.webContents.on('did-finish-load', () => {
    mainView?.webContents.send('main-process-message', new Date().toLocaleString())
  })

    // Handle close event for the main window
    mainView.on("close", (event) => {
      if (!app.isQuitting) {
        event.preventDefault();
        mainView.close(); 
      }
    });

    (function createFileIfNotExists() {
      if (!fs.existsSync(userFilesDir)) {
        // Ensures all directories in the path are created by recursion
          fs.mkdirSync(userFilesDir, { recursive: true });
      }
  
      if (!fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, "", ENCODING);
  
          console.info(`File created at: ${filePath}`);
  
          // Show message in the main window
          dialog.showMessageBox(mainView, {
              title: "Welcome to Frog-app",
              message: "File has been created.",
              type: "info"
          });
      }
    })();

    function getDatаNow() {
      const DATE_NOW = new Date();
      
      const YEAR_NOW = DATE_NOW.getFullYear();
      const MONTH_NOW = String(DATE_NOW.getMonth() + 1).padStart(2, '0');
      const DAY_NOW = String(DATE_NOW.getDate()).padStart(2, '0');
      const HOURS_NOW = String(DATE_NOW.getHours()).padStart(2, '0');
      const MINUTES_NOW = String(DATE_NOW.getMinutes()).padStart(2, '0');
      const SECONDS_NOW = String(DATE_NOW.getSeconds()).padStart(2, '0');
      
      return `${YEAR_NOW}-${MONTH_NOW}-${DAY_NOW} ${HOURS_NOW}:${MINUTES_NOW}:${SECONDS_NOW}`;
    }
  
    function getMasterPassword() {
      return JSON.parse(fs.readFileSync(passwordFilePath, ENCODING));
    }

    ipcMain.on('save-and-encrypt-text', async (event, text) => {
      const userFilesDir = path.dirname(process.env.USER_FILE_PATH);
      const filePath = path.resolve(process.env.USER_FILE_PATH);
      const encryptedFilePath = path.join(userFilesDir, 'encrypted.txt');
      const DATE_ENCRYPT = getDatаNow();
  
      try {
        const passwordData = getMasterPassword();
        const { hashedPassword } = passwordData;
    
        const encryptedText = sjcl.encrypt(hashedPassword, text);
    
        fs.writeFileSync(encryptedFilePath, encryptedText, ENCODING);
        console.info(`Encrypted file has been saved to ${encryptedFilePath} at ${DATE_ENCRYPT}`);
    
        dialog.showMessageBox({
          type: 'info',
          title: 'Save and Encrypt Successful',
          message: `The text has been saved and encrypted at ${DATE_ENCRYPT}`
        });
      } catch (error) {
        console.error(`Error during save and encryption: ${error}\nDate the error occurred: ${DATE_ENCRYPT}`);
        dialog.showMessageBox({
          type: 'error',
          title: 'Error',
          message: 'There was an error saving or encrypting the text.'
        });
      }
    });

}

app.whenReady().then(renderMainWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('second-instance', () => {
  if (mainView) {
    // Focus on the main window if the user tried to open another
    if (mainView.isMinimized()) mainView.restore()
      mainView.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    renderMainWindow()
  }
})

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`)
  } else {
    childWindow.loadFile(indexHtml, { hash: arg })
  }
})


// const renderPasswordWindow = () => {
//   const windowWidth = 600;
//   const windowHeight = 600;

//   welcomeView = new BrowserWindow({
//     width: windowWidth,
//     height: windowHeight,
//     webPreferences: {
//       preload: path.join(__dirname, "./src/js/preload.js"),
//       nodeIntegration: false,
//       contextIsolation: true,
//     },
//     resizable: false,
//     fullscreenable: false,
//   });

//   if (process.env.APP_ENV === "local") {
//     welcomeView.webContents.openDevTools();
//   }

//   welcomeView.loadFile("./src/windows/createMasterPassword/createMasterPassword.html");

//   // Handle close event for the password window
//   welcomeView.on("close", (event) => {
//     if (!app.isQuitting) {
//       event.preventDefault();
//       welcomeView.hide(); // Hide the welcome window instead of closing
//     }
//   });
// };

// app.whenReady().then(() => {
//   if (masterPasswordExists()) {
//     renderPasswordInputWindow();
//   } else {
//       renderPasswordWindow();
//   }

//   // Create Tray icon
//   const iconPath = path.join(__dirname, "./src/icons/frogIconTemplate.png");
//   const icon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });

//   tray = new Tray(icon);

//   tray.on('click', () => {
//     const currentView = mainView || welcomeView;
//     if (currentView && !currentView.isDestroyed()) {
//         currentView.isVisible() ? currentView.hide() : currentView.show();
//     }
//     tray.closeContextMenu();
//   });

//   const contextMenu = Menu.buildFromTemplate([
//     {
//       label: "Close Frog-app",
//       type: "normal",
//       click: () => {
//         app.isQuitting = true; // for close app in cotext menu
//         if (mainView) {
//           mainView.close();
//         }
//         app.quit();
//       },
//     },
//   ]);

//   tray.on("right-click", () => {
//     tray.popUpContextMenu(contextMenu);
//   });

//   tray.setContextMenu(contextMenu);
//   tray.setToolTip("Frog-app.");

//   app.on('activate', () => {
//     if (BrowserWindow.getAllWindows().length === 0) {
//         if (masterPasswordExists()) {
//           renderPasswordInputWindow();
//         } else {
//             renderPasswordWindow();
//         }
//     }
//   });
// });

// Quit the app when all windows are closed (Windows & Linux)
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// IPC handling for the password submission
// ipcMain.on('password-submitted', (event, data) => {
//   console.info('Password data received:', data);

//   try {
//       // Store the hashed password and salt
//       fs.writeFileSync(passwordFilePath, JSON.stringify(data));

//       if (welcomeView) {
//           welcomeView.close();
//           welcomeView = null;
//       }
//       renderMainWindow();
//   } catch (error) {
//       console.error('Error saving master password:', error);
//   }
// });


// ipcMain.on('verify-master-password', (event, enteredPassword) => {
//   try {
//       const data = JSON.parse(fs.readFileSync(passwordFilePath));
//       const { hashedPassword, salt } = data;
//       const iterations = 10000;

//       // Hash the entered password with the stored salt
//       const enteredHashedPasswordBits = sjcl.misc.pbkdf2(enteredPassword, sjcl.codec.hex.toBits(salt), iterations, 256);
//       const enteredHashedPasswordHex = sjcl.codec.hex.fromBits(enteredHashedPasswordBits);

//       if (enteredHashedPasswordHex === hashedPassword) {
//           if (passwordInputWindow) {
//               passwordInputWindow.close();
//               passwordInputWindow = null;
//           }
//           renderMainWindow();
//       } else {
//           event.reply('password-incorrect');
//       }
//   } catch (error) {
//       console.error('Error verifying master password:', error);
//   }
// });


// function renderPasswordInputWindow() {
//   passwordInputWindow = new BrowserWindow({
//       width: 600,
//       height: 600,
//       webPreferences: {
//           preload: path.join(__dirname, "./src/js/preload.js"),
//           nodeIntegration: false,
//           contextIsolation: true,
//       },
//       resizable: false,
//       fullscreenable: false,
//   });

//   if (process.env.APP_ENV === "local") {
//     passwordInputWindow.webContents.openDevTools();
//   }

//   passwordInputWindow.loadFile("./src/windows/passwordInput/passwordInput.html");

//   // Handle close event for the password input window
//   passwordInputWindow.on("close", (event) => {
//       if (!app.isQuitting) {
//           event.preventDefault();
//           passwordInputWindow.hide(); // Hide the window instead of closing
//       }
//   });
// }