var Generator = require('yeoman-generator');

module.exports = class extends Generator {
  // The name `constructor` is important here
  constructor(args, opts) {
    super(args, opts);
    this.projectInfo = Object.create(null);
  }
  async initPackage() {
    let answers = await this.prompt([
      {
        type: "input",
        name: "name",
        message: "Please input your project name",
        default: this.appname // Default to current folder name
      }
    ])
    const pkgJson = {
      "name": answers.name,
      "version": "1.0.0",
      "description": "",
      "main": "index.js",
      "scripts": {
        "build": "webpack",
        "test": "mocha --require @babel/register",
        "coverage": "nyc mocha  --require @babel/register",
      },
      "author": "",
      "license": "ISC",
      "devDependencies": {

      },
      "dependencies": {
        
      }
    }
    this.projectInfo = answers;
    this.fs.extendJSON(this.destinationPath('package.json'), pkgJson);
    this.npmInstall(['vue'], { 'save-dev': false });
    this.npmInstall([
      'webpack',
      'webpack-cli',
      'copy-webpack-plugin',
      'vue-loader',
      'vue-style-loader', 
      'css-loader',
      'vue-template-compiler', 
      'mocha',
      'nyc',
      "@babel/core",
      "babel-loader",
      "@babel/preset-env",
      "@babel/register",
      "@istanbuljs/nyc-config-babel",
      "babel-plugin-istanbul",
    ], { 'save-dev': true });
  }
  copyFiles() {
    this.fs.copyTpl(
      this.templatePath('.babelrc'),
      this.destinationPath('.babelrc'),
      {}
    );
    this.fs.copyTpl(
      this.templatePath('.nycrc'),
      this.destinationPath('.nycrc'),
      {}
    );
    this.fs.copyTpl(
      this.templatePath('sample-test.js'),
      this.destinationPath('test/sample-test.js'),
      {}
    );
    this.fs.copyTpl(
      this.templatePath('HelloWorld.vue'),
      this.destinationPath('src/HelloWorld.vue'),
      {}
    );
    this.fs.copyTpl(
      this.templatePath('webpack.config.js'),
      this.destinationPath('webpack.config.js'),
      {}
    );
    this.fs.copyTpl(
      this.templatePath('main.js'),
      this.destinationPath('src/main.js'),
      {}
    );
    this.fs.copyTpl(
      this.templatePath('index.html'),
      this.destinationPath('src/index.html'),
      {title: this.projectInfo.name}
    );
  }
};
