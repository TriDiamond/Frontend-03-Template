# 单元测试工具

> 对大部门开源项目而言，测试工具是重要的一环。在高度服用某一个方法或者库的情况下，测试可以带来很大的效益。

## Mocha

[Mocha](https://mochajs.org/) 是目前比较流行的测试库。安装方法也比较简单：

1、全局安装

```bash
npm install mocha
```

2、本地安装

```bash
npm install --save-dev mocha
```

###  **Mocha** 的简单使用

1、新建空文件夹，然后通过`npm init` 初始化文件夹。

```bash
mkdir test-demo
npm init
```

2、安装**mocha**，如果是全局安装则直接使用命令行`mocha`；如果是本地安装则需要在安装后使用`npx mocha`，或者将`package.json`的`script`下的测试命令改成 **mocha** 。

```json
...
"scripts": {
    "test": "mocha"
  },
...
```

3、新建文件，编写简单函数。由于 **mocha** 一开始针对的是 **Node.js** 的测试，在没有配置 `webpack` 的情况下导出需要使用 `module.exports ` 。

```js
// add.js
function add (a, b) {
  return a + b;
}

module.exports = add;
```

4、根目录下新建 `test/test.js` 文件，然后编写测试代码：

```javascript
var assert = require('assert');

var add = require('../add.js');

// it，describe 都属于描述文字函数
it('1+2 should be 3', function() {
  assert.strictEqual(add(1,2), 3);
});
describe('add function', () => {
  it('-5+2 should be -3', function() {
    assert.strictEqual(add(-5,2), -3); // 新版本 **mocha** 不推荐使用 equal， 推荐使用strictEqual
  });
})

```

### **Mocha** 如何在不配置**webpack**时使用 `import` 语法

1、安装`@babel/core @babel/register `。@babel/register通过 require 钩子（hook）， 将自身绑定到 node 的 `require` 模块上，并在运行时进行即时编译。

```bash
npm i @babel/core @babel/register --save-dev
```

2、安装`@babel/preset-env`，新建`.babelrc`进行配置，兼容新版本 *JavaScript* 语法。

```json
// .babelrc
{
  "presets": ["@babel/preset-env"]
}
```

3、将函数文件中，将导出改为`export`，而`test/test.js` 文件中，则修改为`import`引入：

```javascript
// add.js
export function add (a, b) {
  return a + b;
}
// test/test.js
var assert = require('assert');

import { add } from '../add.js';

it('1+2 should be 3', function() {
  assert.strictEqual(add(1,2), 3);
});
describe('add function', () => {
  it('-5+2 should be -3', function() {
    assert.strictEqual(add(-5,2), -3);
  });
})
```

4、通过`npx mocha --require @babel/register` 或者在`package.json` 中修改：

```json
...  
"scripts": {
  	"test": "mocha --require @babel/register"
},
...
```

## **Code Coverage**

​	**Code Coverage** 表示测试覆盖代码情况。这里我们使用 `nyc` 来进行 code coverage，`nyc` 可以在复杂文件中计算测试覆盖的比率,具体使用步骤如下。

​	1、安装 `nyc` ，然后可以使用`npx nyc ` + 要执行的命令。

```bash
npm i nyc -S-D
npx nyc ./node_modules/bin/mocha --require @babel/register
```

 如何在使用 `babel` 的情况下使用`nyc` :

​	1、首先需要安装 `@istanbuljs/nyc-config-babel`  和 `babel-plugin-istanbul`

```bash
npm i @istanbuljs/nyc-config-babel -S-D
npm i babel-plugin-istanbul -S-D  
```

​	2、配置`.babelrc` 文件，增加插件：

```Javens
{
  "presets": ["@babel/preset-env"],
  "plugins": ["istanbul"]
}
```

​	3、新建`.nycrc` 文件，进行配置：

```
{
  "extends": "@istanbuljs/nyc-config-babel"
}
```

​	4、将命令行配置在`package.json` 中，就可以直接`npm run coverage` 进行测试用例覆盖检测：

```json
...
"scripts": {
    "test": "mocha --require @babel/register",
    "coverage": "nyc mocha"
  },
...
```

## 将测试工具集成到工具链

1、在`generators/app/index.js` 的初始化`package.json` 文件中增加测试工具需要的依赖:

```javascript
 async initPackage() {
   ...
   this.npmInstall([
      ... 
      'mocha',
      'nyc',
      "@babel/core",
      "babel-loader",
      "@babel/preset-env",
      "@babel/register",
      "@istanbuljs/nyc-config-babel",
      "babel-plugin-istanbul",
    ], { 'save-dev': true });
   ...
 }
```

2、增加`.babelrc`和`.nycrc` 文件

```json
// generators/app/templates/.babelrc
{
  "presets": ["@babel/preset-env"],
  "plugins": ["istanbul"]
}
// generators/app/templates/.nycrc
{
  "extends": "@istanbuljs/nyc-config-babel"
}
```

3、在`webpack` 配置文件中，增加对`.js`文件的解析loader：

```javascript
...
module: {
    rules: [
      { test: /\.vue$/, use: 'vue-loader' },
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader'
        ]
      },
      { test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
       }
    ]
  },
   ...
```

4、为`package.json`增加测试、测试覆盖率、打包命令：

```javascript
// generators/app/index.js
async initPackage() {
  ...
  const pkgJson = {
     ...
      "scripts": {
        "build": "webpack",
        "test": "mocha --require @babel/register",
        "coverage": "nyc mocha  --require @babel/register",
      },
      ...
    }
  ...
}
```

5、新建文件夹，运行命令进行测试：

```bash
mkdir testDemo
cd testDemo
yo toolName
npm run build
npm run test
npm run coverage
```

## 对 parser.js 进行测试

1、配置测试环境：编写`.babelrc`和`.nycrc` 文件，增加依赖插件

```
// .babelrc
{
  "presets": ["@babel/preset-env"],
  "plugins": ["istanbul"],
  "sourceMaps": "inline" // sourceMaps 匹配到行
}
```



```
			'mocha',
      'nyc',
      "@babel/core",
      "babel-loader",
      "@babel/preset-env",
      "@babel/register",
      "@istanbuljs/nyc-config-babel",
      "babel-plugin-istanbul"
```

2、编辑`launch.json`，方便测试时进行调试

```json
{
  // Use IntelliSense to learn about possible attributes.
  // Hover to view descriptions of existing attributes.
  // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Program",
      "skipFiles": [
        "<node_internals>/**"
      ],
      "runtimeArgs": [
        "--require", "@babel/register"
      ],
      "sourceMaps": true, // 对测试代码sourceMaps进行匹配
      "args": [

      ],
      "program": "${workspaceFolder}/node_modules/.bin/mocha" // 运行命令时，执行debugger
    }
  ]
}
```

3、通过运行`npm run coverage`，来一一覆盖测试率。

![测试覆盖率](/Users/dn/Documents/myself/Frontend-03-Template/week18/测试覆盖率.jpg)

## 总结

通过测试不但能检测代码的正确性，也能对代码完整度、逻辑完整度进行一个匹配。而测试链的加入，也使得我们工具链更加完善。但是，测试工具本身的更深入使用，需要自行探索，比如对异常的捕获。

