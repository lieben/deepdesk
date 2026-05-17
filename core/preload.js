// core/preload.js
const { contextBridge, ipcRenderer } = require('electron')
const path = require('path')
const fs = require('fs')

contextBridge.exposeInMainWorld('electron', {
  ipc: {
    send: (ch, ...a) => ipcRenderer.send(ch, ...a),
    invoke: (ch, ...a) => ipcRenderer.invoke(ch, ...a),
    on: (ch, fn) => ipcRenderer.on(ch, fn)
  },
  readConfig: () => JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8')),
  modelsDir: path.join(__dirname, '../models/'),
  setIgnoreMouse: (ignore) => ipcRenderer.send('pet-set-ignore', ignore)
})
