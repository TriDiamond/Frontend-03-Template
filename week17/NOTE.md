本周主要学习了脚手架的生成器 Yeoman、webpack 和 babel 的基础知识。

# 1. Yeoman

一般会把 generator 称为脚手架。而 Yeoman 是在社区中比较流行的脚手架的生成器。使用它可以开发一个初始化项目、创建模板的 generator 工具。

这里通过一个 vue 项目的脚手架生成器 generator-vue，学习了 Yeoman 的 prompts、file system 和 dependencies 的工作方式。

- prompts 用于收集用户输入项
- file system 用用处理文件的复制、生成模板文件等
- dependencies 用户安装项目相关依赖

# 2. webpack

webpack 最初是为 node 设计的一款打包工具，把一个 Node 的代码打包成一个浏览器可用的代码。
webpack 具有 build 能力，同时为开发和发布服务的基础设施。
webpack 是完全针对 js 的一个系统，一定要最后打包出来一个 JS 文件，然后再拿 html 手工地去引用这个 js 文件，这是 webpack 的一个核心思路。webpack 可进行多文件合并。

**webpack 使用方式**
一般要安装两个包 webpack-cli（提供 webpack 命令）和 webpack。安装方式

- 全局安装 webpack-cli 和 webpack，然后使用 webpack 命令
- local 安装，使用 npx webpack 命令

Loaders 可以说是 webpack 的灵魂，一个 loader 你可认为它是一个纯粹的文本转换。

# 3. Babel

完全独立于 webpack 的一个独立系统，用户把新版本的 js 编译成一个老版本的 JS。
更多的时候我们不是独立的使用 babel，而是用 babel-loader，一般会使用@babel/preset-env 和少量的插件配置，后面都会在 webpack 中使用 babel-loader。
