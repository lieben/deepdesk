// core/main.js — Electron主进程
const { app, BrowserWindow, ipcMain, screen, desktopCapturer, dialog } = require('electron')
const path = require('path')
const fs = require('fs')

let petWin = null, galgameWin = null
let currentMode = 'pet'

function createPetWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  petWin = new BrowserWindow({
    width: 300, height: 400,
    x: width - 320, y: height - 420,
    transparent: true, frame: false, alwaysOnTop: true,
    resizable: false, skipTaskbar: true,
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  })
  petWin.loadFile(path.join(__dirname, '../plugins/pet/index.html'))
  petWin.on('closed', () => { petWin = null })
}

function createGalgameWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  galgameWin = new BrowserWindow({
    width: 900, height: 600,
    x: Math.floor((width - 900) / 2), y: Math.floor((height - 600) / 2),
    transparent: true, frame: false, alwaysOnTop: true,
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  })
  galgameWin.loadFile(path.join(__dirname, '../plugins/galgame/index.html'))
  galgameWin.on('closed', () => { galgameWin = null })
}

app.whenReady().then(() => {
  createPetWindow()
})

ipcMain.on('switch-mode', (e, mode) => {
  if (mode === 'galgame') {
    if (petWin) petWin.hide()
    if (!galgameWin) createGalgameWindow()
    else galgameWin.show()
    currentMode = 'galgame'
  } else if (mode === 'pet') {
    if (galgameWin) galgameWin.hide()
    if (!petWin) createPetWindow()
    else petWin.show()
    currentMode = 'pet'
  } else if (mode === 'close') {
    app.quit()
  }
})

// 截图
ipcMain.handle('capture', async (e, type) => {
  const sources = await desktopCapturer.getSources({ types: ['screen'], thumbnailSize: screen.getPrimaryDisplay().size })
  if (!sources.length) return null
  return sources[0].thumbnail.toDataURL()
})

// 保存图片
ipcMain.handle('save-image', async (e, dataUrl) => {
  const { filePath } = await dialog.showSaveDialog({
    defaultPath: `screenshot_${Date.now()}.png`,
    filters: [{ name: 'PNG', extensions: ['png'] }]
  })
  if (filePath) {
    fs.writeFileSync(filePath, Buffer.from(dataUrl.replace(/^data:image\/\w+;base64,/, ''), 'base64'))
    return filePath
  }
  return null
})

// 插件间消息广播
ipcMain.on('plugin-msg', (e, msg) => {
  BrowserWindow.getAllWindows().forEach(w => { if (!w.isDestroyed()) w.webContents.send('plugin-msg', msg) })
})

app.on('window-all-closed', () => app.quit())
