import { ElectronAPI } from '@electron-toolkit/preload'
import { LoginResponse } from '../main/types'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      submitLogin(user: string, password: string): Promise<LoginResponse>
      notifyLoginSuccess(): void
      notifyLogout(): void
    }
  }
}

export {}
