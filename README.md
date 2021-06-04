# Keekijanai

Keekijanai (ケーキじゃない！) 基于 React（使用 antd），提供了个人（技术）博客的通用组件，如 评论功能、点赞功能等。  

**（然而，作者更推荐使用 [Waline](https://waline.js.org/) XD）**

目前支持的平台与功能有（`*` 为无需服务端的功能）：  

- 平台（一般是 Serverless 平台）  
  - [Vercel](https://vercel.com/)  
- 存储
  - [Supabase](https://supabase.io/)  
- 功能  
  - 鉴权  
    - OAuth2  
      - Github  
  - 用户  
    - 配置指定管理员  
  - 点赞  
  - 评论  
    - 评论通知  
      - Telegram  
    - 评论回复  
    - 敏感词屏蔽  
  - 阅读量统计  
  - \* 代码展示  

## 安装

假设使用 Vercel + Gatsby + Supabase。  

安装 `keekijanai-server`, `keekijanai-react`, `gatsby-plugin-keekijanai`。

```
npm i keekijanai-server keekijanai-react gatsby-plugin-keekijanai
```

### Serverless Function

新建 Vercel Serverless 函数 `api/API_NAME.ts` （`API_NAME` 为 文件名），以下是一个示例文件。

```ts
// api/API_NAME.ts

import { VercelRequest, VercelResponse } from '@vercel/node';
import { setup } from 'keekijanai-server';
import { getVercelSupabasePreset, VercelSupabasePresetOptions } from 'keekijanai-server/presets/vercel-supabase';

const presetConfig: VercelSupabasePresetOptions = {
  supabase: {
    url: 'https://xxx.supabase.co',
    appKey: 'xxx',
  },
  services: {
    auth: {
      jwtSecret: '123456',
      maxAge: 12 * 60 * 60 * 1000,
      oauth2: {
        platforms: {
          'github': {
            appID: 'xxx',
            appSecret: 'xxx'
          }
        },
        callback: '/callback',
      },
    },
    user: {
      roles: {
        [utils.getUserIDfromOAuth2('github', 'example')]: ['admin'],
      }
    },
  }
}

const config = getVercelSupabasePreset(presetConfig);

export default setup(config);
```

其中 `VercelSupabasePresetOptions` 声明为：  

```ts
export interface VercelSupabasePresetOptions {
  supabase: {
    url: string;
    appKey: string;
  },
  services: {
    auth?: {
      /** an unguessable string */
      jwtSecret: string,
      /** jwt maxAge */
      maxAge?: number;
      oauth2?: {
        /** callback page path in client */
        callback: string,
        platforms?: Record<string, {
          appID: string;
          appSecret: string;
        }>;
      }
    },
    notify?: {
      /**
       * @example
       * notifiers: [
       *   {
       *     type: 'telegram',
       *     token:  '123456' ,
       *     chatID: '123456',
       *   }
       * ]
       */
      notifiers: Array<any>;
    },
    user?: {
      /**
       * @example
       * roles: {
       *   [getUserIDfromOAuth2('provider', 'example_user')]: ['admin']
       * }
       */
      roles?: Record<string, string[] | string | number>;
    },
    comment?: {
      /** comment sentitve words */
      sensitive?: string[];
    }
  }
}
```

### 客户端（Gatsby）

在 `gatsby-config.js` 中加入插件 `gatsby-plugin-keekijanai`。  

```ts
module.exports = {
  plugins: [
    {
      resolve: 'gatsby-plugin-keekijanai',
      options: {
        route: {
          // 指定 API 名，注意将 API_NAME 替换为真正的文件名
          // 此项默认值为 "/api/keekijanai"
          root: '/api/API_NAME'
        }
      }
    },
  ],
}
```

在需要地方引入组件，如：  

```jsx
import { Comment, Login, Star, View  } from 'keekijanai-react';

function Page() {
  const id = window.location.pathname;
  return (
    <div className="my-4">
      <div className="flex justify-end my-2">
        <Login />
      </div>
      <div className="flex items-center justify-between my-2">
        <View scope={id} />
        <Star scope={id} />
      </div>
      <Comment scope={id} />
    </div>
  )
}
```

## 具体包

- [keekijanai-client-core](https://github.com/hpp2334/keekijanai/tree/main/packages/client-core)：客户端 SDK，主要实现需要服务端的部分  
- [keekijanai-react](https://github.com/hpp2334/keekijanai/tree/main/packages/react)：封装 `keekijanai-client-core` 了 React 组件  
- [gatsby-plugin-keekijanai](https://github.com/hpp2334/keekijanai/tree/main/packages/gatsby-plugin)：基于 `keekijanai-client-core`, `keekijanai-react` 封装的 gatsby 插件  
- [keekijanai-server](https://github.com/hpp2334/keekijanai/tree/main/packages/server)：服务端  
- [keekijanai-type](https://github.com/hpp2334/keekijanai/tree/main/packages/type)：服务端与客户端共用的 Typescript 类型  
