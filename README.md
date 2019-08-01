# babel-plugin-react-wrapped-display-name

> 

[![npm version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![codecov][codecov-image]][codecov-url]

Solve problem with unnamed component, which created with arrow function.

## Example

### In

```jsx harmony

export const FancyComponentName = memo(
  ({ name }) => <div>{name}</div>);

```

### Out

```jsx harmony
export const FancyComponentName = memo(
  ({ name }) => <div>{name}</div>);

FancyComponentName.displayName = "Memo(FancyComponentName)";
```

## Installation

```sh
npm install @babel/core babel-plugin-react-wrapped-display-name
```

## Usage

### Via `babel.config.js` (Recommended)

```js
module.exports = (api) => ({
  plugins: [
    'babel-plugin-react-wrapped-display-name',
  ],
});
```

### Via CLI

```sh
babel --plugins babel-plugin-react-wrapped-display-name
```

### Via Node API

```js
require('@babel/core').transform(code, {
  plugins: [
    'babel-plugin-react-wrapped-display-name',
  ],
});
```

## Options

[codecov-image]: https://codecov.io/gh/laiff/babel-plugin-react-wrapped-display-name/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/laiff/babel-plugin-react-wrapped-display-name
[npm-image]: https://img.shields.io/npm/v/babel-plugin-react-wrapped-display-name.svg
[npm-url]: https://www.npmjs.com/package/babel-plugin-react-wrapped-display-name
[travis-image]: https://img.shields.io/travis/laiff/babel-plugin-react-wrapped-display-name.svg
[travis-url]: https://travis-ci.org/laiff/babel-plugin-react-wrapped-display-name
