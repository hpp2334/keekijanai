# keekijanai-react

keekijanai-react 是 Keekijanai 的 React 组件包，基于 antd 与 RxJS。[keekijanai-gatsby-demo 是一个例子](https://github.com/hpp2334/keekijanai/blob/dev/0.0/packages/gatsby-demo/src/pages/index.js)。  

## 组件

### Comment (评论)  

```tsx
export interface CommentProps {
  /** 列表 id，如可取 location.pathname */
  scope: string;
  className?: string;
}
```

### Star (点赞)

```tsx
export interface StarProps {
  /** id，如可取 location.pathname */
  scope: string;
}
```

### View (阅读量)  

```tsx
interface ViewProps {
  /** id，如可取 location.pathname */
  scope: string;
}
```

### Auth (鉴权)

```tsx
export interface LoginProps {
  className?: string;
}
```

### CodeShow (代码展示)

```tsx
export type CodeShowProps = {
  /**
   * type 默认为 "react"，根据 type 决定入口文件导出：
   * - type === "native"：需要入口文件导出 { html, handler }，其中 handler 会被异步调度（通过 useEffect）  
   * - type === "react"：需要入口文件默认导出 ReactNode  
   */
  type?: 'native' | 'react' | undefined;
  /** 获取文件导出，如使用 webpack，可以使用 require.context API */
  getExports: (key: string) => any;
  /** 入口文件 key */
  entry: string;
  /** 获取文件自身内容（即源码），如使用 webpack，可以使用 require.context API 与 raw-loader */
  getRaw: (key: string) => string | { default: string };
  /** 从 key 映射到 name，渲染时标签页名称会使用 name */
  nameMap?: Record<string, string>;
  /** 需要显示源代码的文件的 key 组成的数组 */
  sourceList: string[];
}
```

