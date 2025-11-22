import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'

const permissionPattern = /^[a-z0-9._-]+:[a-z0-9._-]+$/

export const addProfileSchema = Joi.object({
  profile_name: Joi.string().min(3).max(100).required(),
  description: Joi.string().allow(null, '').max(255),
  permissions: Joi.array().items(Joi.string().pattern(permissionPattern)).max(200).default([])
})

export function profileIsValid(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false })
    if (error) {
      return res.status(400).json({
        success: false,
        message: `[RoleValidate ERROR] Falha de validação: ${error.message}`
      })
    }
    if (Array.isArray(value.permissions)) {
      const unique = Array.from(new Set(value.permissions.map((p: string) => p.trim()))).filter(
        Boolean
      )
      value.permissions = unique
    }
    req.body = value
    next()
  }
}
