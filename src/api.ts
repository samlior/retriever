/* eslint-disable @typescript-eslint/no-explicit-any */
import { Sequelize, Model, DataTypes } from 'sequelize';
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

const initPromise = new Promise<void>(async (resolve) => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        resolve();
    }
    catch(err) {
        console.error('Catch err:', err);
    }
});

async function init() {
    await initPromise;
}

export const api: {
    [method: string]: (handle: { success: (params?: any) => void, failed: (params?: any) => void }, ...args: any[]) => any
} = {
    test: async (handle) => {
        await init();
        try {
            const datas = await Data.findAll();
            console.log('datas', datas.map((d) => d.toJSON()));
            handle.success();
        }
        catch(err) {
            console.error('test err:', err);
            handle.failed();
        }
    }
};