export interface User {
  id: number
  full_name: string
  email: string
  login: string
  cpf: string
  birth_date: string
  status: number
  creation_date: string
  role?: string
}

export interface UserFormData {
  full_name: string
  email: string
  user: string // Campo usado na API (diferente do 'login' no User)
  password?: string
  cpf: string
  role: string
  status: number
  birth_date?: string
}

export interface Profile {
  id: number
  profile_name: string
  description: string
  permissions?: string[]
}

export interface ProfileFormData {
  profile_name: string
  description: string
  permissions: string[]
}

export interface Permission {
  id: number
  permission_name: string
}

export interface Position {
  id: number
  position_name: string
  description: string | null
  base_salary: number
  weekly_hours: number
  level: string | null
  department: string | null
  active: boolean
  created_at?: string
}

export interface PositionFormData {
  position_name: string
  description: string
  base_salary: string
  weekly_hours: string
  level: string
  department: string
  active: boolean
}

export interface Employee {
  id: number
  full_name: string
  cpf: string
  rg?: string | null
  birth_date: string
  gender?: string | null
  marital_status?: string | null
  nationality?: string
  phone?: string | null
  email?: string | null
  zip_code?: string | null
  street?: string | null
  street_number?: string | null
  complement?: string | null
  neighborhood?: string | null
  city?: string | null
  state?: string | null
  position_id: number
  position_name?: string
  hire_date: string
  termination_date?: string | null
  status: string
  contract_type?: string
  bank?: string | null
  agency?: string | null
  account?: string | null
  account_type?: string | null
  current_salary: number
  transportation_voucher: boolean
  meal_voucher: number
  health_insurance: boolean
  dental_insurance: boolean
  dependents: number
  ctps_numero?: string | null
  ctps_serie?: string | null
  ctps_uf?: string | null
  pis_pasep?: string | null
  titulo_eleitor?: string | null
  notes?: string | null
  created_at?: string
  updated_at?: string
}

export interface EmployeeFormData {
  full_name: string
  cpf: string
  rg: string
  birth_date: string
  gender: string
  marital_status: string
  nationality?: string
  phone: string
  email: string
  zip_code: string
  street: string
  street_number: string
  complement: string
  neighborhood: string
  city: string
  state: string
  position_id: string
  hire_date: string
  current_salary: string
  contract_type?: string
  transportation_voucher: boolean
  meal_voucher: string
  health_insurance?: boolean
  dental_insurance?: boolean
  dependents: string
  bank?: string
  agency?: string
  account?: string
  account_type?: string
  ctps_numero?: string
  ctps_serie?: string
  ctps_uf?: string
  pis_pasep?: string
  titulo_eleitor?: string
  notes?: string
}

export interface PayrollCalculation {
  salarioBruto: number
  inss: number
  irrf: number
  valeTransporteDesc: number
  totalDescontos: number
  salarioLiquido: number
  fgts: number
  inssPatronal: number
  rat: number
  sistemaS: number
  salarioEducacao: number
  totalEncargos: number
  custoTotal: number
}

export interface AuditLog {
  id: number
  user_id: number | null
  who: string
  where: string
  when: string
  what: string
}

export interface LoginCredentials {
  usuario: string
  senha: string
}

export interface LoginResponse {
  success: boolean
  message?: string
  token?: string
}

export interface DecodedToken {
  id: number
  user: string
  role: string[]
  perm: string[]
  iat: number
  exp: number
}

export interface SelectOption {
  value: string | number
  label: string
}

export interface ErrorState {
  [key: string]: string
}
