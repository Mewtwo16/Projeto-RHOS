import Joi from 'joi'
import { Request, Response, NextFunction } from 'express'

/**
 * Schema de validação para cadastro/atualização de funcionário
 */
export const addEmployeeSchema = Joi.object({
  // Dados Pessoais (Obrigatórios)
  full_name: Joi.string().min(3).max(200).required().messages({
    'string.empty': 'Nome completo é obrigatório',
    'string.min': 'Nome deve ter no mínimo 3 caracteres',
    'string.max': 'Nome deve ter no máximo 200 caracteres',
    'any.required': 'Nome completo é obrigatório'
  }),
  
  cpf: Joi.string().length(11).pattern(/^\d+$/).required().messages({
    'string.empty': 'CPF é obrigatório',
    'string.length': 'CPF deve ter 11 dígitos',
    'string.pattern.base': 'CPF deve conter apenas números',
    'any.required': 'CPF é obrigatório'
  }),
  
  birth_date: Joi.date().iso().max('now').required().messages({
    'date.base': 'Data de nascimento inválida',
    'date.max': 'Data de nascimento não pode ser futura',
    'any.required': 'Data de nascimento é obrigatória'
  }),

  // Dados Pessoais (Opcionais)
  rg: Joi.string().max(20).allow(null, '').optional(),
  gender: Joi.string().max(20).allow(null, '').optional(),
  marital_status: Joi.string().max(30).allow(null, '').optional(),
  nationality: Joi.string().max(50).default('Brasileiro').optional(),

  // Contato
  phone: Joi.string().max(20).allow(null, '').optional(),
  email: Joi.string().email().max(100).allow(null, '').optional().messages({
    'string.email': 'E-mail inválido'
  }),

  // Endereço
  zip_code: Joi.string().max(10).allow(null, '').optional(),
  street: Joi.string().max(200).allow(null, '').optional(),
  street_number: Joi.string().max(10).allow(null, '').optional(),
  complement: Joi.string().max(100).allow(null, '').optional(),
  neighborhood: Joi.string().max(100).allow(null, '').optional(),
  city: Joi.string().max(100).allow(null, '').optional(),
  state: Joi.string().length(2).allow(null, '').optional().messages({
    'string.length': 'Estado deve ter 2 caracteres (UF)'
  }),

  // Dados de Trabalho (Obrigatórios)
  position_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Cargo inválido',
    'number.positive': 'ID do cargo deve ser positivo',
    'any.required': 'Cargo é obrigatório'
  }),
  
  hire_date: Joi.date().iso().max('now').required().messages({
    'date.base': 'Data de admissão inválida',
    'date.max': 'Data de admissão não pode ser futura',
    'any.required': 'Data de admissão é obrigatória'
  }),
  
  current_salary: Joi.number().positive().precision(2).required().messages({
    'number.base': 'Salário inválido',
    'number.positive': 'Salário deve ser maior que zero',
    'any.required': 'Salário é obrigatório'
  }),

  // Dados de Trabalho (Opcionais)
  termination_date: Joi.date().iso().allow(null).optional(),
  status: Joi.string().max(20).default('ativo').optional(),
  contract_type: Joi.string().max(30).default('CLT').optional(),

  // Dados Bancários
  bank: Joi.string().max(100).allow(null, '').optional(),
  agency: Joi.string().max(10).allow(null, '').optional(),
  account: Joi.string().max(20).allow(null, '').optional(),
  account_type: Joi.string().max(20).allow(null, '').optional(),

  // Benefícios
  transportation_voucher: Joi.boolean().default(false).optional(),
  meal_voucher: Joi.number().min(0).precision(2).default(0).optional(),
  health_insurance: Joi.boolean().default(false).optional(),
  dental_insurance: Joi.boolean().default(false).optional(),
  
  // Dependentes
  dependents: Joi.number().integer().min(0).default(0).optional().messages({
    'number.min': 'Número de dependentes não pode ser negativo'
  }),

  // Documentos
  ctps_numero: Joi.string().max(20).allow(null, '').optional(),
  ctps_serie: Joi.string().max(20).allow(null, '').optional(),
  ctps_uf: Joi.string().length(2).allow(null, '').optional(),
  pis_pasep: Joi.string().max(20).allow(null, '').optional(),
  titulo_eleitor: Joi.string().max(20).allow(null, '').optional(),
  notes: Joi.string().allow(null, '').optional()
})

export function employeeIsValid(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { 
      abortEarly: false,
      stripUnknown: true
    })

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))

      return res.status(400).json({
        success: false,
        message: 'Erro de validação',
        errors
      })
    }

    next()
  }
}

export const updateEmployeeSchema = addEmployeeSchema.fork(
  ['full_name', 'cpf', 'birth_date', 'position_id', 'hire_date', 'current_salary'],
  (schema) => schema.optional()
)
