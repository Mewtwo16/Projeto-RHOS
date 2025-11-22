import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const API_BASE = `http://localhost:${process.env.EXPRESS_PORT || 3000}`
const api = {
  async submitLogin(user: string, password: string) {
    const res = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'content-Type': 'application/json' },
      body: JSON.stringify({ user, password })
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return { success: false, message: data?.message || `HTTP ${res.status}` }
    return data
  },
  notifyLoginSuccess() {
    ipcRenderer.send('login-success')
  },
  notifyLogout() {
    ipcRenderer.send('logout')
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
}
