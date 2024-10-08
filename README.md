# babel-plugin-transform-react-jsx-source-to-style

[![npm](https://img.shields.io/npm/v/babel-plugin-transform-react-jsx-source-to-style)](https://www.npmjs.com/package/babel-plugin-transform-react-jsx-source-to-style)

> Add `style['--source-code-location']` to all JSX Elements.

English | [简体中文](./README.zh-CN.md)

## Example

**In**

```
<sometag />
```

**Out**

```
<sometag style={{'--source-code-location': `${__jsxFileName}:${lineNumber}:${columnNumber}`}} />
```

## Install

Using npm:

```sh
npm install --save-dev babel-plugin-transform-react-jsx-source-to-style
```

or using yarn:

```sh
yarn add babel-plugin-transform-react-jsx-source-to-style --dev
```

## Usage

### With a configuration file (Recommended)

```json title="babel.config.json"
{
  "plugins": ["babel-plugin-transform-react-jsx-source-to-style"]
}
```

### Via CLI

```sh
babel --plugins babel-plugin-transform-react-jsx-source-to-style script.js
```

### Via Node API

```js
require("@babel/core").transformSync("code", {
  plugins: ["babel-plugin-transform-react-jsx-source-to-style"],
});
```
