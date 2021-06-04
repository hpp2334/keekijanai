# gatsby-plugin-keekijanai

Keekijanai 的 Gatsby 插件，其实现了两件事：  

1. 调用 `client.updateConfig` 更新配置  
2. 用 `Context` 包裹根元素  


```jsx
// /gatsby-browser.js

import React from 'react'
import { Context, client } from 'keekijanai-react';

export const wrapRootElement = ({ element }, pluginOptions) => {
  const options = { ...pluginOptions };
  delete options.plugins;
  if (Object.keys(options).length > 0) {
    client.updateConfig(options);
  }

  return (
    <Context>
      {element}
    </Context>
  )
}
```