/* eslint-disable @typescript-eslint/no-explicit-any */
import path from 'path';
import { app, BrowserWindow, ipcMain } from 'electron';
import { api, setMainWindow } from './api';

function createWindow () {
  const win = new BrowserWindow({
    width: 1000,
    height: 850,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false
    }
  });

  win.loadFile(path.join(__dirname, '../page-main/build/index.html'));
  setMainWindow(win);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on('api', (event, method: string, ...args: any[]) =>{
  const reply = (data: any) => {
      event.sender.send(`${method}reply`, JSON.stringify(data));
  };
  const success = (params?: any) => reply({ errorCode: 0, params });
  const failed= (params?: any) => reply({ errorCode: 1, params });
  if (api[method]){
      api[method]({ success, failed }, ...args);
  }
  else {
    failed();
  }
});