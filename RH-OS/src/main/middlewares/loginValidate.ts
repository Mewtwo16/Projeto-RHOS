import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'

const loginSchema = Joi.object({
  usuario: Joi.string().required(),
  senha: Joi.string().required()
})

function loginIsValid(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body)
    if (error)
      return res.status(400).json({
        success: false,
        message: `[LoginValidate ERROR]: Erro de validação ${error.message}`
      })
    next()
  }
}

export { loginSchema, loginIsValid }
