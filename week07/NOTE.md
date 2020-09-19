学习笔记

## HTML 的定义：XML 与 SGML

### HTML 发展背景和关系

- SGML: Standard Generalized Markup Language(标准通用标记语言)
- XML: Extensible Markup Language(可扩展标记语言)
- HTML: HyperText Markup Language(超文本标记语言)

SGML 是由 IBM 公司的 GML 语言发展而来，并成为了一项 ISO 标准，是 XML 和 HTML 的超集。都是分类于数据描述语言，历史上出现过 XHTML 这类 XML 化的 HTML

HTML 也是一种数据描述语言，继承了 SGML 和 XML 的一些特性

### HTML 的 DTD

全称为**文档类型定义(Document Type Definition，DTD)**，用来指定文档的子集。

在 HTML4 的版本中，可以尝试阅读 DTD 文件了解规范：http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd

但是从 HTML5 开始脱离 SGML 标准，在代码中 DTD 声明变成了`<!DOCTYPE html>`的简写。

> https://html.spec.whatwg.org/multipage/

### HTML 标签语义

语义类标签对开发者更为友好，使用语义类标签增强了可读性，即便是在没有 CSS 的时候，开发者也能够清晰地看出网页的结构，也更为便于团队的开发和维护。

除了对人类友好之外，语义类标签也十分适宜机器阅读。它的文字表现力丰富，更适合搜索引擎检索（SEO），也可以让搜索引擎爬虫更好地获取到更多有效信息，有效提升网页的搜索量，并且语义类还可以支持读屏软件，根据文章可以自动生成目录等等。

### HTML 语法

#### 基本语法

- 标签:
  - 普通标签写法: `<tagname>...</tagname>`
  - 自封闭标签: `<tag/>`
  - 带有属性的标签: `<tagname attr="value"></tagname>`
- 文本:
  - text
  - CDATA: `<![CDATA[ ]]>`
- 注释: `<!-- comments -->`
- DTD: `<!DOCTYPE html>`
- 处理信息 Processing Instruction: `<?a 1?>`

属性中可以使用文本实体来做转义，属性中，一定需要转义的有下面几种。

- 无引号属性：`<tab>` `<LF>` `<FF>` `<SPACE>` `&` 五种字符。
- 单引号属性：`'` `&`两种字符。
- 双引号属性：`"` `&`两种字符。

#### 文本实体

每一个文本实体由`&`开头，由`;`结束，这属于基本语法的规定，文本实体可以用#后跟一个十进制数字，表示字符 Unicode 值。

ASCII 字符，比如`&#161;`

HTML DTD 的实体，比如`&nbsp;`

> https://html.spec.whatwg.org/multipage/named-characters.html
>
> https://dev.w3.org/html5/html-author/charref

## 浏览器 API

浏览器 API 的分类：

- DOM API
  - 节点：DOM 树形结构中的节点相关 API。
  - 事件：触发和监听事件相关 API。
  - Range：操作文字范围相关 API。
  - traversal：遍历 DOM 需要的 API。（不推荐使用）
- CSSOM
- 其他

> https://developer.mozilla.org/zh-CN/docs/Web/API/Document_Object_Model

### DOM API - 节点

DOM (Document Object Model，文档对象模型)，是 HTML 文档节点的 javascript 运行时模型。

DOM 树中节点类型的继承关系
![image](https://static001.geekbang.org/resource/image/6e/f6/6e278e450d8cc7122da3616fd18b9cf6.png)

#### 节点的导航操作

导航节点的前、后、父、子关系，会读到所有节点类型

- parentNode
- childNodes
- firstChild
- lastChild
- nextSibling
- previousSibling

用于导航元素

- parentElement
- children
- firstElementChild
- lastElementChild
- nextElementSibling
- previousElementSibling

#### 创建节点

DOM 标准规定了节点必须从文档的 create 方法创建出来，不能够使用原生的 JavaScript 的 new 运算。于是 document 对象有这些方法：

- createElement
- createTextNode
- createCDATASection
- createComment
- createProcessingInstruction
- createDocumentFragment
- createDocumentType

#### 操作 DOM 树的节点

- appendChild
- insertBefore
- removeChild
- replaceChild

#### 节点高级 API

- compareDocumentPosition 是一个用于比较两个节点中关系的函数。
- contains 检查一个节点是否包含另一个节点的函数。
- isEqualNode 检查两个节点是否完全相同。
- isSameNode 检查两个节点是否是同一个节点，实际上在 JavaScript 中可以用“===”。
- cloneNode 复制一个节点，如果传入参数 true，则会连同子元素做深拷贝。

#### 节点的属性 Attribute

- getAttribute
- setAttribute
- removeAttribute
- hasAttribute
- getAttributeNode
- setAttributeNode
- .attributes

#### 节点的查找

- querySelector
- querySelectorAll
- getElementById
- getElementsByName
- getElementsByTagName
- getElementsByClassName

### DOM API - 事件

#### 监听事件

监听事件的 API：EventTarget.addEventListener()

```text
target.addEventListener(type, listener [, options]);
target.addEventListener(type, listener [, useCapture]);
```

> https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget
>
> https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener
>
> https://developer.mozilla.org/zh-CN/docs/Web/Events

#### 事件的冒泡和捕获

这是浏览器的事件处理过程，捕获先于冒泡阶段。计算机把操作设备的坐标转换为具体的元素上事件的过程称为捕获。冒泡是确定了发生了事件的元素后，从 DOM 树层级中由内向外，向根节点方向触发。

**在最终的元素中，冒泡还是捕获发生事件回调的顺序取决于监听的顺序**

```html
<div
  id="outer"
  style="background-color: cornflowerblue;width:100px;height:100px;position: relative;top:50px;opacity: 0.8;color:white"
>
  outer
  <div
    id="inner"
    style="background-color: red;width:100px;height:100px;position: relative;top:20px;opacity: 0.8;"
  >
    inner
  </div>
</div>
<script>
  document.getElementById('outer').addEventListener('click', function () {
    console.log('outer 冒泡');
  });
  document.getElementById('inner').addEventListener(
    'click',
    function () {
      console.log('inner 捕获');
    },
    true
  );
  document.getElementById('inner').addEventListener('click', function () {
    console.log('inner 冒泡');
  });
  document.getElementById('inner').addEventListener(
    'click',
    function () {
      console.log('inner 捕获2');
    },
    true
  );
  document.getElementById('outer').addEventListener(
    'click',
    function () {
      console.log('outer 捕获');
    },
    true
  );
  /*
  console output:
    outer 捕获
    inner 捕获
    inner 冒泡
    inner 捕获2
    outer 冒泡
  */
</script>
```

### DOM API - Range

类似于节点 API，Range 可以对 DOM 做精细化的操作，它可以在 DOM 树上自由定位选择范围和编辑

Range API 表示一个 HTML 上的范围，这个范围是以文字为最小单位的，所以 Range 不一定包含完整的节点，它可能是 Text 节点中的一段，也可以是头尾两个 Text 的一部分加上中间的元素。

**创建 Range**

```
//手动设置起止
var range = new Range(), firstText = p.childNodes[1], secondText = em.firstChild
range.setStart(firstText, 9) // do not forget the leading space
range.setEnd(secondText, 4)

//从用户选中区域创建
var range = document.getSelection().getRangeAt(0);
```

**Range 选择范围的一些方法**

- range.setStartBefore
- range.setEndBefore
- range.setStartAfter
- range.setEndAfter
- range.selectNode
- range.selectNodeContents

**Range 的 DOM 修改操作**

- 取出 Range 的内容到 DocumentFragment 中，从 DOM 树中移除：`var fragment = range.extractContents()`
- 插入新节点：`range.insertNode(document.createTextNode("aaaa"))`

例子：使用 Range 把某个元素的子元素逆序

```javascript
var element = document.getElementById('a');
var range = new Range();
range.selectNodeContents(element); //选中元素内的全部节点

let fragment = range.extractContents();
var l = fragment.childNodes.length;
while (l-- > 0) {
  fragment.appendChild(fragment.childNodes[l]);
}
element.appendChild(fragment);
```

> https://developer.mozilla.org/zh-CN/docs/Web/API/Range

### CSSOM

全程 CSS Object Model，是 CSS 对象的运行时模型，提供 javascript 操作 CSS 的能力

`document.styleSheets`：访问页面样式表的 API，是一个类似数组的对象，里面每个属性都是一个样式表，可以是`style`标签或者`link`标签，包括`@import`规则的样式也会收进其中而不是另外创建样式表对象

CSS Rules 操作：

- 查看：`document.styleSheets[0].cssRules[*]`
- 增加：`document.styleSheets[0].insertRule("p { color:pink; }", 0) `
- 移除：`document.styleSheets[0].removeRule(0)`
- 修改 property 和 value：`document.styleSheets[0].cssRules[0].style.color = 'red'`
- 修改选择器：`document.styleSheets[0].cssRules[0].selectorText = '*'`

#### 获取 CSS 属性的计算值

`window.getComputedStyle(element, [pseudoElt]);`

> https://developer.mozilla.org/zh-CN/docs/Web/CSS/computed_value

### CSSOM View

与浏览器渲染的视图相关

> https://www.w3.org/TR/cssom-view/
>
> https://www.zhangxinxu.com/wordpress/2011/09/cssom%E8%A7%86%E5%9B%BE%E6%A8%A1%E5%BC%8Fcssom-view-module%E7%9B%B8%E5%85%B3%E6%95%B4%E7%90%86%E4%B8%8E%E4%BB%8B%E7%BB%8D/

#### window

- window.innerHeight, window.innerWidth：viewport 可视范围的尺寸
- window.outerWidth, window.outerHeight：整个浏览器窗体尺寸
- window.devicePixelRatio：CSS 像素和屏幕物理像素比率
- window.screen：屏幕信息
  - window.screen.width
  - window.screen.height
  - window.screen.availWidth
  - window.screen.availHeight
  - ...

#### Window API

`var opened = window.open("about:blank", "_blank" ,"width=100,height=100,left=100,right=100" )`

新窗口操作

- moveTo(x, y)
- moveBy(x, y)
- resizeTo(x, y)
- resizeBy(x, y)

#### scroll

DOM 的滚动相关

- scrollTop
- scrollLeft
- scrollWidth
- scrollHeight
- scroll(x, y) or scrollTo(x, y)
- scrollBy(x, y)
- scrollIntoView()
- window
  - scrollY
  - scroll(x, y)
  - scrollBy(x, y)

#### layout

`getClientRects()`：获取元素生成的多个盒子的信息，比如一个多行文本产生的多个行盒

`getBoundingClientRect()`：获取元素的整体盒子的信息

### 其它 API

提供 API 的主要标准化组织：

- khronos
  - WebGL
- ECMA
  - ECMAScript
- WHATWG
  - HTML
- W3C
  - webaudio
  - CG/WG
