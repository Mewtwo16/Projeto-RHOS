/*
    Preload 
*/

// Require e imports
const { contextBridge, ipcRenderer } = require('electron');
import type { IElectronAPI, RespostaPagina, RespostaLogin, RespostaRoles } from './types';

async function getCurrentUserId(): Promise<number | null> {
    try {
        const res = await ipcRenderer.invoke('session:get');
        return typeof res?.userId === 'number' ? res.userId : null;
    } catch {
        return null;
    }
}

const api: IElectronAPI = {
    submitLogin: (usuario: string, senha: string): Promise<RespostaLogin> =>
        ipcRenderer.invoke('login:submit', usuario, senha),
    getPage: (pageName: string): Promise<RespostaPagina> => 
        ipcRenderer.invoke('app:get-page', pageName),
    addUser: (dadosUsuario: any) => 
        ipcRenderer.invoke('add-user', dadosUsuario),
    addRole: (dadosCargo: any) =>
        ipcRenderer.invoke('add-role', dadosCargo),
    getAllRoles: (): Promise<RespostaRoles> => 
        ipcRenderer.invoke('roles:getAll'),
    searchUsers: (filters?: { field?: string; value?: string }) =>
        ipcRenderer.invoke('users:search', filters),
    searchRoles: (filters?: { field?: string; value?: string }) =>
        ipcRenderer.invoke('roles:search', filters),
    
    logAction: async (entry: any) => {
        const uid = await getCurrentUserId();
        const payload = { user_id: uid ?? entry.user_id ?? null, ...entry };
        return ipcRenderer.invoke('log:write', payload);
    },
    getLogs: (limit?: number) => ipcRenderer.invoke('logs:get', limit),
};

contextBridge.exposeInMainWorld('api', api);