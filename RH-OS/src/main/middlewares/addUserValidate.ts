import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'
import { cpf } from 'cpf-cnpj-validator'

const addUserSchema = Joi.object({
  full_name: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  user: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(6).required(),
  cpf: Joi.string()
    .custom((v, helpers) => {
      const s = cpf.strip(String(v))
      if (!cpf.isValid(s)) return helpers.error('any.invalid')
      return s
    })
    .required(),
  birth_date: Joi.date().less('now').required(),
  role: Joi.string().min(3).max(50).required(),
  status: Joi.number().required()
})

function userIsValid(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body)
    if (error)
      return res.status(400).json({
        success: false,
        message: `[UserValidate ERROR]: Erro de validação ${error.message}`
      })
    next()
  }
}

export { addUserSchema, userIsValid }
