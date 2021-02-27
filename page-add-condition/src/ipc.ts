declare let electron: any;

class ipcSevice {
    private ipcRenderer = electron.ipcRenderer

    on(message: string, done: () => any){
        return this.ipcRenderer.on(message, done);
    }

    send(message: string, ...args: any[]){
        this.ipcRenderer.send(message, ...args);
    }

    sendSync(message: string, ...args: any[]){
        return this.ipcRenderer.sendSync(message, ...args);
    }

    apiSend(method: string, ...args: any[]){
        this.ipcRenderer.send('api', method, ...args);
    }

    api(method: string, ...args: any[]) {
        this.ipcRenderer.send('api', method, ...args);
        return new Promise<{ errorCode: 0 | 1, params: any }>((resolve) => {
                this.ipcRenderer.once(`${method}reply`, (sender: any, response: any) =>{
                try {
                    resolve(JSON.parse(response))
                }
                catch(err) {
                    console.error('api parse faield!')
                    electron.dialog.showErrorBox('错误', '内部通信不可恢复错误!');
                    process.exit(1);
                }
            })
        })
    }
}

export const ipc = new ipcSevice()