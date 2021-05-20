import React, { useEffect, useRef, useState } from 'react';
import { Route, BrowserRouter as Router, useHistory, Switch } from 'react-router-dom';
import { Login, Comment, View, Star, Context, useAuth } from '@';
import { CodeShow } from './code-show-sources';
import './App.css';

function Demo() {
  const [scope, setScope] = useState('page1');
  const ref = useRef<HTMLInputElement>(null);

  return (
    <Context>
      <div id="root-container">
        <h1>Keekijanai Demo</h1>
        <div>
          <div>current: {scope}</div>
          <input ref={ref} />
          <button onClick={() => setScope(ref.current?.value || '')}>Change scope</button>
        </div>

        <h2>Login</h2>
        <Login />
        <h2>Comment</h2>
        <Comment scope={scope} />
        <h2>View</h2>
        <View scope={scope} />
        <h2>Star</h2>
        <Star scope={scope}></Star>
        <h2>CodeShow (Native)</h2>
        <CodeShow
          type='native'
          sourceList={[
            './drag-to-show-innerText.js',
            './drag-to-show-innerText.html',
            './drag-to-show-innerText.css',
          ]}
          entry='./drag-to-show-innerText.native-html.js'
          nameMap={{
            './drag-to-show-innerText.js': 'JS',
            './drag-to-show-innerText.html': 'HTML',
            './drag-to-show-innerText.css': 'CSS',
          }}
        />
        <h2>CodeShow (React)</h2>
        <CodeShow
          sourceList={[
            './simple-drag-list/demo.js',
            './simple-drag-list/drag-list.js',
            './simple-drag-list/drag-line.js',
          ]}
          entry='./simple-drag-list/demo.js'
        />
      </div>
    </Context>
  )
}

function Callback() {
  const auth = useAuth();
  const history = useHistory();

  useEffect(() => {
    setTimeout(() => {
      auth.onCallback(redirect => {
        history.push(redirect || '/');
      });
    }, 5000)
  }, []);

  return (
    <div>
      <h1>Redirect to last page after 5 seconds</h1>
    </div>
  )
}

export function Main() {
  return (
    <Switch>
      <Route exact path='/callback' component={Callback} />
      <Route path='/' component={Demo}></Route>
    </Switch>
  )
}

export default function App() {
  return (
    <Router>
      <Main />
    </Router>
  )
}
