学习笔记# 重学 CSS

进入重学 CSS 的第一步，首先需要找到一些线索。我们在前面的课程中讲学习方法的部分也讲过，要想建立知识体系骨架，我们需要一个完备性更权威，更全的线索。但是 CSS 现在标准的状态非常复杂，所以我们没有办法找到一份像 JavaScript 或者 HTML 中比较完备的现形标准，能把 CSS 的一切都浓缩在内。

不过这种情况也是我们平时学习知识的一种常态，知识并不是有人给我们总结好一本书，或者能有一个地方包含了所有的知识。一般来说知识都会分布在各种不同的文档当中。

> 根据 Winter 老师比较喜欢学习一个线索，凡是对于编程语言，都会先从它的语法去了解它。

所以 CSS 也不例外，它也有自己的一套语法体系。但是 CSS 标准是分散开的，我们想找到它完整的语法时非常的不容易的。所以我们这里先从 CSS 2.1 语法标准开始。

# CSS 2.1 语法标准

CSS 2.1 确实是一个比较老的版本了，但是它有一个好处，在 2.1 的版本的时候建立了一个 Snapshot，也就是说没有其他版本去替代它。所以 CSS 2.1 的 Grammar Summary 部分是当时一个比较完整的一份语法列表。

当然现在我们已经大量的引入了 CSS3 了，所以这里面会有一些语法差异和不全。但是总体来讲是一个不错的起点，让我们可以先开始认识 CSS 的语法基础。

这里的语法是使用 “**产生式**” 来表达的。但是这里会有一些 CSS 中特别的表达方式和标准：

- `[ ]` —— 方括号代表组的概念
- `?` —— 问号代表可以存在和不存在
- `|` —— 单竖线代表 “或” 的意思
- `*` —— 星号代表 0 个或 多个

## CSS 总体结构

- @charset
- @import
- rules —— 多个规则，这里面的规则没有顺序要求
  - @media
  - @page
  - rule —— 这里基本上就是我们平时写的 CSS 样式规则部分

> 我们平时写都是在写普通的 CSS 规则，`charset` 我们基本都不会用，一般我们都会用 `UTF-8`。

这里讲到的是 CSS 2.1 的 CSS 结构，在 CSS3 中我们有更多的 `@` 规则 和 CSS 规则，我们首先要在 CSS3 中找到这两块的所有内容，然后补充道这个总体结构中，那么我们就可以形成 CSS 的总体结构。这时候我们对 CSS 的语法认识就有完备性了。

# CSS @ 规则研究

`@charset`: https://www.w3.org/TR/css-syntax-3/

- 在 CSS syntax 3 中在 CSS 2.1 中做了一个重新的定义
- 但是相对 CSS 2.1 基本没有什么变化

`@import`: https://www.w3.org/TR/css-cascade-4/

- 然后 import 就在 css cascade 4 的规范里面
- 因为 CSS 的全称就是 Cascade Style Sheet（级联表）
- 所以 import 属于级联规则之一

`@media`: https://www.w3.org/TR/css3-conditional/

- Media 不是在我们的 media query 标准里
- 它在 CSS3 的 conditional 标准里
- 但是在 media 的 conditional 标准中又去引用了 media query，规定了 media 后面的一部分的查询规则
- 所以我们常常去讲 media query 是一个新特性，其实它并不是，它是类似一个预置好的函数的一个规范
- 真正把 Media 特性真正引入到 CSS3 当中，是通过 CSS3 中的 conditional 标准
- 那么 Conditional，就是 “有条件的”，顾名思义就是用来控制一些规则在有效条件下才会生效

` @page`: https://www.w3.org/TR/css-page-3/

- page 是有一份单独的 CSS3 标准来表述它
- 就是 css page 3 它主要是给我们需要打印的页面所使用的
- 理论上这个叫做分页媒体，其实主要的分页媒体就是打印机
- 我们的页面是不会有分页的

`@counter-style`: https://www.w3.org/TR/css-counter-styles-3/

- 我们平时写列表的时候会有一个 counter
- 也就是列表最前面的那个 “小黑点” 或者是 “小数字”

`@keyframes`: https://www.w3.org/TR/css-animations-1/

- keyframes 是用于我们的动画效果定义的

`@fontface`: https://www.w3.org/TR/css-fonts-3/

- fontface 就是我们使用 web font 功能时候用到的
- 它可以用来定义一切字体
- 由此延伸出一个技巧叫 Icon font

`@supports`: https://www.w3.org/TR/css3-conditional/

- 这个同样是来自于 conditional 的标准
- 它是用来检查某些 CSS 的功能是否存在的
- supports 是一个比较尴尬的存在，自己就是隶属于 CSS3，所以它本身是有兼容性问题的导致没办法用
- 所以现在基本上不推荐使用 support 来检查 CSS 兼容性
- 因为我们检查的那个属性，比我们 support 这个规则兼容性要更好，所以根本检查不了
- 估计可能 4 ～ 5 年后，CSS 新出来的新特性我们再用 support 来检查会更好一点

`@namespace`: https://www.w3.org/TR/css-namespaces-3/

- 现在 HTML 里面除了 HTML 命名空间，还引入了 SVG、MathML 等这样的其他的命名空间的标记和标签
- 所以 CSS 里面有了对应的设施，其实主要是 一个完备性的考量，并不是一个特别重要的规则

> 这里不是完整的列表，还有 3 个规则，因为 它们本身状态太年轻在讨论状态，要不就是已经没有浏览器支持了，或者是已经被废弃了。分别有 `document`、`color-profile`、`font-feature`。
>
> **然后最常用的有三种：**`@media`、`@keyframes`、`@fontface`

# CSS 规则结构

这里我们选中了 HTML 所有的 DIV 并且给予它们一个 `blue` 的背景颜色。

```css
div {
  background-color: blue;
}
```

> 通过以上代码示例，我们看到一段 CSS 代码是有分为 `选择器` 和 `声明` 两部分的。在我们《实战中理解浏览器原理》的文章中，我们编写我们的 `CSS parsor` 的时候，就是把 CSS parse 成 selector 部分和 declaration 部分。我们这里也会按照这个方法来理解 CSS 规则。

- 选择器 —— selector (`div`)
- 声明 —— declaration
  - Key —— 键 (`background-color`)
  - Value —— 值 (`blue`)

## CSS 规则标准

### Selector 选择器

- **Level 3** —— https://www.w3.org/TR/selectors-3/
  - Selectors_group —— 选择器组：用逗号分隔
  - Selector —— 选择器：需要用 combinator (组合器) 把多个简单选择器拼在一起的
  - Combinator —— 组合器：`+`、`>`、`~`、`空格`
  - Simple_selector_sequence —— 简单选择器：`类型选择器`、`*` 一定会在最前面，然后可以是 `ID`、`class`、`attr`、`pseudo`等选择器
- **Level 4** —— https://www.w3.org/TR/selectors-4/
  - Level 4 和 Level 3 是非常的相似的，但是它的选择器更复杂
  - 增加了很多的伪类选择器、“或” 和 “与” 的关系
  - 而且它的 NOT 也更强大
  - Level 4 的话我们看一看拓展思路就可以了，因为从 2018 年 12 月 开始也没有再更新了
  - 所以目测是遇到问题了，处于比较难推动的阶段，所以投入使用还有很漫长的路要走

### Key

- Properties ｜性质
- Variables ｜ CSS 变量—— https://www.w3.org/TR/css-variables/
  - 可以声明一个双减号开头的变量：`--main-color: #06c`
  - 然后我们可以在子元素中使用这些 CSS 变量了 `color: var(--main-color)`
  - 可以跟其他的函数进行嵌套：`--accent-background: linear-gradient(to top, var(--main-color), white);`
  - 使用 `var()` 函数的时候是可以给默认值的，传入第二个参数就是默认值：`var(--main-color, black)`
  - CSS 变量处理可以用作 value，还可以用作 key：先声明了`--side: margin-top` 然后就可以这样使用 `var(--side): 20px`

### Value

- Level 4 —— https://www.w3.org/TR/css-values-4/
  - 它也是 working draft (工作草稿) 状态，但是实现状态非常的好
  - 而且这个版本一直有保持更新，最后一次更新是 2019 年 1 月份
  - 数字类型有：`整型`、`百分比`、`浮点型`还有`带维度 (Dimensions)`
  - 长度单位有：`相对单位 (em, ex, cap, ch ... )`、`视口单位 (vw, vh, vi, vb, vmin, vmax)`、`绝对单位 (cm, mm, Q, in, pt, pc px)`
  - 其他单位：`弧度单位 (deg, grad, rad, turn)`、`时间单位 (s, ms)`、`频率单位 (Hz, kHz)`、`分辨率单位 (dpi, dpcm, dppx)`
  - 数据类型：`颜色 <color>`、`图片 <image>`、`2D 位置 <position>` 等类型
  - 函数：`计算 cal()`、`最小值 min()`、`最大值 max()` 、`范围剪切 clamp()`、`切换value toogle()`、`属性引用 attr()`

# 使用爬虫收集整套 CSS 标准

通过上面讲到的几个部分，我们已经了解了整个 CSS 的架构。但是我们发现整个的 CSS 标准是散落在几份标准当中的，为了我们更好的阅读标准，我们想拿到一份比较完整的标准列表是需要我们做一些工作的。很多时候我们都是需要在零散的标准里面，去搜集一些共性的内容。

> 接下来我们来做一个小实验，通过类似爬虫的方法，在 W3C 网站上抓取标准的内容。然后我们对他进行一些处理，方便我们后续的一些工作。

首先我们打开 W3C 的标准和草稿的列表页：https://www.w3.org/TR/

这里我们可以看到所有的 W3C 的标准和草稿，但是这里我们只需要 CSS 部分的。如果我们检查元素中查看，我们可以看到其实所有的数据都已经挂载在 DOM 上了，只是前端做了筛选分页而已。

所以我们就可以用一段代码，直接复制到浏览器的 `console` 中运行就可以筛选出所有 CSS 相关的文章列表了。

```javascript
// 获取 CSS 相关的标准列表
JSON.stringify(
  Array.prototype.slice
    .call(document.querySelector('#container').children)
    .filter(e => e.getAttribute('data-tag').match(/css/)) // 找到有 CSS tag 的
    .map(e => ({ name: e.children[1].innerText, url: e.children[1].children[0].href })) // 只获取标题名字和链接
);
```

最终输入的内容如下：

<img src="https://img-blog.csdnimg.cn/20200830142429172.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1RyaURpYW1vbmQ2,size_16,color_FFFFFF,t_70#pic_center" style="zoom:50%;" />

然后我们点击下方的 "`Copy`" 即可复制，把这个 JSON 内容保存在一个 JavaScript 文件里面，并且赋予一个变量叫 `standards`。在我们后面的爬虫代码中需要用到。

这里我们用一个简单的方法来获取爬取信息，就是在 W3C 原本的页面上开启一个 `iframe`，这样我们就可以忽略掉跨域的问题。

```javascript
let standards = [...] // 这里面的内容就是我们刚刚从 W3C 网页中爬取到的内容

let iframe = document.createElement('iframe');
document.body.innerHtml = '';
document.body.appendChild(iframe);

function happen(element, event) {
  return new Promise(function (resolve) {
    let handler = () => {
      resolve();
      element.removeEventListener(event, handler);
    };
    element.addEventListener(event, handler);
  });
}

void (async function () {
  for (let standard of standards) {
    iframe.src = standard.url; // 让 Iframe 跳转到每个 standards 中的详情页面
    console.log(standard.name);
    await happen(iframe, 'load'); // 等待 iframe 中的页面打开完毕
  }
})();
```

然后我们需要的信息就是属性表格中的内容：

![](https://img-blog.csdnimg.cn/20200830161207452.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1RyaURpYW1vbmQ2,size_16,color_FFFFFF,t_70#pic_center)

如果我们看一下这个 table 的 HTML 代码，我们会发现这个 table 都是有一个 class 名叫 `propdef` 的。我们就可以用这个特性来获取这个表格中的内容了。

所以我们就可以在 `await happen(iframe, 'load')`，后面添加一行代码来答应这个表格的 DOM 元素来看一下：

```javascript
let iframe = document.createElement('iframe');
document.body.innerHTML = '';
document.body.appendChild(iframe);

function happen(element, event) {
  return new Promise(function (resolve) {
    let handler = () => {
      resolve();
      element.removeEventListener(event, handler);
    };
    element.addEventListener(event, handler);
  });
}

void (async function () {
  for (let standard of standards) {
    iframe.src = standard.url;
    console.log(standard.name);
    await happen(iframe, 'load');
    console.log(iframe.contentDocument.querySelectorAll('.propdef')); // 这里答应出表格的内容
  }
})();
```
