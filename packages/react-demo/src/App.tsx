import React, { useRef, useState } from 'react'
import Main from './pages/Main';
import Callback from './pages/Callback';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import { KeekijanaiContext } from 'keekijanai-react';

function App() {
  return (
    <KeekijanaiContext
      clientCoreOptions={{
        route: {
          root: '/api/blog-common',
        },
      }}
      authModalOptions={{
        enableLegacyAuth: true,
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
