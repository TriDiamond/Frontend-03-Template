/**
 * 解析器
 * @filename parser.js
 * @author 三钻
 * @version v1.0.0
 */

const css = require('css');
const layout = require('./layout.js');

var currentToken = null;
var currentAttribute = null;
var currentTextNode = null;

// 默认给予根节点 document
var stack = [{ type: 'document', children: [] }];

var rules = [];
/**
 * 把 CSS 规则暂存到一个数字里
 * @param {*} text
 */
function addCSSRule(text) {
  var ast = css.parse(text);
  rules.push(...ast.stylesheet.rules);
  console.log('Rules', rules);
}

/**
 * 计算选择器的 specificity
 * @param {*} selector
 */
function specificity(selector) {
  var p = [0, 0, 0, 0];
  var selectorParts = selector.split(' ');
  for (var part of selectorParts) {
    if (part.charAt(0) === '#') {
      p[1] += 1;
    } else if (part.charAt(0) === '.') {
      p[2] += 1;
    } else {
      p[3] += 1;
    }
  }
  return p;
}

/**
 * 对比两个选择器的 specificity
 * @param {*} sp1
 * @param {*} sp2
 */
function compare(sp1, sp2) {
  for (var i = 0; i <= 3; i++) {
    if (i === 3) return sp1[3] - sp2[3];
    if (sp1[i] - sp2[i]) return sp1[i] - sp2[i];
  }
}

/**
 * 匹配元素和选择器
 * @param {Object} element 当前元素
 * @param {String} selector CSS 选择器
 */
function match(element, selector) {
  if (!selector || !element.attributes) return false;

  var tagSelector = selector.match(/^[\w]+/gm);
  var idSelectors = selector.match(/(?<=#)([\w\d\-\_]+)/gm);
  var classSelectors = selector.match(/(?<=\.)([\w\d\-\_]+)/gm);

  if (selector.charAt(0) === '#') {
    var attr = element.attributes.filter(attr => attr.name === 'id')[0];
    if (attr && attr.value === selector.replace('#', '')) return true;
  } else if (selector.charAt(0) === '.') {
    var attr = element.attributes.filter(attr => attr.name === 'class')[0];
    if (attr && attr.value === selector.replace('.', '')) return true;
  } else {
    if (element.tagName === selector) return true;
  }

  return false;

  /**
   * 实现复合选择器，实现支持空格的 Class 选择器
   * --------------------------------
   * 如果是 tagName 选择器
   * 1. 先检查 tagName 是否匹配
   *    1.1 检查是否有复合的 ID 选择器，并且是否匹配的
   *    1.2 检测是否有复合的 class 选择器，并且是否匹配
   * 2. 单独的 ID 选择器是否匹配
   * 3. 单独的 class 选择器是否匹配
   */
  // if (tagSelector) {
  //   if (element.tagName !== tagSelector[0]) return false;

  //   if (idSelectors) {
  //     var attr = element.attributes.filter(attr => attr.name === 'id')[0];
  //     if (!attr || (attr && attr.value !== idSelectors.join(' '))) return false;
  //   }

  //   if (classSelectors) {
  //     var attr = element.attributes.filter(attr => attr.name === 'class')[0];
  //     if (!attr || (attr && attr.value !== classSelectors.join(' '))) return false;
  //   }
  // } else if (idSelectors) {
  //   var attr = element.attributes.filter(attr => attr.name === 'id')[0];
  //   if (!attr || (attr && attr.value !== idSelectors.join(' '))) return false;
  // } else if (classSelectors) {
  //   var attr = element.attributes.filter(attr => attr.name === 'class')[0];
  //   if (!attr || (attr && attr.value !== classSelectors.join(' '))) return false;
  // }

  // return true;
}

/**
 * 对元素进行 CSS 计算
 * @param {*} element
 */
function computeCSS(element) {
  var elements = stack.slice().reverse();

  if (!elements.computedStyle) element.computedStyle = {};
  // 这里循环 CSS 规则，让规则与元素匹配
  // 1. 如果当前选择器匹配不中当前元素直接 continue
  // 2. 当前元素匹配中了，就一直往外寻找父级元素找到能匹配上选择器的元素
  // 3. 最后检验匹配中的元素是否等于选择器的总数，是就是全部匹配了，不是就是不匹配
  for (var rule of rules) {
    var selectorParts = rule.selectors[0].split(' ').reverse();

    if (!match(element, selectorParts[0])) continue;

    var matched = false;

    var j = 1;
    for (var i = 0; i < elements.length; i++) {
      if (match(elements[i], selectorParts[j])) j++;
    }

    if (j >= selectorParts.length) matched = true;

    if (matched) {
      var sp = specificity(rule.selectors[0]);
      var computedStyle = element.computedStyle;
      for (var declaration of rule.declarations) {
        if (!computedStyle[declaration.property]) computedStyle[declaration.property] = {};

        if (!computedStyle[declaration.property].specificity) {
          computedStyle[declaration.property].value = declaration.value;
          computedStyle[declaration.property].specificity = sp;
        } else if (compare(computedStyle[declaration.property].specificity, sp) < 0) {
          computedStyle[declaration.property].value = declaration.value;
          computedStyle[declaration.property].specificity = sp;
        }
      }
    }
  }
}

/**
 * 输出 HTML token
 * @param {*} token
 */
function emit(token) {
  // 记录上一个元素 - 栈顶
  var top = stack[stack.length - 1];

  // 如果是开始标签
  if (token.type == 'startTag') {
    var element = {
      type: 'element',
      children: [],
      attributes: [],
    };

    element.tagName = token.tagName;

    // 叠加标签属性
    for (var prop in token) {
      if (prop !== 'type' && prop != 'tagName') {
        element.attributes.push({
          name: prop,
          value: token[prop],
        });
      }
    }

    // 元素构建好之后直接开始 CSS 计算
    computeCSS(element);

    // 对偶操作
    top.children.push(element);
    element.parent = top;
    // 自封闭标签之外，其他都入栈
    if (!token.isSelfClosing) stack.push(element);

    currentTextNode = null;
  } else if (token.type == 'endTag') {
    // 校验开始标签是否被结束
    // 不是：直接抛出错误，是：直接出栈
    if (top.tagName !== token.tagName) {
      throw new Error('Parse error: Tag start end not matched');
    } else {
      // 遇到 style 标签时，执行添加 CSS 规则的操作
      if (top.tagName === 'style') {
        addCSSRule(top.children[0].content);
      }
      layout(top);
      stack.pop();
    }

    currentTextNode = null;
  } else if (token.type === 'text') {
    if (currentTextNode === null) {
      currentTextNode = {
        type: 'text',
        content: '',
      };
      top.children.push(currentTextNode);
    }

    currentTextNode.content += token.content;
  }
}

const EOF = Symbol('EOF'); // EOF: end of file

/**
 * HTML 数据开始阅读状态
 * --------------------------------
 * 1. 如果找到 `<` 就是标签开始状态
 * 2. 如果找到 `EOF` 就是HTML文本结束
 * 3. 其他字符就继续寻找
 * @param {*} char
 *
 * @return {function}
 */
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

/**
 * 标签开始状态
 * ----------------------------------
 * 1. 如果找到 `/` 证明是自关闭标签
 * 2. 如果是字母就是标签名
 * 3. 其他字符就直接继续寻找
 * @param {*} char
 */
function tagOpen(char) {
  if (char === '/') {
    // 自关闭标签
    return endTagOpen;
  } else if (char.match(/^[a-zA-Z]$/)) {
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

/**
 * 标签结束状态
 * --------------------------------
 * 1. 如果是字母就是标签名
 * 2. 如果直接是 `>` 就报错
 * 3. 如果是结束符合，也是报错
 * @param {*} char
 */
function endTagOpen(char) {
  if (char.match(/^[a-zA-Z]$/)) {
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

/**
 * 标签名状态
 * --------------------------------
 * 1. 如果 `\t`(Tab符)、`\n`(空格符)、`\f`(禁止符)或者是空格，这里就是属性的开始
 * 2. 如果找到 `/` 就是自关闭标签
 * 3. 如果是字母字符那还是标签名
 * 4. 如果是 `>` 就是开始标签结束
 * 5. 其他就是继续寻找标签名
 * @param {*} char
 */
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

/**
 * 标签属性名开始状态
 * --------------------------------
 * 1. 如果遇到 `/` 就是自封闭标签状态
 * 2. 如果遇到字母就是属性名
 * 3. 如果遇到 `>` 就是标签结束
 * 4. 如果遇到 `=` 下来就是属性值
 * 5. 其他情况继续进入属性抓取
 * @param {*} char
 */
function beforeAttributeName(char) {
  if (char.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName;
  } else if (char === '/' || char === '>') {
    return afterAttributeName(char);
  } else if (char === '=' || char === EOF) {
    throw new Error('Parse error');
  } else {
    currentAttribute = {
      name: '',
      value: '',
    };
    return attributeName(char);
  }
}

/**
 * 属性名状态
 * @param {*} char
 */
function attributeName(char) {
  if (char.match(/^[\t\n\f ]$/) || char === '/' || char === '>' || char === EOF) {
    return afterAttributeName(char);
  } else if (char === '=') {
    return beforeAttributeValue;
  } else if (char === '\u0000') {
    throw new Error('Parse error');
  } else {
    currentAttribute.name += char;
    return attributeName;
  }
}

/**
 * 属性值开始状态
 * @param {*} char
 */
function beforeAttributeValue(char) {
  if (char.match(/^[\t\n\f ]$/) || char === '/' || char === '>' || char === EOF) {
    return beforeAttributeValue;
  } else if (char === '"') {
    return doubleQuotedAttributeValue;
  } else if (char === "'") {
    return singleQuotedAttributeValue;
  } else if (char === '>') {
    // return data;
  } else {
    return unquotedAttributeValue(char);
  }
}

/**
 * 双引号属性值状态
 * @param {*} char
 */
function doubleQuotedAttributeValue(char) {
  if (char === '"') {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return afterQuotedAttributeValue;
  } else if (char === '\u0000') {
    throw new Error('Parse error');
  } else if (char === EOF) {
    throw new Error('Parse error');
  } else {
    currentAttribute.value += char;
    return doubleQuotedAttributeValue;
  }
}

/**
 * 单引号属性值状态
 * @param {*} char
 */
function singleQuotedAttributeValue(char) {
  if (char === "'") {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return afterQuotedAttributeValue;
  } else if (char === '\u0000') {
    throw new Error('Parse error');
  } else if (char === EOF) {
    throw new Error('Parse error');
  } else {
    currentAttribute.value += char;
    return singleQuotedAttributeValue;
  }
}

/**
 * 引号结束状态
 * @param {*} char
 */
function afterQuotedAttributeValue(char) {
  if (char.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName;
  } else if (char === '/') {
    return selfClosingStartTag;
  } else if (char === '>') {
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken);
    return data;
  } else if (char === EOF) {
    throw new Error('Parse error: eof-in-tag');
  } else {
    throw new Error('Parse error: missing-whitespace-between-attributes');
  }
}

/**
 * 无引号属性值状态
 * @param {*} char
 */
function unquotedAttributeValue(char) {
  if (char.match(/^[\t\n\f ]$/)) {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return beforeAttributeName;
  } else if (char === '/') {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return selfClosingStartTag;
  } else if (char === '>') {
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken);
    return data;
  } else if (char === '\u0000') {
    throw new Error('Parse error');
  } else if (char === '"' || char === "'" || char === '<' || char === '=' || char === '`') {
    throw new Error('Parse error');
  } else if (char === EOF) {
    throw new Error('Parse error');
  } else {
    currentAttribute.value += char;
    return unquotedAttributeValue;
  }
}

/**
 * 属性名结束状态
 * @param {*} char
 */
function afterAttributeName(char) {
  if (char.match(/^[\t\n\f ]$/)) {
    return afterAttributeName;
  } else if (char === '/') {
    return selfClosingStartTag;
  } else if (char === '=') {
    return beforeAttributeValue;
  } else if (char === '>') {
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken);
    return data;
  } else if (char === EOF) {
    throw new Error('Parse error');
  } else {
    currentToken[currentAttribute.name] = currentAttribute.value;
    currentAttribute = {
      name: '',
      value: '',
    };
    return attributeName(char);
  }
}

/**
 * 自封闭标签状态
 * --------------------------------
 * 1. 如果遇到 `>` 就是自封闭标签结束
 * 2. 如果遇到 `EOF` 即使报错
 * 3. 其他字符也是报错
 * @param {*} char
 */
function selfClosingStartTag(char) {
  if (char === '>') {
    currentToken.isSelfClosing = true;
    emit(currentToken);
    return data;
  } else if (char === 'EOF') {
  } else {
  }
}

/**
 * HTTP 解析
 * @param {string} html 文本
 */
module.exports.parseHTML = function (html) {
  var state = data;
  for (var char of html) {
    state = state(char);
  }
  state = state(EOF);

  return stack[0];
};
