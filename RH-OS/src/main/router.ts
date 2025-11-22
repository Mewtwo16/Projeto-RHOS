import express from 'express'
const route = express.Router()

import { loginSchema, loginIsValid } from './middlewares/loginValidate'
import { addUserSchema, userIsValid } from './middlewares/addUserValidate'
import { addProfileSchema, profileIsValid } from './middlewares/addProfileValidate'

import { authenticateToken, requirePermissions } from './middlewares/authorization'

import { loginRoute } from './routes/authRoute'
import { addUserRoute, getUserRoute, listUsersRoute, updateUserRoute } from './routes/userRoute'
import { healthRoute } from './routes/healthRoute'
import { addProfileRoute, getProfileRoute, listProfilesRoute, updateProfileRoute } from './routes/profileRoute'
import { getAllowedRoute } from './routes/allowedRoute'
import { getLogsRoute } from './routes/logRoute'
import positionRoute from './routes/positionRoute'
import employeeRoute from './routes/employeeRoute'

route.get('/api/health', healthRoute)

route.post('/api/login', loginIsValid(loginSchema), loginRoute)

// ====== USERS ROUTES (padronizado: plural) ======
route.post('/api/users', authenticateToken, requirePermissions('users:create'), userIsValid(addUserSchema), addUserRoute)
route.get('/api/users', authenticateToken, requirePermissions('users:view'), listUsersRoute)
route.get('/api/users/:id', authenticateToken, requirePermissions('users:view'), getUserRoute)
route.put('/api/users/:id', authenticateToken, requirePermissions('users:update'), updateUserRoute)

// ====== PROFILES ROUTES (padronizado: plural) ======
route.post('/api/profiles', authenticateToken, requirePermissions('profiles:create'), profileIsValid(addProfileSchema), addProfileRoute)
route.get('/api/profiles', authenticateToken, requirePermissions('profiles:view'), listProfilesRoute)
route.get('/api/profiles/:id', authenticateToken, requirePermissions('profiles:view'), getProfileRoute)
route.put('/api/profiles/:id', authenticateToken, requirePermissions('profiles:update'), updateProfileRoute)

route.get('/api/allowed', authenticateToken, requirePermissions('permissions:view'), getAllowedRoute)
route.get('/api/logs', authenticateToken, requirePermissions('logs:view'), getLogsRoute)

route.use('/api/positions', authenticateToken, requirePermissions('positions:view'), positionRoute)

route.use('/api/employees', authenticateToken, requirePermissions('employees:view'), employeeRoute)

export default route
