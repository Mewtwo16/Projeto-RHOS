"use strict";
/*
    Preload
*/
Object.defineProperty(exports, "__esModule", { value: true });
// Require e imports
const { contextBridge, ipcRenderer } = require('electron');
const api = {
    submitLogin: (usuario, senha) => ipcRenderer.invoke('login:submit', usuario, senha),
    adicionarUsuario: (dadosUsuario) => ipcRenderer.invoke('add-usuario', dadosUsuario),
};
contextBridge.exposeInMainWorld('api', api);
//# sourceMappingURL=preload.js.map