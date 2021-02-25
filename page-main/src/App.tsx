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
    ipc.api('test').then((res) => console.log(res))
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
