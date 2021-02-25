/* eslint-disable @typescript-eslint/no-explicit-any */
import { Sequelize, Model, DataTypes, Op } from 'sequelize';
import { dialog } from 'electron';
import fs from 'fs';

type Fields = {
    displayName: string,
    fieldName: string,
    type: 'string' | 'number',
}[];

let fields: Fields
try {
    fields = JSON.parse(fs.readFileSync('./fields.json').toString());
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
    query: async (handle, infos: Info[], limit: number, offset: number) => {
        await init();
        try {
            const datas = await Data.findAll({
                where: {
                    [Op.and]: infos.map(infoToOp)
                },
                order: [['id', 'ASC']],
                limit,
                offset
            });
            handle.success(datas.map((d) => d.toJSON()));
        }
        catch(err) {
            console.error('api query err:', err);
            handle.failed();
        }
    }
};