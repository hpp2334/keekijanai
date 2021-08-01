import React, { useRef, useState } from 'react'
import { Login, Comment, View, Star, ArticleView } from 'keekijanai-react';

export default function Main() {
  const [scope, setScope] = useState('page1');
  const ref = useRef<any>(null);

  return (
    <div className="App">
      <h1>Keekijanai Demo</h1>
      <div>
        <div>current: {scope}</div>
        <input ref={ref} />
        <button onClick={() => setScope(ref.current?.value || '')}>Change scope</button>
      </div>

      <h2>Login</h2>
      <Login />
      <h2>Comment</h2>
      <Comment scope={scope} listMaxHeight={{ main: 400, sub: 200 }} subPageSize={4} />
      <h2>Article</h2>
      <ArticleView scope={scope} where={{ scope }} header='Articles' />
      <h2>View</h2>
      <View scope={scope} />
      {/* <h2>Star</h2>
      <Star scope={scope} /> */}
    </div>
  )
}
