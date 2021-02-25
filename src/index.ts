/* eslint-disable @typescript-eslint/no-explicit-any */
import path from 'path';
import { app, BrowserWindow, ipcMain } from 'electron';
import { Sequelize, Model, DataTypes } from 'sequelize';
import { api } from './api';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './db/database.sqlite'
});

class Data extends Model {}

Data.init({
  name: {
    type: DataTypes.STRING
  },
  age: {
    type: DataTypes.NUMBER
  }
}, {
  sequelize,
  modelName: 'Data'
});

(async() => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
  }
  catch(err) {
    console.error('Catch err:', err);
  }
})();

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false
    }
  });

  win.loadFile(path.join(__dirname, '../page-main/build/index.html'));
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
      event.sender.send(`${method}reply`, data);
  };
  const success = (params: any) => reply({ errorCode: 0, params });
  const failed= (params?: any) => reply({ errorCode: 1, params });
  if (api[method]){
      api[method]({ success, failed }, ...args);
  }
  else {
    failed();
  }
});