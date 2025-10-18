"use strict";
/*
    Preload
*/
Object.defineProperty(exports, "__esModule", { value: true });
// Require e imports
const { contextBridge, ipcRenderer } = require('electron');
const api = {
    submitLogin: (usuario, senha) => ipcRenderer.invoke('login:submit', usuario, senha),
    getPage: (pageName) => ipcRenderer.invoke('app:get-page', pageName),
    adicionarUsuario: (dadosUsuario) => ipcRenderer.invoke('add-usuario', dadosUsuario),
    getAllRoles: () => ipcRenderer.invoke('roles:getAll'),
    registrarLog: (entrada) => ipcRenderer.invoke('log:acao', entrada),
    obterLogs: (limit) => ipcRenderer.invoke('logs:obter', limit),
    logAction: (entry) => ipcRenderer.invoke('log:acao', entry),
    getLogs: (limit) => ipcRenderer.invoke('logs:obter', limit),
};
contextBridge.exposeInMainWorld('api', api);
//# sourceMappingURL=preload.js.map