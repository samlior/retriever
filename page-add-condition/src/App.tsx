import React from 'react';
import './App.css';
import { ipc } from './ipc';

declare let electron: any;

type AppState = {
  fields: { fieldName: string, displayName: string }[]
}

export class App extends React.Component<any, AppState>{
  private quering: boolean = false

  constructor(props: any) {
    super(props)
    this.state = {
      fields: []
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
        if (response.errorCode === 0) {
          const state: any = this.state
          state.fields = response.params
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
        <span>请选择要筛选的字段:</span>
        <div className="div-field-name-wrapper">
          {this.state.fields.map((f) => <button className="button-field-name">{f.displayName}</button>)}
        </div>
        <div className="div-button-wrapper">
          <button className="button-cancel" onClick={() => { window.close() }}>
            取消
          </button>
        </div>
      </div>
    )
  }
}
