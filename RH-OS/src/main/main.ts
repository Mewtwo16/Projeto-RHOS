import { app, shell, BrowserWindow, ipcMain } from 'electron'
import path, { join } from 'node:path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'

let serverIsOn: boolean = false
let mainWindow: BrowserWindow | null = null

async function startServer(): Promise<void> {
  if (serverIsOn) return
  try {
    await import('./server')
    serverIsOn = true
    console.log('Servidor iniciado com sucesso')
  } catch (e) {
    console.error(`[Server Fatal]: Falha ao iniciar servidor: ${e}`)
  }
}

function createLoginWindow(): void {
  const loginWindow = new BrowserWindow({
    width: 900,
    height: 580,
    show: true,
    frame: false,
    transparent: true,
    autoHideMenuBar: true,
    resizable: false,
    ...(process.platform === 'linux'
      ? {
          icon: path.join(__dirname, '../../build/icon.png')
        }
      : process.platform === 'win32' && {
          icon: path.join(__dirname, 'resources', 'icon.png')
        }),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  loginWindow.on('ready-to-show', () => {
    loginWindow.show()
  })

  loginWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    loginWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    loginWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  ipcMain.once('login-success', () => {
    loginWindow.close()
    createMainWindow()
  })
}

function createMainWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: true,
    frame: true,
    transparent: false,
    autoHideMenuBar: false,
    ...(process.platform === 'linux'
      ? {
          icon: path.join(__dirname, '../../build/icon.png')
        }
      : process.platform === 'win32' && {
          icon: path.join(__dirname, 'resources', 'icon.png')
        }),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('closed', () => {
    const { session } = require('electron')
    session.defaultSession.clearStorageData({
      storages: ['localstorage']
    }).then(() => {
      console.log('Token de autenticação limpo')
    })
    mainWindow = null
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}#/home`)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: '/home' })
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')
  
  const { session } = require('electron')
  session.defaultSession.clearStorageData({
    storages: ['localstorage', 'sessionstorage', 'cookies', 'cachestorage']
  }).then(() => {
    console.log('Sessões antigas limpas ao iniciar')
  })

  startServer()
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('ping', () => console.log('pong'))

  ipcMain.on('logout', () => {
    if (mainWindow) {
      mainWindow.close()
      mainWindow = null
    }
    createLoginWindow()
  })

  createLoginWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createLoginWindow()
  })
})

app.on('window-all-closed', () => {
  const { session } = require('electron')
  session.defaultSession.clearStorageData({
    storages: ['localstorage', 'sessionstorage', 'cookies']
  }).then(() => {
    console.log('Storage limpo ao fechar aplicação')
  })

  if (process.platform !== 'darwin') {
    app.quit()
  }
})
