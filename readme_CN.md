# Keekijanai

Keekijanai (ケーキじゃない！) 基于 React，提供了个人博客的通用组件，如 评论功能、点赞功能等。  

**（然而，作者更推荐使用 [Waline](https://waline.js.org/) XD）**

目前支持的平台与功能有（`*` 为无需服务端的功能）：

- Serverless 平台
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

安装 `keekijanai-server`, `keekijanai-react`, `gatsby-plugin`。

```
npm i keekijanai-server keekijanai-react gatsby-plugin
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
    url:    /* Supabase 后台提供的 url */,
    appKey: /* Supabase 后台提供的 private key */,
  },
  services: {
    // 鉴权
    auth: {
      jwtSecret: /* JWT private key 随机字符串 */,
      maxAge:    /* JWT maxAge */,
      oauth2: {
        platforms: {
          // 配置 Github OAuth2
          'github': {
            appID:     /* Github OAuth2 appID */,
            appSecret: /* Github OAuth2 appSecret */
          }
        },
        callback: /* 前端回调页面路径（如 登录成功页） */,
      },
    },
    // 通知
    notify: {
      notifiers: [
        {
          type: 'telegram',
          token:  /* Telegram BOT token */,
          chatID: /* Telegram user chatID */,
        }
      ]
    },
    // 评论
    comment: {
      sensitive: /* 敏感词数组 */,
    }
  }
}

const config = getVercelSupabasePreset(presetConfig);

export default setup(config);
```

### 客户端（Gatsby）

在 `gatsby-config.js` 中加入插件 `gatsby-pllugin-keekijanai`。

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


