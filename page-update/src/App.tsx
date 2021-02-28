import React from 'react';
import './App.css';
import { ipc } from './ipc';

declare let electron: any;

type AppState = {
  fields: { fieldName: string, displayName: string }[],
  data: any[],
  id: string
}

export class App extends React.Component<any, AppState>{
  private quering: boolean = false

  constructor(props: any) {
    super(props)
    this.state = {
      fields: [],
      data: [],
      id: ''
    }
    this.init()
  }

  private async queryLock<T>(fn: () => Promise<T>) {
    if (this.quering) {
      return
    }
    this.quering = true
    await fn()
    this.quering = false
  }

  private async init() {
    await this.queryLock(async () => {
      if (this.state.fields.length === 0) {
        const response = await ipc.api('fields')
        const responseData: { errorCode: 0 | 1, params: string[] } = await ipc.api('updateRecordData')
        if (response.errorCode === 0 && responseData.errorCode === 0) {
          const state: any = this.state
          state.fields = response.params
          if (responseData.params.length > 0) {
            const id = responseData.params[0]
            state.id = typeof id === 'string' ? id : `${id}`
          }
          if (responseData.params.length > 1) {
            state.data = responseData.params.slice(1)
          }
          while (state.data.length < state.fields.length - 1) {
            state.data.push('')
          }
          this.setState(state)
        } else {
          console.error('init failed')
          electron.dialog.showErrorBox('错误', '内部通信不可恢复错误!');
          process.exit(1)
        }
      }
    })
  }

  render() {
    return (
      <div className="div-main">
        <div className="div-field-wrapper">
          <div className="div-span-column-wrapper">
            {
              this.state.fields.slice(1).map((f, i) => {
                return (
                  <div className="div-span-wrapper">
                    <span>{f.displayName}:</span>
                  </div>
              )})
            }
          </div>
          <div className="div-input-column-wrapper">
            {
              this.state.fields.slice(1).map((f, i) => {
                return (
                  <div className="div-input-wrapper">
                    <input type="text" className="input-field-value" value={this.state.data[i]}/>
                  </div>
              )})
            }
          </div>
        </div>
        <div className="div-button-wrapper">
          <button className="button-cancel" onClick={() => { ipc.apiSend('updateRecordResult', false); window.close() }}>
            取消
          </button>
        </div>
      </div>
    )
  }
}
