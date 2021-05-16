import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { Main } from '../../example/App';
import React from 'react';

function App() {
  return (
    <StaticRouter>
      <Main />
    </StaticRouter>
  )
}

ReactDOMServer.renderToString(<App />);
console.log('render to string without error');
