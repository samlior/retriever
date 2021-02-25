import React from 'react';
import logo from './logo.svg';
import './App.css';
import { ipc } from './ipc';

declare let electron: any;

let fields: { displayName: string, fieldName: string }[]

function objsToData(objs: any[]) {
  const data: any[][] = []
  for (const obj of objs) {
    const row: any[] = []
    for (const field of fields) {
      row.push(obj[field.fieldName])
    }
    data.push(row)
  }
  return data
}

export class App extends React.Component<any, { table: JSX.Element }>{
  constructor(props: any) {
    super(props)
    this.state = { table: <table></table> }
    this.handleUpdate = this.handleUpdate.bind(this)
    this.makeTable()
  }

  async handleUpdate() {
    let response = await ipc.api('update', [{ field: 'price', value: 100 }, { field: 'name', value: 'wuhu' }])
    response = await ipc.api('update', [{ field: 'price', value: 110 }, { field: 'name', value: 'wuhu2' }])
    response = await ipc.api('query', [/*{ field: 'price', op: 'gte', value: 100 }, { field: 'price', op: 'lte', value: 120 }*/], 5, 0)
    if (response.errorCode === 0) {
      this.makeTable(objsToData(response.params))
    } else {
      console.log('query failed')
    }
  }

  async makeTable(data?: any[][]) {
    if (!fields) {
      const response = await ipc.api('fields')
      if (response.errorCode === 0) {
        fields = response.params
      } else {
        console.error('get fields failed')
        electron.dialog.showErrorBox('错误', '内部通信不可恢复错误!');
        process.exit(1)
      }
    }

    this.setState({
      table: (<table>
        <tr>
          {fields.map((f) => <th>{f.displayName}</th>)}
        </tr>
        {data?.map((row) => <tr>{row.map((ele) => <td>{ele}</td>)}</tr>)}
      </table>)
    })
  }

  render() {
    return (
      <div className="div-app">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <button onClick={this.handleUpdate}>
              update
          </button>
          {this.state.table}
        </header>
      </div>
    )
  }
}
