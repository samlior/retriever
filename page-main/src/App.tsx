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
  app: App

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
  constructor(fieldName: string, displayName: string, type: 'string' | 'number', app: App) {
    this.fieldName = fieldName
    this.displayName = displayName
    this.type = type
    this.app = app
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
    this.app.updateState()
  }

  deleteCondition() {
    this.app.deleteCondition(this)
  }

  render() {
    return this.type === 'number' ? 
      <NumberCondition displayName={this.displayName} valueChange={this.valueChange.bind(this)} deleteCondition={this.deleteCondition.bind(this)} lt={this.lt} lte={this.lte} eq={this.eq} gte={this.gte} gt={this.gt} lk={this.lk} sw={this.sw} ew={this.ew}/> :
      <StringCondition displayName={this.displayName} valueChange={this.valueChange.bind(this)} deleteCondition={this.deleteCondition.bind(this)} lt={this.lt} lte={this.lte} eq={this.eq} gte={this.gte} gt={this.gt} lk={this.lk} sw={this.sw} ew={this.ew}/>
  }
}

type AppState = {
  fields: { fieldName: string, displayName: string }[],
  data: any[][],
  limit: number,
  offset: number,
  pageCount: number,
  conditions: AbstractCondition[]
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
      pageCount: 0,
      conditions: []
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
    if (this.state.limit <= 0) {
      return
    }
    await this.queryLock(async () => {
      let ops: OpInfo[] = []
      for (const condition of this.state.conditions) {
        ops = ops.concat(condition.makeOps())
      }
      const response = await ipc.api('query', ops, this.state.limit, (newOffset !== undefined ? newOffset : this.state.offset) * this.state.limit)
      if (response.errorCode === 0) {
        const state: any = this.state
        if (newOffset !== undefined) {
          state.offset = newOffset
        }
        this.count = response.params.count
        state.pageCount = Math.ceil(this.count / state.limit) - 1
        if (state.pageCount < 0) {
          state.pageCount = 0
        }
        state.data = objsToData(response.params.rows, state)
        this.setState(state)
      } else {
        ipc.apiSend('message', '查询失败')
      }
    })
  }

  async createNewOne() {
    let success = false
    await this.queryLock(async () => {
      const response = await ipc.api('updateRecord')
      if (response.errorCode === 0) {
        success = response.params
      } else {
        ipc.apiSend('message', '新增失败')
      }
    })
    if (success) {
      await this.startQuery()
    }
  }

  async updateRecord(data: any[]) {
    let success = false
    await this.queryLock(async () => {
      const response = await ipc.api('updateRecord', data)
      if (response.errorCode === 0) {
        success = response.params
      } else {
        ipc.apiSend('message', '更新失败')
      }
    })
    if (success) {
      await this.startQuery()
    }
  }

  async deleteRecord(id: number) {
    if ((await ipc.api('confirm', '是否确定删除该记录?')).params === true) {
      let success = false
      await this.queryLock(async () => {
        const response = await ipc.api('deleteRecord', id)
        if (response.errorCode === 0) {
          success = true
        } else {
          ipc.apiSend('message', '删除失败')
        }
      })
      if (success) {
        await this.startQuery()
      }
    }
  }

  async addCondition() {
    await this.queryLock(async () => {
      const response = await ipc.api('addCondition')
      if (response.errorCode === 0) {
        if (response.params !== undefined) {
          const { fieldName, displayName, type }: { fieldName: string, displayName: string, type: 'string' | 'number' } = response.params
          const state = this.state
          state.conditions.push(new AbstractCondition(fieldName, displayName, type, this))
          this.setState(state)
        }
      } else {
        console.error('addCondition failed')
      }
    })
  }

  deleteCondition(condition: AbstractCondition) {
    const state = this.state
    if (state.conditions.indexOf(condition) !== -1) {
      state.conditions.splice(state.conditions.indexOf(condition), 1)
      this.setState(state)
    }
  }

  updateState() {
    this.setState(this.state)
  }

  private async init() {
    await this.queryLock(async () => {
      if (this.state.fields.length === 0) {
        const response = await ipc.api('fields')
        if (response.errorCode === 0) {
          const state: any = this.state
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
    await this.startQuery()
  }

  render() {
    return (
      <div className="div-app">
        <div className="div-main">
          <div className="div-conditions">
            {this.state.conditions.map((c) => c.render())}
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
            updateRecord={this.updateRecord.bind(this)}
            deleteRecord={this.deleteRecord.bind(this)}
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
