import React from 'react';
import './App.css';
import { ipc } from './ipc';
import { Condition } from './Condition';
import { Table } from './Table';

declare let electron: any;

function objsToData(objs: any[], state: AppState) {
  const data: any[][] = []
  for (const obj of objs) {
    const row: any[] = []
    for (const field of state.fields) {
      row.push(obj[field.fieldName])
    }
    data.push(row)
  }
  while (data.length < state.limit) {
    const row: string[] = []
    for (let i = 0; i < state.fields.length; i++) {
      row.push('-')
    }
    data.push(row)
  }
  return data
}

type AppState = {
  fields: { fieldName: string, displayName: string }[],
  data: any[][],
  limit: number,
  offset: number,
  pageCount: number
}

export class App extends React.Component<any, AppState>{
  private quering: boolean = false
  private count: number = 0 

  constructor(props: any) {
    super(props)
    this.state = { 
      fields: [],
      data: [],
      limit: 10,
      offset: 0,
      pageCount: 0
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

  async startQuery(newOffset?: number) {
    await this.queryLock(async () => {
      const response = await ipc.api('query', [], this.state.limit, (newOffset !== undefined ? newOffset : this.state.offset) * this.state.limit)
      if (response.errorCode === 0) {
        const state: any = this.state
        if (newOffset !== undefined) {
          state.offset = newOffset
        }
        state.pageCount = Math.ceil(this.count / state.limit) - 1
        if (state.pageCount < 0) {
          state.pageCount = 0
        }
        state.data = objsToData(response.params, state)
        this.setState(state)
      } else {
        ipc.apiSend('message', '查询失败')
      }
    })
  }

  createNewOne() {

  }

  private async init() {
    await this.queryLock(async () => {
      if (this.state.fields.length === 0) {
        const response = await ipc.api('fields')
        const response2 = await ipc.api('count')
        if (response.errorCode === 0 && response2.errorCode === 0) {
          this.count = response2.params
          const state: any = this.state
          state.pageCount = Math.ceil(this.count / state.limit) - 1
          if (state.pageCount < 0) {
            state.pageCount = 0
          }
          state.fields = response.params
          state.data = objsToData([], state)
          this.setState(state)
        } else {
          console.error('init failed')
          electron.dialog.showErrorBox('错误', '内部通信不可恢复错误!');
          process.exit(1)
        }
      }
    })
  }

  handleAddCondition() {

  }

  handleConditionValueChange(type: string, value: string) {
    console.log('handleConditionValueChange, type:', type, 'value:', value)
  }

  render() {
    return (
      <div className="div-app">
        <div className="div-main">
          <div className="div-conditions">
            <Condition valueChange={this.handleConditionValueChange.bind(this)} addCondition={this.handleAddCondition.bind(this)} />
          </div>
          <Table
            fields={this.state.fields}
            data={this.state.data}
            admin={true}
            limit={this.state.limit}
            offset={this.state.offset}
            pageCount={this.state.pageCount}
            startQuery={this.startQuery.bind(this)}
            createNewOne={this.createNewOne.bind(this)}
            limitChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              const state: any = this.state
              state.limit = Number(event.target.value)
              this.setState(state)
            }}
            offsetChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              const state: any = this.state;
              state.offset = Number(event.target.value) - 1
              if (state.offset < 0) {
                state.offset = 0
              }
              this.setState(state)
            }}/>
        </div>
      </div>
    )
  }
}
