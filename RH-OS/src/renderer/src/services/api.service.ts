import { API_BASE_URL } from '../config/api'

export interface APIResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  token?: string
}

interface RequestOptions {
  requiresAuth?: boolean
  headers?: Record<string, string>
}

class ApiService {
  private getAuthToken(): string | null {
    return localStorage.getItem('authToken')
  }

  private buildHeaders(options: RequestOptions = {}): Headers {
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...options.headers
    })

    if (options.requiresAuth !== false) {
      const token = this.getAuthToken()
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
    }

    return headers
  }

  private async handleResponse<T>(response: Response): Promise<APIResponse<T>> {
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || `Erro HTTP: ${response.status}`)
    }
    
    return data
  }

  async get<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<APIResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: this.buildHeaders(options)
      })
      
      return await this.handleResponse<T>(response)
    } catch (error) {
      console.error('Erro na requisição GET:', error)
      throw error
    }
  }

  async post<T = any>(
    endpoint: string,
    body: any,
    options: RequestOptions = {}
  ): Promise<APIResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: this.buildHeaders(options),
        body: JSON.stringify(body)
      })
      
      return await this.handleResponse<T>(response)
    } catch (error) {
      console.error('Erro na requisição POST:', error)
      throw error
    }
  }

  async put<T = any>(
    endpoint: string,
    body: any,
    options: RequestOptions = {}
  ): Promise<APIResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: this.buildHeaders(options),
        body: JSON.stringify(body)
      })
      
      return await this.handleResponse<T>(response)
    } catch (error) {
      console.error('Erro na requisição PUT:', error)
      throw error
    }
  }

  async delete<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<APIResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: this.buildHeaders(options)
      })
      
      return await this.handleResponse<T>(response)
    } catch (error) {
      console.error('Erro na requisição DELETE:', error)
      throw error
    }
  }

  async login(usuario: string, senha: string): Promise<APIResponse> {
    const response = await this.post(
      '/login',
      { usuario, senha },
      { requiresAuth: false }
    )
    
    if (response.success && response.token) {
      localStorage.setItem('authToken', response.token)
    }
    
    return response
  }

  logout(): void {
    localStorage.removeItem('authToken')
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken()
  }
}

export const apiService = new ApiService()
export default apiService
