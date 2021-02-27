import React from 'react';
import './App.css';
import { ipc } from './ipc';
import { NumberCondition, StringCondition } from './Condition';
import { Table } from './Table';

declare let electron: any;

function objsToData(objs: any[], state: AppState) {
  const data: any[][] = []
  for (const obj of objs) {
    const row: any[] = []
    for (const field of state.fields) {
      const value = obj[field.fieldName]
      row.push(value === null || value === undefined ? '-' : value)
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

type OpInfo = { field: string, op: string, value: string | number }

class AbstractCondition {
  lt = ''
  lte = ''
  eq = ''
  gte = ''
  gt = ''

  lk = ''
  sw = ''
  ew = ''

  fieldName: string
  displayName: string
  type: 'string' | 'number'
  constructor(fieldName: string, displayName: string, type: 'string' | 'number') {
    this.fieldName = fieldName
    this.displayName = displayName
    this.type = type
  }

  makeOps() {
    const results: OpInfo[] = []
    const ops = [['lt', this.lt], ['lte', this.lte], ['eq', this.eq], ['gte', this.gte], ['gt', this.gt], ['lk', this.lk], ['sw', this.sw], ['ew', this.ew]]
    for (const [opName, opValue] of ops) {
      if (opValue === '') {
        continue
      }
      results.push({ field: this.fieldName, op: opName, value: opValue })
    }
    return results
  }

  valueChange(type: string, value: string) {
    switch(type) {
      case 'lt':
          this.lt = value
          break
      case 'lte':
          this.lte = value
          break
      case 'eq':
          this.eq = value
          break
      case 'gte':
          this.gte = value
          break
      case 'gt':
          this.gt = value
          break
      case 'ew':
          this.ew = value
          break
      case 'sw':
          this.sw = value
          break
      case 'lk':
          this.lk = value
          break
    }
  }

  render() {
    return this.type === 'number' ? 
      <NumberCondition displayName={this.displayName} valueChange={this.valueChange.bind(this)} /> :
      <StringCondition displayName={this.displayName} valueChange={this.valueChange.bind(this)} />
  }
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
  private conditions: AbstractCondition[] = []

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
    this.conditions = [new AbstractCondition('price', '价格', 'number'), new AbstractCondition('name', '名字', 'string')]
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
      let ops: OpInfo[] = []
      for (const condition of this.conditions) {
        ops = ops.concat(condition.makeOps())
      }
      const response = await ipc.api('query', ops, this.state.limit, (newOffset !== undefined ? newOffset : this.state.offset) * this.state.limit)
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

  addCondition() {
    ipc.apiSend('addCondition')
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

  render() {
    return (
      <div className="div-app">
        <div className="div-main">
          <div className="div-conditions">
            {this.conditions.map((c) => c.render())}
            <button className="button-add-condition" onClick={this.addCondition.bind(this)}>
              <img className="img-add-condition" src="./add.png" alt="" />
            </button>
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
