# babel-plugin-transform-react-jsx-source-to-style

[![npm](https://img.shields.io/npm/v/babel-plugin-transform-react-jsx-source-to-style)](https://www.npmjs.com/package/babel-plugin-transform-react-jsx-source-to-style)

> 为所有 JSX 元素增加 `style['--source-code-location']`。

English | [简体中文](./README.zh-CN.md)

## 示例

**输入**

```
<sometag />
```

**输入**

```
<sometag style={{'--source-code-location': `${__jsxFileName}:${lineNumber}:${columnNumber}`}} />
```

## 安装

使用 npm：

```sh
npm install --save-dev babel-plugin-transform-react-jsx-source-to-style
```

或者使用 yarn：

```sh
yarn add babel-plugin-transform-react-jsx-source-to-style --dev
```

## 使用

### 通过配置文件（推荐）

```json title="babel.config.json"
{
  "plugins": ["babel-plugin-transform-react-jsx-source-to-style"]
}
```

### 通过 CLI

```sh
babel --plugins babel-plugin-transform-react-jsx-source-to-style script.js
```

### 通过 Node API

```js
require("@babel/core").transformSync("code", {
  plugins: ["babel-plugin-transform-react-jsx-source-to-style"],
});
```
