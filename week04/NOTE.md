# 浏览器工作原理「三」

上一周我们完成了 CSS 的规则计算，其实就是计算了每个元素匹配中了那些 CSS 规则，并且把这些规则挂载到元素的 ComputedStyle 上面。

这一周我们就要继续我们的浏览器开发之旅，然后我们的下一个目标就是根据浏览器的属性来进行排版（英文是 `Layout`，有时候也翻译成布局）。

![](https://img-blog.csdnimg.cn/20200820232329200.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1RyaURpYW1vbmQ2,size_16,color_FFFFFF,t_70#pic_center)

我们来看看目前我们的浏览器实现到哪里。在一开始的 URL 请求获得 HTML，通过对代码的解析，然后构建 DOM 树，再通过分析 style 中的选择器，接着匹配上元素并且给 DOM 树中的属性加入对应的 ComputedStyles 之后，最后我们拥有一个一颗带有 CSS 的 DOM 树。

最后剩下的两个步骤，就与我们真正的浏览器可以看到的效果越来越接近了。那我们就来一起开始继续实现我们的浏览器吧！

# 排版

## 根据浏览器属性进行排版

在我们开始编写我们的排版逻辑之前，我们是有必要了解一些概念的。

我们的浏览器的排版选择用 `flex` 为例来实现排版算法，至于为什么选择这个排版呢？因为它包含了三代的排版技术。

- **第一代**就是正常流 —— 包含了 `position`， `display`，`flow`；
- **第二代**就是 `flex` —— 这个就比较接近人的自然思维；
- **第三代**就是 `grid` —— 是一种更强大的排版模式；
- "**第四代**"可能是 `Houdini` —— 是一组底层 API，它们公开了 CSS 引擎的各个部分，从而使开发人员能够通过加入浏览器渲染引擎的样式和布局过程来扩展 CSS。

那为什么我们选择了第二代来讲解这一部分呢？那是因为第二代的排版技术比较容易实现，而它的能力又不太差。既然我们只是实现一个模拟浏览器，也就让大家感受一下浏览器中的排版是怎么实现的即可。如果想要实现完成的浏览器排版，那里面的逻辑就非常复杂了，这里就不一一实现了。

![](https://img-blog.csdnimg.cn/20200821002944460.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1RyaURpYW1vbmQ2,size_16,color_FFFFFF,t_70#pic_center)

- 在 flex 排版里面我们有纵排和横排两种，这两种排版方式都是受 flex 属性限制的，所以我们需要在宽高上做抽象
- 排版里面有一个主轴，它是我们排版的时候主要的延伸方向（如果我们有多个元素，这些元素就会往这个主轴的方向排列）
- 跟这个主轴相垂直就有一个交叉轴的方向，所以跟**主轴垂直方向的属性**都叫做**交叉轴属性**
- 所以在 flex 排版，里面我们就需要更具 `flex-direction` 属性去设置主轴的延伸方向，然而交叉轴就是主轴垂直的另外的方向
- 我们根据上面的图，如果 flex-direction 是 `row`， 那么**主轴**的属性就是 `width x left right` 等属性，而**交叉轴**就是：`height y top bottom`等属性；而如果 flex-direction 是 `column` 的时候，就刚好是相反的。
- 根据上面的这个抽象，我们在编写这个排版算法的时候就能去掉大量的 if 和 else 判断
- 这也是一种 web 标准中也采用的一种抽象的描述方式

**好，那么我们开始编写代码，首先讲讲我们的思路**：

- 在开始编写所有的逻辑前，我们这一部分先做一个非常重要的准备工作
- 其实就是帮我们处理掉了 flex-direction 和 wrap 相关的属性
- 这部分的重点就是把具体的 width, height, left, right, top, bottom 等属性给抽象成 main (主轴) 和 cross (交叉轴) 等属性

> **文件**：parser.js 的 `emit` 方法中，找到 `endTag` 的判断，然后在 `stack.pop()` 之前加入 `layout(top)` 函数。因为我们的 `parser.js` 中的代码已经比较多了，所以我们把排班的代码放在 layout.js 中进行编写。这里我们就要在头部引入这个 JavaScript 文件。

```javascript
const layout = require('./layout.js');

/**
 * 输出 HTML token
 * @param {*} token
 */
function emit(token) {
  // 如果是开始标签
  if (token.type == 'startTag') {
    //...
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
      layout(top); // <==== 这里加入 layout 函数
      stack.pop();
    } else if (token.type === 'text') {
      // ...
    }

    currentTextNode = null;
}
```

> **文件**：layout.js

```javascript
/**
 * 预处理元素中的 Style 属性
 * @param {*} element
 */
function getStyle(element) {
  if (!element.style) element.style = {};

  for (let prop in element.computedStyle) {
    let p = element.computedStyle[prop].value.toString();
    element.style[prop] = p;

    // 把 px 单位的数字用 parseInt 转成数字类型
    let pxReg = /(\d+)px$/;
    if (p.match(pxReg)) {
      element.style[prop] = parseInt(p.match(pxReg)[0]);
    }
    // 纯数字的也用 parseInt 转成数字类型
    let numReg = /^\d+$|^\d+\.$|^\d+\.\d+$/;
    if (p.match(numReg)) {
      element.style[prop] = parseInt(p.match(numReg)[0]);
    }
  }

  return element.style;
}

/**
 * 元素排版
 * @param {*} element
 */
function layout(element) {
  // 如果没有 computedStyle 的可以直接跳过
  if (!element.computedStyle) return;
  // 对 Style 做一些预处理
  let elementStyle = getStyle(element);
  // 我们的模拟浏览器只做 flex 布局，其他的跳过
  if (elementStyle.display !== 'flex') return;

  // 过滤掉所有文本节点
  // 为了支持 flex 排班中的排序属性 order
  let items = element.children
    .filter(e => e.type === 'element')
    .sort((a, b) => {
      return (a.order || 0) - (b.order || 0);
    });

  let style = elementStyle;

  // 把所有 auto 和空的宽高变成 null 方便我们后面判断
  ['width', 'height'].forEach(size => {
    if (style[size] === 'auto' || style[size] === '') {
      style[size] = null;
    }
  });

  // 把 flex 排版的关键属性都给予默认值
  if (!style.flexDirection || style.flexDirection === 'auto') style.flexDirection = 'row';
  if (!style.alignItems || style.alignItems === 'auto') style.alignItems = 'stretch';
  if (!style.justifyContent || style.justifyContent === 'auto') style.justifyContent = 'flex-start';
  if (!style.flexWrap || style.flexWrap === 'auto') style.flexWrap = 'nowrap';
  if (!style.alignContent || style.alignContent === 'auto') style.alignContent = 'stretch';

  let mainSize, // 主轴长度
    mainStart, // 主轴开始方向
    mainEnd, // 主轴结束方向
    mainSign, // 主轴标记 +1: 就是叠加，-1: 就是叠减
    mainBase; // 主轴开始值

  let crossSize, // 交叉轴长度
    crossStart, // 交叉轴开始方向
    crossEnd, // 交叉轴结束方向
    crossSign, // 交叉轴标记 +1: 就是叠加，-1: 就是叠减
    crossBase; // 交叉轴开始值

  if (style.flexDirection === 'row') {
    mainSize = 'width';
    mainStart = 'left';
    mainEnd = 'right';
    mainSign = +1;
    mainBase = 0;

    crossSize = 'height';
    crossStart = 'top';
    crossEnd = 'bottom';
  }

  if (style.flexDirection === 'row-reverse') {
    mainSize = 'width';
    mainStart = 'right';
    mainEnd = 'left';
    mainSign = -1;
    mainBase = style.width;

    crossSize = 'height';
    crossStart = 'top';
    crossEnd = 'bottom';
  }

  if (style.flexDirection === 'column') {
    mainSize = 'height';
    mainStart = 'top';
    mainEnd = 'bottom';
    mainSign = +1;
    mainBase = 0;

    crossSize = 'width';
    crossStart = 'left';
    crossEnd = 'right';
  }

  if (style.flexDirection === 'column-reverse') {
    mainSize = 'height';
    mainStart = 'bottom';
    mainEnd = 'top';
    mainSign = -1;
    mainBase = style.height;

    crossSize = 'width';
    crossStart = 'left';
    crossEnd = 'right';
  }

  // 交叉轴反转的时候，直接调换 crossStart 和 crossEnd 的值
  if (style.flexWrap === 'wrap-reverse') {
    let dummy = crossStart;
    crossStart = crossEnd;
    crossEnd = dummy;
    crossSign = -1;
  } else {
    crossBase = 0;
    crossSign = +1;
  }
}

module.exports = layout;
```

## 收集元素进行

收集元素进行，是为了我们后面计算元素而做的准备。因为 flex 布局是把元素放到一行空间里面的，当一行的中所有子元素相加的尺寸超出了父级元素的尺寸时，因为空间不足就会把元素放入下一行里面。所以这里这个步骤就是把元素 “**收集进每一行里面的逻辑**”。

这里要注意的是，flex 排班中还有一个 `no-wrap` 的属性可以控制分行特性的。如果设置了 `no-wrap` 我们收集元素进行时直接强行分配进第一行即可了。但是大部分情况默认都不是 `no-wrap` 的， 所以都是需要我们去动态分行的。

![](https://img-blog.csdnimg.cn/20200822000731775.gif#pic_center)

看到上面的效果中，第一行中首先依次加入元素 1，2，3。当我们加入到第 4 个元素的时候，我们发现元素超出了当前行，所以我们需要建立一个新行，然后把元素 4 放入新的一行中。所以在这个部分的代码逻辑就是这样，以此类推把所有元素按照这个逻辑放入 flex 的行中。接下来我们来看看实际的代码是怎么写的。

> **文件**：layout.js 中的 `layout` 函数

```javascript
/**
 * 元素排版
 * @param {*} element
 */
function layout(element) {
  // ... 上一节的代码忽略 ...
  // 我们在上一部分之后的代码开始写这一部分的代码

  let isAutoMainSize = false;
  // 如果是 auto 或者是空时，就是没有这是尺寸
  // 所以父元素的 flex 行尺寸时根据子元素的总和而定的
  // 也就是说无论子元素有多少，都不会超出第一行，所以全部放入第一行即可
  if (!style[mainSize]) {
    elementStyle[mainSize] = 0;
    for (let i = 0; i < items.length; i++) {
      let item = items[i];
      let itemStyle = getStyle(item);
      if (itemStyle[mainSize] !== null || itemStyle[mainSize] !== 0)
        elementStyle[mainSize] = elementStyle[mainSize] + itemStyle[mainSize];
    }

    isAutoMainSize = true;
  }

  let flexLine = []; // 当前行
  let flexLines = [flexLine]; // 所有 flex 行

  let mainSpace = elementStyle[mainSize]; // 主轴尺寸
  let crossSpace = 0; // 交叉轴尺寸

  for (let i = 0; i < items.length; i++) {
    let item = items[i];
    let itemStyle = getStyle(item);

    if (itemStyle[mainSize] === null) itemStyle[mainSize] = 0;

    // 如果当前元素拥有 flex 属性，那这个元素就是弹性的
    // 无论当前行剩余多少空间都是可以放下的
    if (itemStyle.flex) {
      flexLine.push(item);
    } else if (style.flexWrap === 'nowrap' && isAutoMainSize) {
      mainSpace -= itemStyle[mainSize];
      // 因为 Flex 行的高度取决于行内元素最高的元素的高度，所以这里取行内最好的元素
      if (itemStyle[crossSize] !== null && itemStyle[crossSize] !== void 0)
        crossSpace = Math.max(crossSpace, itemStyle[crossSize]);
      flexLine.push(item);
    } else {
      // 如果子元素主轴尺寸大于父元素主轴尺寸，直接把子元素尺寸压成父元素相同即可
      if (itemStyle[mainSize] > style[mainSize]) itemStyle[mainSize] = style[mainSize];
      // 当前行不够空间放入当前子元素时
      if (mainSpace < itemStyle[mainSize]) {
        flexLine.mainSpace = mainSpace;
        flexLine.crossSpace = crossSpace;
        flexLine = [item];
        flexLines.push(flexLine);
        mainSpace = style[mainSize];
        crossSpace = 0;
      } else {
        flexLine.push(item);
      }
      if (itemStyle[crossSize] !== null && itemStyle[crossSize] !== void 0)
        crossSpace = Math.max(crossSpace, itemStyle[crossSize]);
    }
  }

  flexLine.mainSpace = mainSpace;

  console.log(items);
}
```

## 计算主轴

**计算主轴方向：**

- 找出所有 Flex 元素
- 把主轴方向的剩余尺寸按比例分配给这些元素
- 若剩余空间为负数，所有 flex 元素为 0， 等比例压缩剩余元素

**等比例分配的效果：**

![](https://img-blog.csdnimg.cn/2020082216453684.gif#pic_center)

```javascript
/**
 * 元素排版
 * @param {*} element
 */
function layout(element) {
  // ... 上一节的代码忽略 ...
  // 我们在上一部分之后的代码开始写这一部分的代码

  /**
   * 计算主轴
   */
  if (style.flexWrap === 'nowrap' || isAutoMainSize) {
    flexLine.crossSpace = style[crossSize] !== undefined ? style[crossSize] : crossSpace;
  } else {
    flexLine.crossSpace = crossSpace;
  }

  if (mainSpace < 0) {
    // 等比伸缩比例 = 容器尺寸 / (容器尺寸 + 剩余空间)
    let scale = style[mainSize] / (style[mainSize] + abs(mainSpace));
    // 开始位置
    let currentMain = mainBase;
    for (let i = 0; i < items.length; i++) {
      let item = items[i];
      let itemStyle = getStyle(item);

      // 拥有 flex 属性的不参与等比伸缩
      if (itemStyle.flex) itemStyle[mainSize] = 0;
      // 其他元素都参与等比伸缩
      itemStyle[mainSize] = itemStyle[mainSize] * scale;

      // 元素的开始位置 = currentMain （排列到当前元素时的开始位置）
      itemStyle[mainStart] = currentMain;
      // 元素结束位置 = 元素开始位置 + 方向标志（可能是 + / -）* 元素的尺寸
      itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
      // 下一个元素的开始位置，就是当前元素的结束位置
      currentMain = itemStyle[mainEnd];
    }
  } else {
    flexLines.forEach(items => {
      let mainSpace = items.mainSpace;
      let flexTotal = 0;
      for (let i = 0; i < items.length; i++) {
        let item = items[i];
        let itemStyle = getStyle(item);

        if (itemStyle.flex !== null && itemStyle.flex !== void 0) {
          flexTotal += itemStyle.flex;
          continue;
        }
      }

      if (flexTotal > 0) {
        // 证明拥有 flexible 元素
        // 那就可以把 mainSpace(容器剩余空间) 均匀分配给 flex 元素
        let currentMain = mainBase;
        for (let i = 0; i < items.length; i++) {
          let item = items[i];
          let itemStyle = getStyle(item);
          // 把容器剩余空间，均匀分配给 flex 元素
          if (itemStyle.flex) itemStyle[mainSize] = (mainSpace / flexTotal) * itemStyle.flex;
          // 赋予元素定位
          itemStyle[mainStart] = currentMain;
          itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
          currentMain = itemStyle[mainEnd];
        }
      } else {
        /** 没有找到 flexible 元素
         * 那么 JustifyContent 就可以生效
         * =================================
         * Justify-content 定义：
         * - flex-start:从行首起始位置开始排列
         * - flex-end: 从行尾位置开始排列
         * - center: 居中排列
         * - space-between:均匀排列每个元素，首个元素放置于起点，末尾元素放置于终点
         * - space-around: 均匀排列每个元素，每个元素周围分配相同的空间
         */
        if (style.justifyContent === 'flex-start') {
          let currentMain = mainBase;
          let step = 0;
        }

        if (style.justifyContent === 'flex-end') {
          let currentMain = mainBase + mainSpace * mainSign;
          let step = 0;
        }

        if (style.justifyContent === 'center') {
          let currentMain = mainBase + (mainSign * mainSpace) / 2;
          let step = 0;
        }

        if (style.justifyContent === 'space-between') {
          // 间隔空间 = 剩余空间 / (元素总数 - 1) * 方向表示
          let step = (mainSpace / (items.length - 1)) * mainSign;
          let currentMain = mainBase;
        }

        if (style.justifyContent === 'space-around') {
          let step = (mainSpace / items.length) * mainSign;
          let currentMain = mainBase + step / 2;
        }

        // 给每一个元素分配定位信息
        for (let i = 0; i < items.length; i++) {
          let item = items[i];
          let itemStyle = getStyle(item);

          itemStyle[mainStart] = currentMain;
          itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
          currentMain = itemStyle[mainEnd] + step;
        }
      }
    });
  }
}
```

## 计算交叉轴

这部分我们来计算交叉轴的尺寸，假设我们现在的 flex-direction 属性值是 `row`， 那么我们主轴已经计算出来元素的 `width`，`left` 和 `right`，那么交叉轴我们就算它的 `height`，`top` 和 `bottom`。如果这六个都确定了，这个元素的位置就完全确定了。

**计算交叉轴方向：**

- 根据每一行中最大元素尺寸来计算行高
- 根据行高 flex-align 和 item-align，确定元素具体位置

```javascript
/**
 * 元素排版
 * @param {*} element
 */
function layout(element) {
  // ... 上一节的代码忽略 ...
  // 我们在上一部分之后的代码开始写这一部分的代码

  /**
   * =================================
   * 计算交叉轴
   * =================================
   */
  let crossSpace;

  if (!style[crossSize]) {
    // 没有定义行高，叠加每一个 flex 行的高度做为行高
    crossSpace = 0;
    elementStyle[crossSize] = 0;
    for (let i = 0; i < flexLines.length; i++) {
      elementStyle[crossSize] = elementStyle[crossSize] + flexLines[i].crossSpace;
    }
  } else {
    // 如果有定义行高，那就用叠减每一个 flex 行的高度获取剩余行高
    crossSpace = style[crossSize];
    for (let i = 0; i < flexLines.length; i++) {
      crossSpace -= flexLines[i].crossSpace;
    }
  }

  // 根据 flex align 属性来分配行高
  if (style.flexWrap === 'wrap-reverse') {
    crossBase - style[crossSize];
  } else {
    crossBase = 0;
  }

  // 获取每一个 flex 行的尺寸
  let lineSize = style[crossSize] / flexLines.length;

  // 根据 alignContent 属性来矫正 crossBase 值
  let step;
  if (style.alignContent === 'flex-start' || style.alignContent === 'stretch') {
    crossBase += 0;
    step = 0;
  }

  if (style.alignContent === 'flex-end') {
    crossBase += crossSign * crossSpace;
    step = 0;
  }

  if (style.alignContent === 'center') {
    crossBase += (crossSign * crossSpace) / 2;
    step = 0;
  }

  if (style.alignContent === 'space-between') {
    crossBase += 0;
    step = crossSpace / (flexLines.length - 1);
  }

  if (style.alignContent === 'space-around') {
    step = crossSpace / flexLines.length;
    crossBase += (crossSigh * step) / 2;
  }

  flexLines.forEach(items => {
    let lineCrossSize =
      style.alignContent === 'stretch'
        ? items.crossSpace + crossSpace / flexLines.length
        : items.crossSpace;

    for (let i = 0; i < items.length; i++) {
      let item = items[i];
      let itemStyle = getStyle(item);

      let align = itemStyle.alignSelf || style.alignItems;

      if (itemStyle[crossSize] === null)
        itemStyle[crossSize] = align === 'stretch' ? lineCrossSize : 0;

      if (align === 'flex-start') {
        itemStyle[crossStart] = crossBase;
        itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize];
      }

      if (align === 'flex-end') {
        itemStyle[crossStart] = crossBase + crossSign * lineCrossSize;
        itemStyle[crossEnd] = itemStyle[crossEnd] - crossSign * itemStyle[crossSize];
      }

      if (align === 'center') {
        itemStyle[crossStart] =
          crossBase + (crossSign * (lineCrossSize - itemStyle[crossSize])) / 2;
        itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize];
      }

      if (align === 'stretch') {
        itemStyle[crossStart] = crossBase;
        itemStyle[crossEnd] =
          crossBase +
          crossSign *
            (itemStyle[crossSize] !== null && itemStyle[crossSize] !== void 0
              ? itemStyle[crossSize]
              : items.crossSpace);
        itemStyle[crossSize] = crossSign * (itemStyle[crossEnd] - itemStyle[crossStart]);
      }
    }
    crossBase += crossSign * (lineCrossSize + step);
  });
}
```

## 服务端代码

为了可以使用我们浏览器中的 flex 排版，我们需要对我们服务端代码中的 HTML 进行一些修改：

```javascript
const http = require('http');

http
  .createServer((request, response) => {
    let body = [];
    request
      .on('error', err => {
        console.error(err);
      })
      .on('data', chunk => {
        body.push(chunk);
      })
      .on('end', () => {
        body = Buffer.concat(body).toString();
        console.log('body', body);
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end(
          `<html class=a>
  <head>
    <style>
      #container {
        width: 500px;
        height: 300px;
        display: flex;
      }
      #container #myid {
        width: 200px;
      }
      #container .c1 {
        flex: 1;
      }
    </style>
  </head>
  <body>
      <div id="container">
        <img id="myId" />
        <div class="c1"/>
      </div>
  </body>
</html>`
        );
      });
  })
  .listen(8080);

console.log('server started');
```

# 渲染

这里就是浏览器原理的最后一个步骤了。浏览器工作原理中，我们从 URL 发起 HTTP 请求，然后通过解析 HTTP 获得 HTML 代码。通过解析 HTML 代码构建了 DOM 树，然后通过分析 style 属性和选择器匹配给 DOM 树上加上 CSS 属性。上一步我们通过分析每个元素的 CSS 属性来技术排版信息。

到了这里我们只要完成 “绘制” 我们就已经把整个完成的浏览器渲染流程走完了。当然浏览器肯定还有很多其他的功能，而且它会有持续的绘制和事件监听。我们这里的模拟浏览器就只做到绘制为止。

在编写绘制的代码之前，我们需要准备一下环境的。在我们的模拟浏览器当中，我们用绘制图片代替了真正浏览器的绘制屏幕。在 node.js 当中是没有自带的图形绘制的功能的。所以这里我们用 `images` 包来代替。

安装：

```shell
npm install images --save
```

> 包的 npm 地址：https://npmjs.com/package/images

## 绘制单个元素

在实现绘制之前，我们要给 server.js 中的 HTML 代码加上一些属性：

```javascript
const http = require('http');

http
  .createServer((request, response) => {
    let body = [];
    request
      .on('error', err => {
        console.error(err);
      })
      .on('data', chunk => {
        body.push(chunk);
      })
      .on('end', () => {
        body = Buffer.concat(body).toString();
        console.log('body', body);
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end(
          `<html class=a>
  <head>
    <style>
      #container {
        width: 500px;
        height: 300px;
        display: flex;
        background-color: rgb(255,255,255);
      }
      #container #myid {
        width: 200px;
        height: 100px;
        background-color: rgb(255,0,0);
      }
      #container .c1 {
        flex: 1;
        background-color: rgb(0,0,255);
      }
    </style>
  </head>
  <body>
      <div id="container">
        <img id="myId" />
        <div class="c1"/>
      </div>
  </body>
</html>`
        );
      });
  })
  .listen(8080);

console.log('server started');
```

> - 上面我们给 `#container` 加上了 `background-color: rgb(255,255,255)`
> - 给 `#container #mid` 加上了 `height: 100px` 和 `background-color: rgb(255,0,0)`
> - 给 `#container .c1` 加上了 `background-color: rgb(0,0,255)`

**逻辑思路**：

- 绘制需要依赖一个图形环境
- 这里我们采用了 npm 包 images
- 绘制一个 viewport 上进行
- 与绘制相关的属性： background-color、border、background-image 等
- 如果我们想做 gradient 这种更复杂的绘制的话就需要依赖 webGL 了

> 首先在 `client.js` 中的请求方法里常见 `viewport`，并且调用 `render` 函数来渲染。

```javascript
// 记得引入 render 和 images
const render = require('./render.js');
const images = require('images');

/**
 * 请求方法
 */
void (async function () {
  let request = new Request({
    method: 'POST',
    host: '127.0.0.1',
    port: '8080',
    path: '/',
    headers: {
      ['X-Foo2']: 'custom',
    },
    body: {
      name: 'tridiamond',
    },
  });

  let response = await request.send();

  let dom = parser.parseHTML(response.body);

  let viewport = images(800, 600);

  // 这里我们传入我们 id = c1 的元素进行渲染
  render(viewport, dom.children[0].children[3].children[1].children[3]);

  viewport.save('viewport.png');
})();
```

> 然后我们来实现 `render.js`

```javascript
const images = require('images');

function render(viewport, element) {
  if (element.style) {
    let img = images(element.style.width, element.style.height);

    if (element.style['background-color']) {
      let color = element.style['background-color'] || 'rgb(0, 0, 0)';
      color.match(/rgb\((\d+), (\d+), (\d+)\)/);
      img.fill(Number(RegExp.$1), Number(RegExp.$2), Number(RegExp.$3));
      viewport.draw(img, element.style.left || 0, element.style.top || 0);
    }
  }
}

module.exports = render;
```

> 用 debug 或者 node 执行我们的 client.js 后，会在当前目录中看到 `viewport.png`，然后图片的效果如下：

![](https://img-blog.csdnimg.cn/20200822221941143.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1RyaURpYW1vbmQ2,size_16,color_FFFFFF,t_70#pic_center)

## 渲染 DOM

上一部分我们完成了单个元素的绘制，但是其实我们想从单个元素的绘制进行到 DOM 绘制的话，难度其实不难，我们只需要递归的调用 render 函数就可以完成整个 DOM 的绘制了。

思路：

- 递归调用子元素的绘制方法完成 DOM 树的绘制
- 忽略一些不需要绘制的节点
- 实际浏览器中，文字绘制是难点，需要依赖字体库，我们这里忽略了
- 实际浏览器中，还会对一些图层做 compositing，我们这里也忽略了

我们来看看代码怎么实现的：

> 首先我们把 `client.js` 中的 `render` 函数的参数改为 dom

```javascript
/**
 * 请求方法
 */
void (async function () {
  let request = new Request({
    method: 'POST',
    host: '127.0.0.1',
    port: '8080',
    path: '/',
    headers: {
      ['X-Foo2']: 'custom',
    },
    body: {
      name: 'tridiamond',
    },
  });

  let response = await request.send();

  let dom = parser.parseHTML(response.body);

  let viewport = images(800, 600);

  // 这里我们传入我们 id = c1 的元素进行渲染
  render(viewport, dom);

  viewport.save('viewport.jpg');
})();
```

> 然后修改 `render.js`中的代码

```javascript
const images = require('images');

function render(viewport, element) {
  if (element.style) {
    let img = images(element.style.width, element.style.height);

    if (element.style['background-color']) {
      let color = element.style['background-color'] || 'rgb(0, 0, 0)';
      color.match(/rgb\((\d+), (\d+), (\d+)\)/);
      img.fill(Number(RegExp.$1), Number(RegExp.$2), Number(RegExp.$3));
      viewport.draw(img, element.style.left || 0, element.style.top || 0);
    }
  }

  if (element.children) {
    for (let child of element.children) {
      render(viewport, child);
    }
  }
}

module.exports = render;
```

最后我们得出的一个渲染结果如下图：

![](https://img-blog.csdnimg.cn/20200822222721694.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1RyaURpYW1vbmQ2,size_16,color_FFFFFF,t_70#pic_center)

# 最后

到这里我们浏览器的实现就到此告一段落了。各位同学，如果大家跟着这个文章做到这里，我们都已经实现了浏览器的全部流程都实现了。从开始的 URL，获取到 HTML，再从 HTML 代码又把它变成一个课 DOM 树。再把这个什么都没有的 DOM 树加上了 CSS 的属性。然后我们把所有这些 CSS 属性的计算出来找到每个元素的位置。最后我们在一张图片上把网页的内容画了出来。这个过程已经是一个浏览器从一个 URL 到呈现在页面上的一个整体过程了。

通过这个实战，我们应该都对浏览器的整个工作原理有一个更深和感知的理解。在实现这个浏览器的过程中，我们还是采用了很多比较省略的实现方法，如果同学们想真正的去理解浏览器的话，那么还是有很长的路要走。但是还是希望大家在这个实战的过程有一定的收获的。
