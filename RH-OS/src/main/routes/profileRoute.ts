import { Response } from 'express'
import { AuthRequest } from '../types'
import profileService from '../services/profileService'

export async function addProfileRoute(req: AuthRequest, res: Response) {
  try {
    const profileData = req.body
    const loggedUser = req.user
    
    const profileResponse = await profileService.addProfile(profileData, loggedUser)

    if (profileResponse.success) {
      res.json({
        success: true,
        message: profileResponse.message || 'Sucesso na criação do cargo.'
      })
    } else {
      res.status(400).json(profileResponse)
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error })
  }
}

export async function getProfileRoute(req: AuthRequest, res: Response) {
  try {
    const { id, profile_name, description } = req.query

    const opts: any = {}
    if (id && !isNaN(Number(id))) {
      opts.id = Number(id)
    } else if (profile_name && typeof profile_name === 'string') {
      opts.profile_name = profile_name
    } else if (description && typeof description === 'string') {
      opts.description = description
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Informe id, profile_name ou description como query.' 
      })
    }
    
    const profileResponse = await profileService.searchProfiles(opts)
    
    if (profileResponse.success && profileResponse.data) {
      res.json({ success: true, data: profileResponse.data })
    } else if (profileResponse.success && !profileResponse.data) {
      res.status(404).json({ success: false, message: 'Cargo não encontrado.' })
    } else {
      res.status(500).json(profileResponse)
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error })
  }
}

export async function listProfilesRoute(req: AuthRequest, res: Response) {
  try {
    const profileResponse = await profileService.listAllProfiles()
    
    if (profileResponse.success) {
      res.json({ success: true, data: profileResponse.data })
    } else {
      res.status(500).json(profileResponse)
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error })
  }
}

export async function updateProfileRoute(req: AuthRequest, res: Response) {
  try {
    const profileId = parseInt(req.params.id, 10)
    if (isNaN(profileId)) {
      return res.status(400).json({ success: false, message: 'ID inválido' })
    }

    const profileData = req.body
    const loggedUser = req.user
    
    const profileResponse = await profileService.updateProfile(profileId, profileData, loggedUser)

    if (profileResponse.success) {
      res.json({
        success: true,
        message: profileResponse.message || 'Cargo atualizado com sucesso.'
      })
    } else {
      res.status(400).json(profileResponse)
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error })
  }
}
