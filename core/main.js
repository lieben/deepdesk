// core/main.js — Electron主进程
const { app, BrowserWindow, ipcMain, screen, desktopCapturer, dialog } = require('electron')
const path = require('path')
const fs = require('fs')

let petWin = null, galgameWin = null
let currentMode = 'pet'

function createPetWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  petWin = new BrowserWindow({
    width, height, x: 0, y: 0,
    transparent: true, frame: false, alwaysOnTop: true,
    resizable: false, skipTaskbar: true, hasShadow: false,
    focusable: true,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, sandbox: false }
  })
  petWin.setIgnoreMouseEvents(true, { forward: true })
  ipcMain.on('pet-set-ignore', (e, ignore) => {
    if (petWin) petWin.setIgnoreMouseEvents(ignore, { forward: true })
  })
  petWin.loadFile(path.join(__dirname, '../plugins/pet/index.html'))
  petWin.webContents.openDevTools({ mode: 'detach' })
  petWin.on('closed', () => { petWin = null })
}

function createGalgameWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  galgameWin = new BrowserWindow({
    // 手机比例 Galgame 窗口：9:16，居中显示
    width: 430, height: 760,
    x: Math.floor((width - 430) / 2), y: Math.floor((height - 760) / 2),
    transparent: true, frame: false, alwaysOnTop: true, resizable: false,
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
