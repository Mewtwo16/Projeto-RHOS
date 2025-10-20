"use strict";
/*
    Preload
*/
Object.defineProperty(exports, "__esModule", { value: true });
// Require e imports
const { contextBridge, ipcRenderer } = require('electron');
async function getCurrentUserId() {
    try {
        const res = await ipcRenderer.invoke('session:get');
        return typeof res?.userId === 'number' ? res.userId : null;
    }
    catch {
        return null;
    }
}
const api = {
    submitLogin: (usuario, senha) => ipcRenderer.invoke('login:submit', usuario, senha),
    getPage: (pageName) => ipcRenderer.invoke('app:get-page', pageName),
    addUser: (dadosUsuario) => ipcRenderer.invoke('add-user', dadosUsuario),
    addRole: (dadosCargo) => ipcRenderer.invoke('add-role', dadosCargo),
    getAllRoles: () => ipcRenderer.invoke('roles:getAll'),
    logAction: async (entry) => {
        const uid = await getCurrentUserId();
        const payload = { user_id: uid ?? entry.user_id ?? null, ...entry };
        return ipcRenderer.invoke('log:write', payload);
    },
    getLogs: (limit) => ipcRenderer.invoke('logs:get', limit),
};
contextBridge.exposeInMainWorld('api', api);
//# sourceMappingURL=preload.js.map