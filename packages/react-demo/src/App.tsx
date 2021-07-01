import React, { useRef, useState } from 'react'
import Main from './pages/Main';
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
      <Main />
    </KeekijanaiContext>
  )
}

export default App;
