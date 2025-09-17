/*
  main.ts
    Logica do backend
*/

// Requires
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const knex = require('knex');
const dotenv = require('dotenv');
// Imports
import type { Knex as KnexType } from 'knex';
import type { RespostaLogin } from './types';
import type { IpcMainInvokeEvent } from 'electron';

// configuração .env 
dotenv.config();

// Constantes
const knexConfig = require('./knexfile');
const db: KnexType = knex(knexConfig.development);

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

function createMenuWindow() {
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
  } catch (error) {
    console.error('[Main FATAL]: Falha ao conectar ao banco de dados:', error);
    app.quit();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createLoginWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// COMUNICAÇÃO IPC
ipcMain.handle('login:submit', async (event: IpcMainInvokeEvent, usuario: string, senha: string): Promise<RespostaLogin> => {
  try {
    const user = await db('usuarios').where({ nome_usuario: usuario }).first();
    if (user && user.senha === senha) {
      createMenuWindow();
      BrowserWindow.fromWebContents(event.sender)?.close();
      return { success: true, message: 'Login bem-sucedido!' };
    } else {
      return { success: false, message: 'Usuário ou senha inválidos' };
    }
  } catch (error) {
    console.error('[Main IPC Error]:', error);
    return { success: false, message: 'Erro de comunicação com o servidor.' };
  }
});