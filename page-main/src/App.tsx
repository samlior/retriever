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
  return data
}

type AppState = {
  fields: { fieldName: string, displayName: string }[],
  data: any[][],
}

export class App extends React.Component<any, AppState>{
  constructor(props: any) {
    super(props)
    this.state = { 
      fields: [],
      data: []
    }
    this.loadFields()
  }

  async startQuery() {
    let response = await ipc.api('update', [{ field: 'price', value: 100 }, { field: 'name', value: 'wuhu' }])
    response = await ipc.api('update', [{ field: 'price', value: 110 }, { field: 'name', value: 'wuhu2' }])
    response = await ipc.api('query', [], 5, 0)
    if (response.errorCode === 0) {
      this.makeTable(objsToData(response.params))
    } else {
      console.log('query failed')
    }
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
          <Table fields={this.state.fields} data={this.state.data} startQuery={this.startQuery.bind(this)}/>
        </div>
      </div>
    )
  }
}
