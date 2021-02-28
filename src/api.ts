/* eslint-disable @typescript-eslint/no-explicit-any */
import { Sequelize, Model, DataTypes, Op } from 'sequelize';
import { BrowserWindow, dialog } from 'electron';
import fs from 'fs';
import path from 'path';

let mainWindow!: BrowserWindow
let addConditionWindow: BrowserWindow | undefined
let updateRecordWindow: BrowserWindow | undefined
let addConditionResolve: ((result?: string) => void) | undefined;
let updateRecordResolve: ((result: boolean) => void) | undefined;
let updateRecordData: string[] | undefined

export function setMainWindow(window: BrowserWindow) {
    mainWindow = window
}

type Fields = {
    displayName: string,
    fieldName: string,
    type: string,
}[];

let admin: boolean = false
let fields: Fields
try {
    const fieldsJSON = JSON.parse(fs.readFileSync('./fields.json').toString())
    admin = !!fieldsJSON.admin
    fields = [{
        displayName: 'id',
        fieldName: 'id',
        type: 'number'
    }].concat(fieldsJSON.fields)
}
catch(err) {
    console.error('read fields.json faild, error:', err);
    dialog.showErrorBox('错误', '无法获取数据格式文件, 请检查fields.json文件是否存在!');
    process.exit(1);
}

let fieldsObj: { [name: string]: any } = {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    }
}
for (const field of fields) {
    if (field.fieldName === 'id') {
        continue
    }
    const fieldObj: any = {}
    fieldObj[field.fieldName] = { type: field.type === 'string' ? DataTypes.STRING : DataTypes.INTEGER }
    fieldsObj = Object.assign(fieldsObj, fieldObj)
}

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './db/database.sqlite'
});
  
class Data extends Model {}

Data.init(fieldsObj, {
    sequelize,
    modelName: 'Data'
});

const initPromise = new Promise<void>(async (resolve) => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        resolve();
    }
    catch(err) {
        console.error('Sqlite3 init err:', err);
        dialog.showErrorBox('错误', '链接数据库失败, 请联系管理员!');
        process.exit(1);
    }
});

async function init() {
    await initPromise;
}

type Info = { field: string, op: string, value: string | number };

function infoToOp(info: Info) {
    let opObj: any
    switch(info.op) {
        case 'lt':
            opObj = { [Op.lt]: info.value }
            break
        case 'lte':
            opObj = { [Op.lte]: info.value }
            break
        case 'eq':
            opObj = { [Op.eq]: info.value }
            break
        case 'gte':
            opObj = { [Op.gte]: info.value }
            break
        case 'gt':
            opObj = { [Op.gt]: info.value }
            break
        case 'ew':
            opObj = { [Op.endsWith]: info.value }
            break
        case 'sw':
            opObj = { [Op.startsWith]: info.value }
            break
        case 'lk':
            opObj = { [Op.like]: '%' + info.value + '%' }
            break
        default:
            console.error('unknow op', info.op)
            process.exit(1)
    }
    const queryObj: any = {}
    queryObj[info.field] = opObj
    return queryObj
}

export const api: {
    [method: string]: (handle: { success: (params?: any) => void, failed: (params?: any) => void }, ...args: any[]) => any
} = {
    addCondition: async (handle) => {
        if (addConditionResolve) {
            handle.failed();
            return
        }
        try {
            if (addConditionWindow === undefined) {
                addConditionWindow = new BrowserWindow({
                    width: 400,
                    height: 560,
                    parent: mainWindow,
                    modal: true,
                    frame: false,
                    webPreferences: {
                        nodeIntegration: true,
                        webSecurity: false
                    }
                });

                addConditionWindow.on('close', () => { addConditionWindow = undefined })
                addConditionWindow.loadFile(path.join(__dirname, '../page-add-condition/build/index.html'))
                addConditionWindow.show()
            }
            const displayName = await new Promise<string | undefined>((resolve) => {
                addConditionResolve = resolve
            })
            handle.success(displayName ? fields.find((f) => f.displayName === displayName)! : undefined)
        }
        catch(err) {
            console.error('api addCondition err:', err);
            handle.failed();
        }
    },
    addConditionResult: (handle, result: string) => {
        if (addConditionResolve) {
            addConditionResolve(result)
            addConditionResolve = undefined
        }
    },
    cancelAddCondition: (handle) => {
        if (addConditionResolve) {
            addConditionResolve()
            addConditionResolve = undefined
        }
    },
    message: (handle, message: string) => {
        dialog.showMessageBox(mainWindow, { type: 'info', message, buttons: ['确定'] }).catch((err) => {
            console.error('api message err:', err);
        })
    },
    confirm: async (handle, message: string) => {
        try {
            const returnValue = await dialog.showMessageBox(mainWindow, { type: 'info', message, buttons: ['确定', '取消'] });
            handle.success(returnValue.response === 0);
        }
        catch(err) {
            console.error('api confirm err:', err);
            handle.failed();
        }
    },
    fields: (handle) => {
        handle.success({ admin, fields });
    },
    query: async (handle, infos: Info[], limit: number, offset: number) => {
        await init();
        try {
            const { rows, count } = await Data.findAndCountAll({
                where: {
                    [Op.and]: infos.map(infoToOp)
                },
                order: [['id', 'ASC']],
                limit,
                offset
            });
            handle.success({
                rows: rows.map((r) => r.toJSON()),
                count
            });
        }
        catch(err) {
            console.error('api query err:', err);
            handle.failed();
        }
    },
    updateRecord: async (handle, data: string[]) => {
        if (updateRecordResolve) {
            handle.failed();
            return
        }
        try {
            updateRecordData = data
            if (updateRecordResolve === undefined) {
                updateRecordWindow = new BrowserWindow({
                    width: 400,
                    height: 540,
                    parent: mainWindow,
                    modal: true,
                    frame: false,
                    webPreferences: {
                        nodeIntegration: true,
                        webSecurity: false
                    }
                });

                updateRecordWindow.on('close', () => { updateRecordWindow = undefined })
                updateRecordWindow.loadFile(path.join(__dirname, '../page-update/build/index.html'))
                updateRecordWindow.show()
            }
            const result = await new Promise<boolean>((resolve) => {
                updateRecordResolve = resolve
            })
            handle.success(result)
        }
        catch(err) {
            console.error('api addCondition err:', err);
            handle.failed();
        }
    },
    updateRecordResult: (handle, result: boolean) => {
        if (updateRecordResolve) {
            updateRecordResolve(result)
            updateRecordResolve = undefined
        }
    },
    updateRecordData: (handle) => {
        handle.success(updateRecordData === undefined ? [] : updateRecordData)
        updateRecordData = undefined
    },
    update: async (handle, infos: Info[], id?: number) => {
        await init();
        try {
            const installProperties = (data: any) => {
                for (const info of infos) {
                    data[info.field] = info.value;
                }
            }
            if (id !== undefined) {
                const data = await Data.findByPk(id);
                if (!data) {
                    dialog.showErrorBox('错误', '数据丢失')
                    process.exit(1)
                }
                installProperties(data);
                await data.save();
            }
            else {
                const data: any = {}
                installProperties(data);
                await Data.create(data)
            }
            handle.success();
        }
        catch(err) {
            console.error('api update err:', err);
            handle.failed();
        }
    },
    deleteRecord: async (handle, id: number) => {
        await init()
        try {
            const data = await Data.findByPk(id);
            if (!data) {
                dialog.showErrorBox('错误', '数据丢失')
                process.exit(1)
            }
            await data.destroy();
            handle.success();
        }
        catch(err) {
            console.error('api deleteRecord err:', err);
            handle.failed();
        }
    }
};