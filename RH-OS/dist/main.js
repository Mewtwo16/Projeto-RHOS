"use strict";
/*
  main.ts
    Logica do backend
*/
Object.defineProperty(exports, "__esModule", { value: true });
// Requires
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const login = require('./services/auth').login;
const db = require('./services/auth').db;
const { adicionarUsuario } = require('./services/user');
// --- GERENCIAMENTO DE JANELAS ---
function createLoginWindow() {
    const loginWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });
    loginWindow.maximize();
    loginWindow.loadFile(path.join(__dirname, '../app/views/login/login.html'));
}
function createMainWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });
    mainWindow.maximize();
    mainWindow.loadFile(path.join(__dirname, '../app/views/menu/menu.html'));
}
app.whenReady().then(async () => {
    try {
        await db.raw('SELECT 1+1 AS result');
        console.log('[Main]: Conexão com o banco de dados estabelecida com sucesso.');
        createLoginWindow();
    }
    catch (error) {
        console.error('[Main FATAL]: Falha ao conectar ao banco de dados:', error);
        app.quit();
    }
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0)
            createLoginWindow();
    });
});
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        app.quit();
});
// COMUNICAÇÃO IPC
ipcMain.handle('login:submit', async (event, usuario, senha) => {
    const resultadoLogin = await login(usuario, senha);
    if (resultadoLogin.success) {
        createMainWindow();
        BrowserWindow.fromWebContents(event.sender)?.close();
    }
    return resultadoLogin;
});
ipcMain.handle('add-usuario', async (event, dadosUsuario) => {
    console.log('[Main]: Recebido pedido para adicionar novo utilizador.');
    try {
        await adicionarUsuario(db, dadosUsuario);
        return { success: true, message: 'Utilizador cadastrado com sucesso!' };
    }
    catch (error) {
        console.error('[Main FATAL]: Erro ao chamar o serviço de adicionar utilizador:', error);
        return { success: false, message: `Falha no cadastro: ${error}` };
    }
});
//# sourceMappingURL=main.js.map