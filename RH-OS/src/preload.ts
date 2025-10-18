/*
    Preload 
*/

// Require e imports
const { contextBridge, ipcRenderer } = require('electron');
import type { IElectronAPI, RespostaPagina, RespostaLogin, RespostaRoles } from './types';

const api: IElectronAPI = {
    submitLogin: (usuario: string, senha: string): Promise<RespostaLogin> =>
        ipcRenderer.invoke('login:submit', usuario, senha),
    getPage: (pageName: string): Promise<RespostaPagina> => 
        ipcRenderer.invoke('app:get-page', pageName),
    adicionarUsuario: (dadosUsuario) => 
        ipcRenderer.invoke('add-usuario', dadosUsuario),
    getAllRoles: (): Promise<RespostaRoles> => 
        ipcRenderer.invoke('roles:getAll'),
    
    registrarLog: (entrada: any) => ipcRenderer.invoke('log:acao', entrada),
    obterLogs: (limit?: number) => ipcRenderer.invoke('logs:obter', limit),
    logAction: (entry: any) => ipcRenderer.invoke('log:acao', entry),
    getLogs: (limit?: number) => ipcRenderer.invoke('logs:obter', limit),
};

contextBridge.exposeInMainWorld('api', api);