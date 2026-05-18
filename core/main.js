// core/main.js — Electron主进程
const { app, BrowserWindow, ipcMain, screen, desktopCapturer, dialog } = require('electron')
const path = require('path')
const fs = require('fs')

let petWin = null, galgameWin = null
let currentMode = 'pet'

const statePath = path.join(app.getPath('userData'), 'window-state.json')
function readWindowState() {
  try { return JSON.parse(fs.readFileSync(statePath, 'utf8')) } catch { return {} }
}
function writeWindowState(state) {
  try { fs.mkdirSync(path.dirname(statePath), { recursive: true }); fs.writeFileSync(statePath, JSON.stringify(state, null, 2)) } catch (e) { console.warn('[state] save failed', e) }
}
function saveGalBounds() {
  if (!galgameWin || galgameWin.isDestroyed()) return
  const state = readWindowState()
  state.galgameBounds = galgameWin.getBounds()
  writeWindowState(state)
}
function getDefaultGalBounds() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  const saved = readWindowState().galgameBounds
  if (saved && saved.width >= 320 && saved.height >= 520) return saved
  return { width: 430, height: 760, x: Math.floor((width - 430) / 2), y: Math.floor((height - 760) / 2) }
}

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
  petWin.webContents.on('console-message', (event, level, message, line, sourceId) => {
    // Electron: 0=verbose, 1=info, 2=warning, 3=error
    const levels = ['debug', 'info', 'warn', 'error']
    const tag = levels[level] || `level${level}`
    const out = level >= 3 ? console.error : console.log
    out(`[pet:${tag}] ${message}`)
  })
  petWin.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('[pet:load-fail]', errorCode, errorDescription, validatedURL)
  })
  petWin.webContents.on('render-process-gone', (event, details) => {
    console.error('[pet:render-gone]', details)
  })
  petWin.loadFile(path.join(__dirname, '../plugins/pet/index.html'))
  if (process.env.DEEPDESK_DEVTOOLS === '1') petWin.webContents.openDevTools({ mode: 'detach' })
  petWin.on('closed', () => { petWin = null })
}

function createGalgameWindow() {
  const bounds = getDefaultGalBounds()
  galgameWin = new BrowserWindow({
    // 手机比例 Galgame 窗口：首次9:16居中；之后恢复用户上次大小/位置
    ...bounds,
    minWidth: 320, minHeight: 520,
    transparent: true, frame: false, alwaysOnTop: true, resizable: true,
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  })
  galgameWin.loadFile(path.join(__dirname, '../plugins/galgame/index.html'))
  galgameWin.on('move', saveGalBounds)
  galgameWin.on('resize', saveGalBounds)
  galgameWin.on('hide', saveGalBounds)
  galgameWin.on('close', saveGalBounds)
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
