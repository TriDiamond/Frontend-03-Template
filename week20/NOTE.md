- 发布前检查
  - git hooks
    ```javascript
    #!/usr/bin/env node
    let process = require("process")
    console.log('Hello,hooks')

    process.exitCode = 1
    ```
  - eslint
    ```javascript
    #!/usr/bin/env node
    let process = require("process")
    let child_process = require("child_process")
    const { ESLint } = require('eslint');

    function exec(name) {
      return new Promise(function(resolve) {
        child_process.exec(name, resolve)
      })
    }

    (async function main() {
      const eslint = new ESLint({ fix: false })

      await exec("git stash push -k")
      const results = await eslint.lintFiles(["index.js"])
      await exec("git stash pop")

      const formatter = await eslint.loadFormatter("stylish")

      const resultText = formatter.format(results)

      console.log(resultText)
    })().catch((error) => {
      process.exitCode = 1
      console.log('error')
    })
    ```
  - chrome headless
    - alias chrome="/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome"