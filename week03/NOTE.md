/\*\*

- 解析器
- @filename parser.js
- @author 三钻
- @version v1.0.0
  \*/

let currentToken = null;

/\*\*

- 输出 HTML token
- @param {_} token
  _/
  function emit(token) {
  console.log(token);
  }

const EOF = Symbol('EOF'); // EOF: end of file

/\*\*

- HTML 数据开始阅读状态
- ***
- 1.  如果找到 `<` 就是标签开始状态
- 2.  如果找到 `EOF` 就是 HTML 文本结束
- 3.  其他字符就继续寻找
- @param {\*} char
-
- @return {function}
  \*/
  function data(char) {
  if (char === '<') {
  // 标签开始
  return tagOpen;
  } else if (char === EOF) {
  // 文本结束
  emit({
  type: 'EOF',
  });
  return;
  } else {
  // 文本
  emit({
  type: 'text',
  content: char,
  });
  return data;
  }
  }

/\*\*

- 标签开始状态
- ***
- 1.  如果找到 `/` 证明是自关闭标签
- 2.  如果是字母就是标签名
- 3.  其他字符就直接继续寻找
- @param {_} char
  _/
  function tagOpen(char) {
  if (char === '/') {
  // 自关闭标签
  return endTagOpen;
  } else if (char.match(/^[a-zA-Z]\$/)) {
  // 标签名
  currentToken = {
  type: 'startTag',
  tagName: '',
  };
  return tagName(char);
  } else {
  return;
  }
  }

/\*\*

- 标签结束状态
- ***
- 1.  如果是字母就是标签名
- 2.  如果直接是 `>` 就报错
- 3.  如果是结束符合，也是报错
- @param {_} char
  _/
  function endTagOpen(char) {
  if (char.match(/^[a-zA-Z]\$/)) {
  currentToken = {
  type: 'endTag',
  tagName: '',
  };
  return tagName(char);
  } else if (char === '>') {
  // 报错 —— 没有结束标签
  } else if (char === EOF) {
  // 报错 —— 结束标签不合法
  }
  }

/\*\*

- 标签名状态
- ***
- 1.  如果 `\t`(Tab 符)、`\n`(空格符)、`\f`(禁止符)或者是空格，这里就是属性的开始
- 2.  如果找到 `/` 就是自关闭标签
- 3.  如果是字母字符那还是标签名
- 4.  如果是 `>` 就是开始标签结束
- 5.  其他就是继续寻找标签名
- @param {_} char
  _/
  function tagName(char) {
  if (char.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName;
  } else if (char === '/') {
    return selfClosingStartTag;
  } else if (char.match(/^[a-zA-Z]$/)) {
  currentToken.tagName += char;
  return tagName;
  } else if (char === '>') {
  emit(currentToken);
  return data;
  } else {
  return tagName;
  }
  }

/\*\*

- 标签属性状态
- ***
- 1.  如果遇到 `/` 就是自封闭标签状态
- 2.  如果遇到字母就是属性名
- 3.  如果遇到 `>` 就是标签结束
- 4.  如果遇到 `=` 下来就是属性值
- 5.  其他情况继续进入属性抓取
- @param {_} char
  _/
  function beforeAttributeName(char) {
  if (char === '/') {
  return selfClosingStartTag;
  } else if (char.match(/^[\t\n\f ]\$/)) {
  return beforeAttributeName;
  } else if (char === '>') {
  emit(currentToken);
  return data;
  } else if (char === '=') {
  return beforeAttributeName;
  } else {
  return beforeAttributeName;
  }
  }

/\*\*

- 自封闭标签状态
- ***
- 1.  如果遇到 `>` 就是自封闭标签结束
- 2.  如果遇到 `EOF` 即使报错
- 3.  其他字符也是报错
- @param {_} char
  _/
  function selfClosingStartTag(char) {
  if (char === '>') {
  currentToken.isSelfClosing = true;
  emit(currentToken);
  return data;
  } else if (char === 'EOF') {
  } else {
  }
  }

/\*\*

- HTTP 解析
- @param {string} html 文本
  \*/
  module.exports.parseHTML = function (html) {
  let state = data;
  for (let char of html) {
  state = state(char);
  }
  state = state(EOF);
  };
