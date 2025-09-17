/*
    Preload 
*/

// Require e imports
const { contextBridge, ipcRenderer } = require('electron');
import type { IElectronAPI, RespostaLogin } from './types';

const api: IElectronAPI = {
    submitLogin: (usuario: string, senha: string): Promise<RespostaLogin> =>
        ipcRenderer.invoke('login:submit', usuario, senha),
};

contextBridge.exposeInMainWorld('api', api);