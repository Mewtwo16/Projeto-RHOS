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
// configuração .env 
//dotenv.config();
// Constantes
//const knexConfig = require('./knexfile');
//const db: KnexType = knex(knexConfig.development);
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
    const menuWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });
    menuWindow.maximize();
    menuWindow.loadFile(path.join(__dirname, '../app/views/menu/menu.html'));
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
    // 2. Chame a função importada do serviço
    const resultadoLogin = await login(usuario, senha);
    // 3. Use o resultado para controlar o fluxo da aplicação
    if (resultadoLogin.success) {
        createMainWindow(); // ou createMenuWindow(), dependendo do nome da sua função
        BrowserWindow.fromWebContents(event.sender)?.close();
    }
    // 4. Retorne o resultado para a página de login
    return resultadoLogin;
});
//# sourceMappingURL=main.js.map