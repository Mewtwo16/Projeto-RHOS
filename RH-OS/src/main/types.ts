import { Request } from 'express'

export interface AnyResponse {
  success: boolean
  message?: string
  data?: any
}

export interface LoginResponse {
  success: boolean
  message: string
  token?: string
}

export interface AuthUser {
  id: number
  usuario: string
  profile: string[]
  permissoes: string[]
}

export interface AuthRequest extends Request {
  user?: AuthUser
}

export interface User {
  id: number
  full_name: string
  email: string
  login: string
  cpf: string
  birth_date: string
  status: boolean
  role: string
}

export interface addUser {
  full_name: string
  email: string
  cpf: string
  birth_date: string
  user: string
  password: string
  status: boolean
  role: string
}

export interface Profile {
  id: number
  profile_name: string
  description?: string
  permission_id?: number
}

export interface addProfile {
  profile_name: string
  description?: string
  permissions?: string[]
}

export interface AllowedPermission {
  id: number
  permission_name: string
}

export interface AllowedResponse {
  success: boolean
  data?: AllowedPermission[]
  message?: string
}

export interface LogEntry {
  user_id?: number | null
  who?: string | null
  where: string
  what: string
}

export interface IElectronAPI {
  submitLogin: (usuario: string, senha: string) => Promise<LoginResponse>
  addUser: (dadosUsuario: addUser) => Promise<AnyResponse>
  addProfile: (dadosCargo: addProfile) => Promise<AnyResponse>
  getAllRoles: () => Promise<Profile[] | AnyResponse>
  searchUsers: (filters?: { field?: string; value?: string }) => Promise<User[] | AnyResponse>
  searchProfiles: (filters?: { field?: string; value?: string }) => Promise<Profile[] | AnyResponse>
  logAction: (entry: any) => Promise<AnyResponse>
  getLogs: (limit?: number) => Promise<AnyResponse>
  getAllowed: () => Promise<AllowedResponse>
}
