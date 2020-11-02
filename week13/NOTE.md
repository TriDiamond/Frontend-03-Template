# 前端组件化基础知识

---

同学们好，我是来自《**技术银河**》 的 **三钻**。

这里我们一起来学习前端组件化的知识，而**组件化**在前端架构里面是最重要的一个部分。

讲到前端架构，其实前端架构中最热门的就有两个话题，一个就是组件化，另一个就是架构模式。组件化的概念是从开始研究如何扩展 HTML 标签开始，最后延伸出来的一套前端架构体系。而它最重要的作用就是**提高前端代码的复用性**。

而 架构模式 就是大家特别熟悉的 `MVC`, `MVVM` 等设计模式，这个话题主要关心的就是前端跟数据逻辑层之间的交互。

所以说，前端架构当中，组件化可以说是重中之重。在实际工程当中，其实组件化往往会比架构模式要更重要一些。因为组件化直接决定了一个前端团队代码的复用率，而**一个好的组件化体系是可以帮助一个前端团队提升他们代码的复用率，从而也提升了团队的整体效率**。

因为复用率提高了，大家重复的编写就会降低，效率就会提高，从而团队中的成员的心理和心智负担就会少很多。

> 所以学习组件化可以是说是非常重要的

这里我们先从了解什么是组件化和一个组件的基本组成部分。

## 组件的基本概念

组件都会区分为模块和对象，组件是与 UI 强相关的，所以某种意义上我们可以认为组件是特殊的模块或者是特殊的对象。

> 组件化既是`对象`也是`模块`

组件化的特点是可以使用树形结构来进行组合，并且有一定的模版化的配置能力。这个就是我们组件的一个基本概念了。

## 对象与组件的区别

首先我们来看对象，而对象是有**三大要素**的：

1. **属性** —— Properties
2. **方法** —— Methods
3. **继承关系** —— Inherit

在 JavaScript 中的普通对象是可以它的属性，方法和继承关系来描述。而这里面的继承，在 JavaScript 中是使用原型继承的。

这里说的 “普通对象” 不包含复杂的函数对象或者是其他的特殊对象，而在 JavaScript 当中，属性和方法是一体的。

相对比组件，它里面包含的语义要素会更丰富一点，组件中的要素有：

- **属性** —— Properties
- **方法** —— Methods
- **继承** —— Inherit
- **特性** —— Attribute
- **配置与状态** —— Config & State
- **事件** —— Event
- **生命周期** —— Lifecycle
- **子组件** —— Children

`Properties` 和 `Attribute` 在英语的含义中是有很大的区别的，但是往往都会翻译成 “属性”。 如果遇到两个单词都出现的时候，就会把 `Attribute` 翻译为 “特性”，把 `Properties` 翻译成 “属性”。这两个要素要怎么区分呢？这里在文章的后面会和大家一起详细了解。

接下来就是组件的 `Config`，它就是对组件的一种配置。我们最常用到 `Config` 就是在一个构造函数创建一个对象的时候，我们传入这个构造函数的参数就叫 “配置 `Config`”。

同时组件也会有 `状态 state`。当用户去操作或者是一些方法被调用的时候，一个 `state` 就会发生变化。这种就是组件的状态，是会随着一些行为而改变的。而 `state` 和 `properties`、`attributes`、`config` 都有可能是相识或者相同的。

`event` 就是顾名思义事件的意识，而一个事件是组件往外传递的。我们的组件主要是用来描述 UI 这样的东西，基本上它都会有这种事件来实现某种类型的交互。

每一个组件都会有生命周期 `lifecycle`，这个一会在文章的后面会详细的展开学习。

组件的 `children` 是非常重要的一部分，`children` 也是组件当中一个必要的条件，因为没有 `children` 组件就不可能形成树形结构，那么描述界面的能力就会差很多。

之前有一些比较流行的拖拽的系统，我们可以把一些写好的 UI 组件拖到页面上，从而建立我们的系统界面。但是后面发现除了可以拖拽在某些区域之外，还需要一些自动排序，组件嵌套组件的功能需求。这个时候组件与组件之间没有树形结构就不好使了。

最后组件在对象的基础上添加了很多语义相关的概念，也是这样使得组件变成了一种非常适合描述 UI 的概念。

## 组件 Component

我们用一张图来更深入的了解组件。

![](https://img-blog.csdnimg.cn/20201102144915865.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1RyaURpYW1vbmQ2,size_16,color_FFFFFF,t_70#pic_center)

组件最直接的产生变化的就是来源于用户的输入和操作，比如说当一个用户在我们的选择框组件中选中了一个选项时，这个时候我们的状态 `state`，甚至是我们的子组件 `children` 都会发生变化。

图中右边的这几种种情况情况就是组件的开发者与组件的关系。其中一种就是开发者使用了组件的标记代码 `Markup Code`，来对组件产生影响。其实也就是他们可以通过组件特性 `Attribute` 来更改组件的一些特征或者是特性。

> **Attribute** 是一种声明型的语言，也是`标记型代码 Markup Code`。而 Markup Code 也不一定是我们的 HTML 这种 XML 类的语言。在标记语言的大生态中，其实有层出不穷的语言可以用来描述一个界面的结构。但是最主流的就是基于 XML 的体系。在我们 Web 领域里面最常见的就是 XML 。而 JSX 也可以理解为一种嵌入在编程语言里面的 XML 结构。

开发者除了可以用 `Attribute`，也可以用 Property 来影响组件。这个组件本身是有属性 `Property` 的，当开发者去修改一个组件的属性时，这个组件就会发生变化。而这个就是与对象中的 `属性 Property` 是一样的概念。

> **Attribute** 和 **Property** 是不是一样的呢？有的时候是，有的时候也不是，这个完全取决于组件体系的设计者。组件的实现者或者是设计者可以让 `attribute` 和 `property` 统一。甚至我们把 `state`、`config`、`attribute`、`property` 四者都全部统一也是可以的。

然后就是 `方法 method`，它是用于描述一个复杂的过程，但是在 JavaScript 当中的 `Property` 是允许有 `get` 和 `set` 这样的方法的，所以最终 `method` 和 `property` 两者的作用也是差不多的。

那么这里我们可以确定一个概念，使用组件的开发者会使用到 `method` 和 `property`，这些组件的要素。但是如果一个开发组件的程开发者需要传递一个消息给到使用组件的程序员，这个时候就需要用到 `事件 event`。当一个组件内部因为某种行为或者事件触发到了变化时，组件就会给使用者发送 `event` 消息。所以这里的 `event` 的方向就是反过来的，从组件往外传输的。

通过这张图我们就可以解清楚知道组件的各个**要素的作用**，以及他们的**信息流转方向**。

## 特性 Attribute

在所有组件的要素中，最复杂的无非就是 `Attribute` 和 `Property`。

我们从 `Attribute` 这个英文单词的理解上，更多是在强调**描述性**的。比如说我们描述一个人，头发很多、长相很帅、皮肤很白，这些都是属于 `Attribute`，也可以说是某一样东西的特性和特征方面的描述。

而 `Property` 跟多的是一种**从属关系**，比如我们在开发中经常会发现一个对象，它有一个 `Property` 是量外一个对象，那么大概率它们之间是有一个从属关系的，子对象是从属与父对象。但是这里也有一种特殊情况，如果我们是弱引用的话，一个对象引用了另外一个对象，这样就是完全是另一个概念了。

上面讲的就是这两个词在英文中的区别，但是在实际运用场景里面他们也是有区别的。

因为 `Property` 是从属关系的，所以经常会在我们面向对象里面使用。而 `Attribute` 最初就是在我们 XML 里面中使用。它们有些时候是相同的，有些时候又是不同的。

## Attribute 对比 Property

这里我们用一些例子来看看 Attribute 和 Property 的区别。我们可以看看它们在 HTML 当中它们不等效的场景。

**Attribute:**

```html
<my-component attribute="v" />
<script>
  myComponent.getAttribute('a');
  myComponent.setAttribute('a', value);
</script>
```

- HTML 中的 Attribute 是可以通过 HTML 属性去设置的
- 同时也可以通过 JavaScript 去设置的

**Property:**

```javascript
myComponent.a = 'value';
```

- 这里就是定义某一个元素的 a = ‘value’
- 这个就不是 attribute 了，而是 property

> 很多同学都认为这只是两种不同的写法，其实它们的行为是有区别的。

### Class 属性

```html
<div class="class1 class2"></div>

<script>
  var div = document.getElementByTagName('div');
  div.className; // 输出就是 class1 class2
</script>
```

早年 JavaScript 的 Class 是一个关键字，所以早期它是不允许关键字做为属性名的。但是现在这个已经被改过来了，关键字也是可以做属性名的。

为了让这个关键字可以这么用，HTML 里面就做了一个拖鞋的设计。在 HTML 中属性仍然叫做 `class` 但是在 DOM 对象中的 property 就变成了 `className`。但是两者还是一个互相反射的关系的，这个神奇的关系会经常让大家掉一些坑里面。

比如说在 React 里面，我们写 className 它自动就把 Class 给设置了。

### Style 属性

现在 JavaScript 语言中，已经没有 class 和 className 两者不一致的问题了。我们是可以使用 `div.class` 这样的写法的。但是 HTML 中就还是不支持 class 这个名字的，这个也就是一些历史包袱导致的问题。

有些时候 Attribute 是一个字符串，而在 Property 中就是一个字符串语义话之后的对象。最典型的就是 `Style` 。

```html
<div class="class1 class2" style="color:blue"></div>

<script>
  var div = document.getElementByTagName('div');
  div.style; // 这里就是一个对象
</script>
```

在 HTML 里面的 Style 属性他是一个字符串，同时我们可以使用 getAttribute 和 setAttribute 去取得和设置这个属性。但是如果我们用这个 Style 属性，我们就会得到一个 key 和 vaule 的结构。

### Href 属性

在 HTML 中 `href` 的 attribute 和 property 的意思就是非常相似的。但是它的 property 是经过 resolve 过的 url。

比如我们的 href 的值输入的是 "//m.taobao.com"。这个时候前面的 http 或者是 https 协议是根据当前的页面做的，所以这里的 href 就需要编译一遍才能响应当前页面的协议。

做过 http 到 https 改造的同学应该都知道，在让我们的网站使用 https 协议的时候，我们需要把所有的写死 http 或者 https 的 url 都要改成使用 `//` 。

所以在我们 href 里面写了什么就出来什么的，就是我们的 attribute。如果是经过 resolve 的就是我们的 property 了。

```html
<a href="//m.taobao.com"></a>
<script>
  var a = document.getElementByTagName('a');
  // 这个获得的结果就是 "http://m.taobao.com"， 这个 url 是 resolve 过的结果
  // 所以这个是 Property
  a.href;
  // 而这个获得的是 "//m.taobao.com", 跟 HTML 代码中完全一致
  // 所以这个是 Attribute
  a.getAttribute('href');
</script>
```
