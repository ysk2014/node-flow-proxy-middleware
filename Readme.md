## 基于webpack代理机制的中间件

> 本中间件是对http-proxy-middleware的封装，能够实现webpack的proxy写法

## 安装

```js
npm install --save-dev flow-proxy-middleware
```

## 使用方法

```js
const flowProxyMiddleware = require("flow-proxy-middleware");

cont flowConfig = require("./flow.config.js");

app.use(flowProxyMiddlware(flowConfig.dev.proxy));

```