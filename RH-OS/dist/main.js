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
const db = require('./db/db');
const { adicionarUsuario } = require('./services/user');
const roleService = require('./services/role');
const logService = require('./services/log');
const fs = require('fs').promises;
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
ipcMain.handle('app:get-page', async (event, pageName) => {
    try {
        const filePath = path.join(__dirname, `../app/views/`, `${pageName}.html`);
        const content = await fs.readFile(filePath, 'utf-8');
        return { success: true, content };
    }
    catch (error) {
        console.error(`[Main FATAL]: Não foi possível carregar a página ${pageName}.html`, error);
        return { success: false, content: '<p>Erro ao carregar o conteúdo.</p>' };
    }
});
ipcMain.handle('add-usuario', async (event, dadosUsuario) => {
    console.log('[Main]: Recebido pedido para adicionar novo utilizador.');
    try {
        await adicionarUsuario(dadosUsuario);
        return { success: true, message: 'Utilizador cadastrado com sucesso!' };
    }
    catch (error) {
        console.error('[Main FATAL]: Erro ao chamar o serviço de adicionar utilizador:', error);
        return { success: false, message: `Falha no cadastro: ${error}` };
    }
});
ipcMain.handle('roles:getAll', async () => {
    try {
        const roles = await roleService.getAllRoles();
        return { success: true, data: roles };
    }
    catch (error) {
        console.error('[Main FATAL]: Erro ao buscar cargos:', error);
        return { success: false, message: error.message, data: [] };
    }
});
ipcMain.handle('log:acao', async (event, entrada) => {
    try {
        const res = await logService.registrar(entrada);
        return res;
    }
    catch (err) {
        console.error('Erro ao gravar log:', err);
        return { success: false, error: String(err) };
    }
});
ipcMain.handle('logs:obter', async (event, limit = 200) => {
    try {
        const res = await logService.listar(limit);
        console.debug('[Main] logs:obter result success=', res?.success, 'count=', Array.isArray(res?.data) ? res.data.length : 'n/a');
        return res;
    }
    catch (err) {
        console.error('Erro ao listar logs:', err);
        return { success: false, error: String(err) };
    }
});
//# sourceMappingURL=main.js.map