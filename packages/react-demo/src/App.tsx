import React, { useRef, useState } from 'react'
import Main from './pages/Main';
import Callback from './pages/Callback';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import { Login, Comment, View, Star, ArticleView, KeekijanaiContext } from 'keekijanai-react';

function App() {
  const [count, setCount] = useState(0);
  
  return (
    <KeekijanaiContext
      clientCoreOptions={{
        route: {
          root: '/api/blog-common',
        },
      }}
    >
      <Router>
        <Switch>
          <Route path='/callback' component={Callback} />
          <Route path='/' component={Main} />
        </Switch>  
      </Router>
    </KeekijanaiContext>
  )
}

export default App;
