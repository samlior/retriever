import { api } from '../src/api'

(async () => {
    const work = (name: string, ...args: any[]) => {
        return new Promise<boolean>((resolve) => {
            const handle = {
                success: () => { resolve(true); },
                failed: () => { resolve(false) }
            }
            api[name](handle, ...args)
        })
    }
    const results: boolean[] = []
    for (let i = 0; i < 50; i++) {
        results.push(await work('update', [{fieldName: 'price', value: `${i}`}, {fieldName: 'name', value: `name${i}`}]))
    }
    console.log(results.reduce((a, b) => a && b, true) ? 'all success' : 'something failed')
})();