import React, { Component } from 'react';
import './App.css';

const defaultStyle = {
    color: '#FFF'
};

class Aggregate extends Component {
    render() {
        return (
            <div style={{...defaultStyle, width: "40%", display: 'inline-block'}}>
                <h2>Number and a text</h2>
            </div>
        );
    }
}

class Filter extends Component {
    render() {
        return (
            <div style={defaultStyle}>
                <img/>
                <input type="text"/>
            </div>
        );
    }
}

class PLaylist extends Component {
    render() {
        return (
            <div style={{...defaultStyle, display: 'inline-block', width: "25%"}}>
                <img />
                <h3>Playlist name</h3>
                <ul>
                    <li>Song 1</li>
                    <li>Song 2</li>
                    <li>Song 3</li>
                </ul>
            </div>
        );
    }
}

class App extends Component {
  render() {
    let headerStyle = {
        color: '#FFF',
        fontSize: '50px'
    }
    return (
      <div className="App">
        <h1 style={headerStyle}>PLaylist</h1>
        <Aggregate />
        <Aggregate />
        <Filter />
        <PLaylist />
        <PLaylist />
        <PLaylist />
      </div>
    );
  }
}

export default App;
