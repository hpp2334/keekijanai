import { useEffect, useRef, useState } from 'react';
import { Route, BrowserRouter as Router, useHistory } from 'react-router-dom';
import { Login, Comment, View, Star, Context, useAuth } from '../';
import './App.css';

function Main() {
  const [scope, setScope] = useState('page1');
  const ref = useRef<HTMLInputElement>(null);

  return (
    <div id="root-container">
      <h1>Keekijanai Demo</h1>
      <div>
        <div>current: {scope}</div>
        <input ref={ref} />
        <button onClick={() => setScope(ref.current?.value || '')}>Change scope</button>
      </div>

      <Context>
        <h2>Login</h2>
        <Login />
        <h2>Comment</h2>
        <Comment scope={scope} />
        <h2>View</h2>
        <View scope={scope} />
        <h2>Star</h2>
        <Star scope={scope}></Star>
      </Context>
    </div>
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


export default function App() {
  return (
    <Router>
      <Route exact path='/callback' component={Callback} />
      <Route path='/' component={Main}></Route>
    </Router>
  )
}