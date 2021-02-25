/* eslint-disable @typescript-eslint/no-explicit-any */
export const api: {
    [method: string]: (handle: { success: (params: any) => void, failed: (params?: any) => void }, ...args: any[]) => any
} = {

};