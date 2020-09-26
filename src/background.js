import { app, protocol, BrowserWindow, ipcMain, dialog, ipcRenderer } from 'electron'
import {
  createProtocol,
} from 'vue-cli-plugin-electron-builder/lib'

const isDevelopment = process.env.NODE_ENV !== 'production'

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{
  scheme: 'app',
  privileges: {
    secure: true,
    standard: true
  }
}])

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    frame: false,
    resizable: false,
    width: 900,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) {
      mainWindow.webContents.openDevTools()
    }
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    mainWindow.loadURL('app://./index.html')
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
/**
 * @description 选择文件
 */
ipcMain.on('open-directory-dialog', function (event, p) {
  dialog.showOpenDialog({
    properties: [p, 'multiSelections', 'showHiddenFiles']
  }).then(result => {
    const { canceled, filePaths } = result;
    if (p === 'openFile') {
      filePaths.length > 0 && event.reply('select-file', result.filePaths);
    }
    if (p === 'openDirectory') {
      console.log(222, result);
      filePaths.length > 0 && event.reply('select-folder', result.filePaths);
    }
  })
})
