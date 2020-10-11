/** Crafted by 三钻 **/
/** @website https://tridiamond.tech **/

// 正则表达式
let regexp = /([0-9\.]+)|([ \t]+)|([\r\n]+)|(\*)|(\/)|(\+)|(\-)/g;
// 正则分支名字
let dictionary = ['Number', 'Whitespace', 'LineTerminator', '*', '/', '+', '-'];

// 接下来我们就可以去做 `tokenize`
function* tokenize(source) {
  let result = null;
  let lastIndex = 0;
  while (true) {
    // 每次去取出 lastIndex
    lastIndex = regexp.lastIndex;

    // 使用正则表达式里面的 `exec` 函数，去让它不断的扫描整个原字符里面的内容。
    result = regexp.exec(source);

    // result 里面没有东西就直接退出
    if (!result) break;

    // 与新生成的 lastIndex 去做比较
    // 如果长度超了，那就说明，这里面有我们不认识的字符或者格式
    if (regexp.lastIndex - lastIndex > result[0].length) break;

    // 定义一个 token 变量
    let token = {
      type: null,
      value: null,
    };

    // 如果 result 里面有东西
    // 那我们就根据 result 的位置
    // 从 1 到 7 的范围里面匹配到哪一种输入元素
    //（  首先正则返回的第 0 个是整个结果，所以我们从 1 开始
    //       然后我们的匹配总数一个有 7 个所以是从 1 到 7  ）
    for (let i = 1; i <= dictionary.length; i++) {
      // result 中有值，就存储当前类型
      if (result[i]) token.type = dictionary[i - 1];
    }
    // 这里存储值
    token.value = result[0];
    yield token;
  }

  yield {
    type: 'EOF',
  };
}

for (let token of tokenize('1024 + 10 * 25')) {
  console.log(token);
}
