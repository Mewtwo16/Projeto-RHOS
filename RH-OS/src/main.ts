/*
    Usando metodo atual ES modules
*/

// Imports
import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url'; // Transforma URL em caminho

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); //necessita definir a variavel __dirname

// Função de Criação padrão
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile(path.join(__dirname, '../app/index.html'));
}

// Gerencia a ciclo da aplicação
app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});