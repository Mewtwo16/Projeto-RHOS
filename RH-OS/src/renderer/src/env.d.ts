/// <reference types="vite/client" />

interface Window {
  api?: {
    submitLogin(user: string, password: string): Promise<any>
    notifyLoginSuccess(): void
    notifyLogout(): void
  }
}
