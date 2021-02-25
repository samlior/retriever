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
        return new Promise<any>((resolve) => {
                this.ipcRenderer.once(`${method}reply`, (sender: any, response: any) =>{
                resolve(response)
            })
        })
    }
}

export const ipc = new ipcSevice()