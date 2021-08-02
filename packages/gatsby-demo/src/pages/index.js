import React, { useState, useRef } from "react";
import { Login, Comment, View, Star, ArticleView } from 'keekijanai-react';
import { CodeShow } from '../components/code-show-sources';

export default function IndexPage () {
  const [scope, setScope] = useState('page1');
  const ref = useRef(null);

  return (
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
      <Comment scope={scope} listMaxHeight={{ main: 400, sub: 200 }} subPageSize={4} />
      <h2>Article</h2>
      <ArticleView scope={scope} where={{ scope }} header='Articles' />
      <h2>View</h2>
      <View scope={scope} />
      <h2>Star</h2>
      <Star scope={scope} />
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
  )
}
