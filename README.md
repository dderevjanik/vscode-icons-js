# vscode-icons-js

[![Greenkeeper badge](https://badges.greenkeeper.io/dderevjanik/vscode-icons-js.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/dderevjanik/vscode-icons-js.svg?branch=master)](https://travis-ci.org/dderevjanik/vscode-icons-js)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

File specific icons from vscode [vscode-icons](https://github.com/vscode-icons/vscode-icons) extension inspired by [file-icons-js](https://github.com/websemantics/file-icons-js)

## Installation

`npm i vscode-icons-js`

## Usage

```typescript
import { getIconForFile, getIconForFolder, getIconForOpenFolder } from 'vscode-icons-js';

console.log(getIconForFile('main.cpp'));
// file_type_cpp.svg
```

## How to

This lib only displays icons filename based on your input. Additionally, you will need
to download all icons from [vscode-icons](https://github.com/vscode-icons/vscode-icons/tree/master/icons).

## Related

- [vscode-icons](https://github.com/vscode-icons/vscode-icons) extension for vscode
- [github-vscode-icons](https://github.com/dderevjanik/github-vscode-icons) extension for chrome, which shows vscode-icons icons in github repository
