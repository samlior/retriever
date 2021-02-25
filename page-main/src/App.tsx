import React from 'react';
import logo from './logo.svg';
import './App.css';
import { ipc } from './ipc';

export class App extends React.Component{
  constructor(props: any) {
    super(props)

    this.handleTest = this.handleTest.bind(this)
  }

  handleTest() {
    ipc.api('update', [{ field: 'price', value: 100 }, { field: 'name', value: 'wuhu' }]).then((response1) => {
      if (response1.errorCode === 0) {
        console.log('update success')
        ipc.api('query', [/*{ field: 'price', op: 'gte', value: 100 }, { field: 'price', op: 'lte', value: 120 }*/], 5, 0).then((response2) => {
          if (response2.errorCode === 0) {
            console.log('query results:', JSON.stringify(response2.params))
          } else {
            console.log('query failed')
          }
        })
      } else {
        console.log('update failed')
      }
    })
  }

  render() {
    return (
      <div className="div-app">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <button onClick={this.handleTest}>
              test
          </button>
        </header>
      </div>
    )
  }
}
