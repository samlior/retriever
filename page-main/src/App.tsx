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
  offset: number
}

export class App extends React.Component<any, AppState>{
  private quering: boolean = false

  constructor(props: any) {
    super(props)
    this.state = { 
      fields: [],
      data: [],
      limit: 10,
      offset: 0
    }
    this.loadFields()
  }

  async startQuery() {
    if (this.quering) {
      return
    }
    this.quering = true
    const response = await ipc.api('query', [], this.state.limit, this.state.offset)
    if (response.errorCode === 1) {
      ipc.apiSend('message', '查询失败')
    } else {
      let state: any = this.state
      state.data = objsToData(response.params, state)
      this.setState(state)
    }
    this.quering = false
  }

  createNewOne() {

  }

  private async loadFields() {
    if (this.state.fields.length === 0) {
      const response = await ipc.api('fields')
      if (response.errorCode === 0) {
        let state: any = this.state
        state.fields = response.params
        this.setState(state)
      } else {
        console.error('get fields failed')
        electron.dialog.showErrorBox('错误', '内部通信不可恢复错误!');
        process.exit(1)
      }
    }
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
            startQuery={this.startQuery.bind(this)}
            createNewOne={this.createNewOne.bind(this)}/>
        </div>
      </div>
    )
  }
}
