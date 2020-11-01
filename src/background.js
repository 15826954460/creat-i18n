import { app, protocol, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'path';
import {
  createProtocol,
} from 'vue-cli-plugin-electron-builder/lib'

const isDevelopment = process.env.NODE_ENV !== 'production'

let win

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{
  scheme: 'app',
  privileges: {
    secure: true,
    standard: true
  }
}])

// https://www.electronjs.org/docs/api/browser-window
function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    frame: false,
    center: true,
    resizable: true,
    width: 916,
    height: 600,
    minWidth: 916,
    minHeight: 600,
    icon: path.join(__static, 'favicon.ico'),
    webPreferences: {
      nodeIntegration: true,
    }
  })

  const { VUE_APP_ENV } = process.env;

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    // if (!process.env.IS_TEST) {
      // win.webContents.openDevTools() // 打开调试工具会阻止win.close事件
    // }
    if (VUE_APP_ENV === 'development') {
      win.webContents.openDevTools();
    }
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }

  win.on('closed', () => {
    win = null;
  });
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
      filePaths.length > 0 && event.reply('select-folder', result.filePaths);
    }
  })
})

// 窗口 最小化
ipcMain.on('window-min', () => { // 收到渲染进程的窗口最小化操作的通知，并调用窗口最小化函数，执行该操作
  win.minimize();
})

// 窗口 最大化、恢复
ipcMain.on('window-max', () => {
  if(win.isMaximized()){ // 为true表示窗口已最大化
    win.restore();// 将窗口恢复为之前的状态.
  }else{
    win.maximize();
  }
})

//  关闭窗口
ipcMain.on('window-close', () => {
  win.close();
})