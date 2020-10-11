![](https://img-blog.csdnimg.cn/20201012024720866.png#pic_center)

# 使用 LL 算法构建 AST

同学们好，我是来自 《**技术银河**》的 💎 **三钻** 。

在之前的 《**前端进阶**》系列的学习笔记中已经讲到过不少跟字符串处理相关的内容。但是我们的主要学习的都是如何进行对字符串做一些初步的分析。我们这里就来一起学一些边缘里面的稍微高级一点的字符串处理，就是使用 `LL 算法构建 AST`。

`AST` 叫做`抽象语法树`。我们的代码在计算机的分析过程中，首先就是把编程语言去分词，在分词之后就让它构成这种层层相互嵌套的语法树的树形结构。最后才是去解析代码去执行。

构建抽象语法树的过程又被称为`语法分析`。而最著名的语法分析算法的核心的思想有两种：

- LL 算法
- LR 算法

> 这里面的 `L` 是 `Left` 的缩写，`LL` 算法就是从左到右扫描，然后从左到右规约的，也是 `Left Left` 算法，第一个 Left 就是从左到右扫描，第二个 Left 就是从左到右规约。

那么这个扫描规约具体是什么呢？这个我们暂时可以不用特别细地去理解，后面当我们去实际执行到这部分代码的时候大家就可以看到具体是怎么去进行的。

# 四则运算

## 词法定义

这里我们要讲解的案例是`四则运算`的分析，四则运算包括了：

- _TokenNumber_ —— 数字输入
  - 1 2 3 4 5 6 7 8 9 0 的组合 (允许在数字中间插入小数点)
- _Operator_ (+、-、\*、/ 之一) —— 加减乘除运算符
- _Whitespace_ (\<sp\>) —— 空格
- _LineTerminator_ (\<LF\> \<CR\>) —— 换行

在这个四则运算的分析中，我们首先会有 `Number` 数字的输入，然后还有加减两种运算符，以及我们允许变成语言的使用者添加一些格式化的字符，比如说空格、换行等格式化字符我们就会把他们无视掉。

> 其实在我们的四则运算中，真正有意义的输入元素就是 Token，一种是 `Number` 数字，一种是 `Operator` 运算符。

## 语法定义

首先加法和乘法是有一个优先级关系的，所以我们需要用 JavaScript 的产生式去定义它的加法和乘法运算。

这里我们就把它的加减乘除做成一个嵌套的结构。我们可以认为加法是由左右两个乘法组成的，并且加法是可以进行连加的，所以说加法应该是一个重复自身的一个序列。（这里也会有一个递归的产生式结构，**这个也是我们在产生式当中，用来处理无限的列表的时候常用的手法**）

`MultiplicativeExpression` 就是乘法运算，一个单独的数字我们也可以认为是一种特殊的乘法，就是只有一项的乘法（其实也可以理解为：任何数 x 1 = 自身，这种也属于乘法之一）同样我们把只有称号认为是一种特殊的加法，只有一项的加法。这样就方便我们去递归的定义整个表达式。

### 乘法表达式

> \<MultiplicativeExpression>::=
> `<Number>`
> |\<MultiplicativeExpression>`<*>` `<Number>`
> |\<MultiplicativeExpression> `</>` `<Number>`

首先我们来看看最低层级的 `MultiplicativeExpression` ，它的定义是一个用乘号或者除号相连接的 Number 的序列。我们来参考大家都比较熟悉的递归思想的话，我们就会规定它可以是一个单独的 `Number`，它也可以是一个`乘法表达式`，后面缀上一个`乘号`再加上一个 `Number`

这里上面加入了背景的部分的，就是产生式定义里面的`终结符`，也就是 `Terminal Symbol`。**Terminal Symbol 就是我们直接从词法里面扫描出来的。**

而其他没有标出来的部分就是 `None Terminal Symbol`，也就是 `非终结符`。**非终结符就是我们拿终结符的组合定义出来的。**

我们可以看到我们去定义这个乘法表达式的非终结符有：

- _\<Number>_ —— 一个单独的 `Number`
- _\<\*>\<Number>_ —— 自身加上一个 `乘号` 再加上一个 `Number`
- _\</>\<Number>_ —— 自身加上一个 `除号` 再加上一个 `Number`

所以这就是乘法表达式的一个结构了，当我们遇到这样一个结构的时候，我们就可以认为它是一个乘法这类的表达式。

### 加法表达式

加法表达式是和乘法的非常的类似的，只不过是基本的单元换成了一个非终结符的 `MulplicativeExpression`。

> \<AdditiveExpression>::=
> \<MultiplicativeExpression>
> |\<AdditiveExpression>`<+>`\<MultiplicativeExpression>
> |\<AdditiveExpression\>`<->`\<MultiplicativeExpression>

这里的话我们可以拥有一个单独的 `MultiplicativeExpression` 乘法表达式，或者是加法表达式自身加上 `加号` 再加上 一个 `乘法表达式`。当然也可以是自身加上 `减号` 再加上一个 `乘法表达式`。

> 整体来说就是数个乘法用加号或者减号连接在一起，那么就是一个加法表达式的结构了。

### 整体的表达式

> \<Expression>::=
> \<AdditiveExpression>`<EOF>`

最后我们认为一个能处理的表达式 `Expression` ，他就是一个 `AdditiveExpress` 加法表达式。在最后我们引入了一个特殊的符号 `EOF`，EOF 它不是一个真实可见的字符。但是因为**我们的语法需要一个终结**，在分析的过程中如果有一些结构是要求一定要到尾巴才结束的。所以这个 EOF 就是这样的一个符号，它标识了我们源代码的结束点。

而 `EOF` 其实就是 `End of File` 的缩写，也就是 "文件底部"。这个符号也常常被我们用在计算机各种表示中介的场景里面。

## LL 语法分析

上面我们搞清楚了语法的定义之后，我们接下来就了解一下 LL 语法分析是怎么去做的。

> \<AdditiveExpression>::=
> `<MultiplicativeExpression>`
> |\<AdditiveExpression>`<+>`\<MultiplicativeExpression>
> |\<AdditiveExpression\>`<->`\<MultiplicativeExpression>

我们可以用上面的这个加法的表达式为例，因为乘法比较简单。我们应该从这个输入的这样的一个序列里面，我们去看它当前能够拿到的是什么样的东西。

如果我们过一个策划分析，我们在处理一个 `AddititiveExpression` ，那么这个 `AdditiveExpression` 找到的第一个符号 `symbol` 它会是什么呢？

我们在产生式里面我们可以看到，我们可能会面临着两种情况。第一种就是开头就是一个 `MultiplicativeExpression`，第二种就是一个 `AddititiveExpression`。那是不是就只有这两种情况呢？

当然不是了，因为一个乘法表达式，很有可能当前是一个还未解析的状态。所以我们需要把这个乘法展开。这里我们把递归中乘法的部分加入进来。

> \<AdditiveExpression>::=
> `<Number>`
> |\<MultiplicativeExpression>`<*>` `<Number>`
> |\<MultiplicativeExpression> `</>` `<Number>`
> |\<AdditiveExpression>`<+>`\<MultiplicativeExpression>
> |\<AdditiveExpression\>`<->`\<MultiplicativeExpression>

那么乘法的表达式它可能是 `Number`、`MultiplicativeExpression`、`AdditiveExpression` 等一系列的这样的可能性。所以说加法表达式中的 `MultiplicativeExpression` 是有三种可能性的。

那么如果我们在加法表达式中遇到的是 `Number` 或者是 `MultiplicativeExpression`，我们时不时就应该把它直接当成乘法去处理呢？但是这里我们只看一个字是不够的，我们需要取看它第二个输入的元素是乘号、除号、加号还是减号。因为原来的 `MultiplicativeExpression` 还是在的。

那么所以说我们通过这个，就可以的出来一个从左到右的扫描，然后从左到右去归并的一个语法分析的算法。那么这就是 `LL 语法分析`了。

# 代码实现

接下来我们去看看我们的语法分析，在代码上具体是怎么样去实现的。

## 实现正则表达式

> /([0-9\.]+)|([ \t]+)|([\r\n]+)|(\*)|(\/)|(\+)|(\-)/g

那么首先我们写一个正则表达式来获取我们需要的 `symbol`，这个正则表达式它是以 `或关系` 分开的。然后每一个里面都是一个换括号的结构。那为什么要用圆括号呢？因为在正则里面圆括号表示`捕获`，那么我们一旦对它进行了捕获，**除了这个正则表达式整体表示的字符串，圆括号里面的内容也会直接被匹配出来。而这个是正则表达式的一个特性，这个特性就是专门为词法分析而准备的正则语法。**

因为这里我们用`或`分割开了每一个正则规则，所以正则表达式整体匹配的内容每次只会匹配到一个或关系的分支里面。

所以这里我们给每一个分支都取一个名字（也叫 `token` 名），我们把名字依次按顺序放入一个数组里面：

```javascript
/** Crafted by 三钻 **/
/** @website https://tridiamond.tech **/

// 正则表达式
let regexp = /([0-9\.]+)|([ \t]+)|([\r\n]+)|(\*)|(\/)|(\+)|(\-)/g;
// 正则分支名字
let dictionary = ['Number', 'Whitespace', 'LineTerminator', '*', '/', '+', '-'];
```

- 这里面 `0-9` 包含了所有数字
- `\t` 前面的是空格，而 `\t` 就是 `tab`
- `\r` 就是回车，而 `\n` 就是新行
- 最后的就是 `加减乘除` 了

接下来我们来看看整体代码的实现：

```javascript
/** Crafted by 三钻 **/
/** @website https://tridiamond.tech **/

// 正则表达式
let regexp = /([0-9\.]+)|([ \t]+)|([\r\n]+)|(\*)|(\/)|(\+)|(\-)/g;
// 正则分支名字
let dictionary = ['Number', 'Whitespace', 'LineTerminator', '*', '/', '+', '-'];

// 接下来我们就可以去做 `tokenize`
function tokenize(source) {
  let result = null;
  while (true) {
    // 使用正则表达式里面的 `exec` 函数，去让它不断的扫描整个原字符里面的内容。
    result = regexp.exec(source);

    // result 里面没有东西就直接退出
    if (!result) break;

    // 如果 result 里面有东西
    // 那我们就根据 result 的位置
    // 从 1 到 7 的范围里面匹配到哪一种输入元素
    //（  首先正则返回的第 0 个是整个结果，所以我们从 1 开始
    //       然后我们的匹配总数一个有 7 个所以是从 1 到 7  ）
    for (let i = 1; i <= dictionary.length; i++) {
      if (result[i]) console.log(dictionary[i - 1]);
    }
    // 这里我们把 token log 出来
    console.log(result);
  }
}

tokenize('1024 + 10 * 25');
```

我们的 `token` 是 `1024 + 10 * 25`，根据这个我们可以依次看到如下结果：

- 首先出来的会是 `1024`，这个是 `Number`
- 接下来就是`空格符`，也就是 `Whitespace`
- 然后就是 `+`，对应的就是 `+`
- 接下来还是一个 `空格符`，Token 是 `Whitespace`
- 然后就是 `10`，Token 是 `Number`
- 依次类推，我们发现这个代码是会从左到右扫描我们的字符，找到所有对应的 `token`。

这样就是我们想要的一个词法分析的结果了。这里我们初步完成了词法分析的正则。

# LL 词法分析

好我们接着来继续学习 LL 语法分析。前面我们已经把词法大概做完了，接下来我们把代码稍微做一些整理。另外我们把代码写的更好看一点，还有设计一下使用的方法。

前面的正则和字典都是不需要变得。我们在 `tokenize` 的部分开始进行改造。

在 `tokenize` 这里我们给它天上了一个 `lastIndex`，因为我们现在的代码里面还没有去做判断，比如说匹配出来的长度与我们前进的长度不一样时怎么办。所以这里我们要把这个逻辑补上。

```javascript
/** Crafted by 三钻 **/
/** @website https://tridiamond.tech **/

// 正则表达式
let regexp = /([0-9\.]+)|([ \t]+)|([\r\n]+)|(\*)|(\/)|(\+)|(\-)/g;
// 正则分支名字
let dictionary = ['Number', 'Whitespace', 'LineTerminator', '*', '/', '+', '-'];

// 接下来我们就可以去做 `tokenize`
function tokenize(source) {
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

    // 如果 result 里面有东西
    // 那我们就根据 result 的位置
    // 从 1 到 7 的范围里面匹配到哪一种输入元素
    //（  首先正则返回的第 0 个是整个结果，所以我们从 1 开始
    //       然后我们的匹配总数一个有 7 个所以是从 1 到 7  ）
    for (let i = 1; i <= dictionary.length; i++) {
      if (result[i]) console.log(dictionary[i - 1]);
    }
    // 这里我们把 token log 出来
    console.log(result);
  }
}

tokenize('1024 + 10 * 25');
```

> 我们输出 `break` 的地方其实更应该 throw 一个 error 出来的，但是这里我们就不去做这种错误处理了。

之前我们只是把 `token` 打印了出来，接下来我们试着把这个 `token` 变成一个有效的 `token`，就是把 `token` 存储起来。所以这里我们定义一个 `token` 的对象。然后我们的对象里面有 `type` 类型和 `value` 值两个属性。

接下来我们就可以在 while 循环里面从我们 regex 匹配出来的数据存储到我们的 `token` 对象里面。

当我们拿到一个 `token` 的类型和值之后，我们还需要加入一个 `yield token`。因为我们的这个函数是不断地在找出多个 `token` 。当然我们可以用回调函数的方式来吐出所有找到的 `token`，但是一个更好的做法就是使用 `yeild`。这里我们就利用一下新的 JavaScript 语法特性。

当我们要返回一个序列的时候，我们就使用这个 `yield`，这样这个变量的值就会被输出出来。其实大家应该都看出来了，使用了 `yield`，那么我们的 `tokenize` 函数就必须是一个 `generator` 函数。所以我们函数的声明就要改为 `fucntion* tokenize(source)`。

这个时候我们就可以使用 `for of` 来把所有的 token 给打印出来了。

最终的代码如下：

```javascript
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
```

> 那为什么我们要这么处理呢？因为这样处理我们的 `tokenize`函数会变成一个完全异步的形式。当我们需要一个新的 `token` 的时候它就会回来去找一个新的 `token`。

如果还记得我们做语法分析的时候，我们最终的表达式的 `终结符`是一个 `EOF`。所以我们在 `tokenize` 函数的结尾给它添加一个 `yeild { type: 'EOF' }`。 这里 `EOF` 它是可以没有 `value` 的。

写到这里我们的词法分析器就完成了。

> 这部分使用到的技巧，都是我们在处理一些词法分析的时候常常使用的一种办法。就是**使用正则表达式和正则表达式的捕获关系直接去处理词法**。这个对大部分的语言的词法分析来说都已经足够了。

# LL 语法分析

完成了 LL 的词法分析之后，我们就可以正式进入 LL 语法分析。也就是真实的去解读这段段运算，并且找到语法的规则从而进行真实的运算了。

LL 的语法分析的基本结构就是每一个产生式，对应着一个我们的函数。所以我们先把这几个函数的名字先写出来。

```javascript
/** Crafted by 三钻 **/
/** @website https://tridiamond.tech **/

/**
 * 表达式
 * @param tokens
 */
function Expression(tokens) {}

/**
 * 加法表达式
 * @param source
 */
function AdditiveExpression(source) {}

/**
 * 乘法表达式
 * @param source
 */
function MultiplicativeExpression(source) {
  console.log(source);
}

MultiplicativeExpression(source);
```

因为这个`四则运算`的语法结构还是非常的简单的，所以说他在这里我们只需要一个逐级的关系即可。

我们先从最简单，最底层的一级，最贴近终结符的开始编写。那就是我们的乘法 `MultiplicativeExpression`。在这个方法里面我们就直接加入了一个 `console.log(source)`。

着这个之间我们使用我们之前写好的 `tokenize` 把 `token` 的内容推入我们的 `source` 里面。这里我们要注意的是，我们是需要忽略掉一些格式化的字符类型的：比如`空格`和`换行符`这两种。所以在把 token 推入 source 之前我们需要先过滤一下这种类型的字符。

最终的代码如下：

```javascript
/** Crafted by 三钻 **/
/** @website https://tridiamond.tech **/

// 这里 tokenize 的代码忽略了，因为没有需要更改的
// 就不重复在这里编写了

let source = [];

for (let token of tokenize('10 * 25')) {
  if (token.type !== 'Whitespace' && token.type !== 'LineTerminator') source.push(token);
}

/**
 * 表达式
 * @param tokens
 */
function Expression(tokens) {}

/**
 * 加法表达式
 * @param source
 */
function AdditiveExpression(source) {}

/**
 * 乘法表达式
 * @param source
 */
function MultiplicativeExpression(source) {
  console.log(source);
}

MultiplicativeExpression(source);
```

这段代码最后调用了 `MultiplicativeExpression`，而 `MultiplicativeExpression`的方法里面只是把 `source` 原封不动的打印出来。

## MultipicativeExpression

我们首先来看如何实现 `MultiplicativeExpression`。

MultiplicativeExpression 的语法定义中的表达式，它开头的第一个有可能是两个输入。第一个输入有可能是一个 `Number`，另一个是它自身一样的类型，就是另外一个 `MultiplicativeExpression`。而它的第二个输入`MultiplicativeExpression` 又有两种可能，第一个就是 `*`乘法，第二种就是 `/` 也就是除法。如果遇到其他的呢，我们就不认识了。

所以我们在处理上我们就会拆分成三个逻辑分支：

- 第一个逻辑分支就是处理 `Number` 这种情况的
- 第二个就是 `MultiplicativeExpression` 后面跟着一个 `*`
- 第三个就是 `MultiplicativeExpression` 后面跟一个 `/`

> 这种情况下我们会进行合并，就是会把它最后形成一个新的语法结构，最终产生一个非终结符。

如果说我们遇到一个我们不认识的情况的话，我们就可以直接 return，让程序直接退出这个函数。

好我们先来看第一种情况：`Number` 怎么样去处理

如果我们遇到的类型是 `Number` 的话，因为一个 Number 我们就可以把它形成一个 MultiplicativeExpression 的结构了，所以说我们就新建一个节点。这个节点是一个非终结符 `NoneTerminalSymbol`。

```javascript
/** Crafted by 三钻 **/
/** @website https://tridiamond.tech **/

let node = {
  type: 'MultiplicativeExpression',
  children: [source[0]],
};
```

这个新的非终结符他会有一个 `children` 属性。因为它是从 Number 构造起来的，所以它的 children 里面我们就把 `source[0]` 里面的 Number 放入 children 里面。

因为我们产生式是一个递归的结构，我们的表达式也是一个递归的结构，所以当我们生成好了 `MultiplicativeExpression` 之后，后面还有可能是`*` 或者是 `/`。所以我们要递归的去调用 `MultiplicativeExpression` 函数。

最终我们第一节的完整代码如下：

```javascript
/** Crafted by 三钻 **/
/** @website https://tridiamond.tech **/

/**
 * 乘法表达式
 * @param source
 */
function MultiplicativeExpression(source) {
  // Number 类型
  if (source[0].type === 'Number') {
    let node = {
      type: 'MultiplicativeExpression',
      children: [source[0]],
    };
    source[0] = node;
    return MultiplicativeExpression(source);
  }
}
```

然后我们来看第二种情况：`MultiplicativeExpression`后面出现了 `*`

> 其实这个星号跟除号本来是可以写在一起的，这里为了跟我们之前讲到的产生式保持一致，一一对应起来，所以这里我们就拆成两个 if 判断来实现了。

这里也一样我们先定义一个新的 `node`，唯一的区别就是这个新节点里面多了一个属性叫 `operator`。因为这里我们遇到了一个星号，所以我们就把`*`赋予这个 `operator`属性。

```javascript
/** Crafted by 三钻 **/
/** @website https://tridiamond.tech **/

let node = {
  type: 'MultiplicativeExpression',
  operator: '*',
  children: [],
};
```

然后我们把 source 的前三项都用 `.shift()` 获取出来放入 node 的 children 里面，最后把新生成的结构放回 source 里面。最后同样我们需要去递归一次。

```javascript
/** Crafted by 三钻 **/
/** @website https://tridiamond.tech **/

/**
 * 乘法表达式
 * @param source
 */
function MultiplicativeExpression(source) {
  // Number 类型
  if (source[0].type === 'Number') {
    let node = {
      type: 'MultiplicativeExpression',
      children: [source[0]],
    };
    source[0] = node;
    return MultiplicativeExpression(source);
  }
  // 乘法
  if (source[0].type === 'MultiplicativeExpression' && source[1] && source[1].type === '*') {
    let node = {
      type: 'MultiplicativeExpression',
      operator: '*',
      children: [],
    };
    node.children.push(source.shift());
    node.children.push(source.shift());
    node.children.push(source.shift());
    source.unshift(node);
    return MultiplicativeExpression(source);
  }
}
```

除法与乘法的逻辑没有任何的本质区别，就是抄写一遍，把乘号变成了除号而已。

```javascript
/** Crafted by 三钻 **/
/** @website https://tridiamond.tech **/

/**
 * 乘法表达式
 * @param source
 */
function MultiplicativeExpression(source) {
  // Number 类型
  if (source[0].type === 'Number') {
    let node = {
      type: 'MultiplicativeExpression',
      children: [source[0]],
    };
    source[0] = node;
    return MultiplicativeExpression(source);
  }
  // 乘法
  if (source[0].type === 'MultiplicativeExpression' && source[1] && source[1].type === '*') {
    let node = {
      type: 'MultiplicativeExpression',
      operator: '*',
      children: [],
    };
    node.children.push(source.shift());
    node.children.push(source.shift());
    node.children.push(source.shift());
    source.unshift(node);
    return MultiplicativeExpression(source);
  }
  // 除法
  if (source[0].type === 'MultiplicativeExpression' && source[1] && source[1].type === '/') {
    let node = {
      type: 'MultiplicativeExpression',
      operator: '/',
      children: [],
    };
    node.children.push(source.shift());
    node.children.push(source.shift());
    node.children.push(source.shift());
    source.unshift(node);
    return MultiplicativeExpression(source);
  }
}
```

最后我们这里需要加入递归结束的条件，递归结束的条件就是 **source[0] 的 type 是 MultiplicativeExpression 但是它的后面又不是乘号也不是除号**。因为前面两个 if 都有 return 的分支， 所以这一段自然就是一个 else 分支。（也就是说如果能进入前面的 if 判断都会被 return 的，所以如果没有被退出这个函数，必然就会进入我们这段代码。）

那么这里这段逻辑，肯定就是一个 `return source[0]`，这就说明我们已经把所有的乘法都处理完毕了。因为除了乘法和除法，我们还有可能遇到不认识的情况，所以这里最后我们加了一个默认递归自己，`return MultiplicativeExpression(source);`。但是现实中是不应该有这种情况的，我们最后这里加的这个 return 应该是永远不会执行的。因为如果遇到了不符合的字符，那肯定就已经在前面的步骤被退出了。

最后我们的代码如下：

```javascript
/** Crafted by 三钻 **/
/** @website https://tridiamond.tech **/

/**
 * 乘法表达式
 * @param source
 */
function MultiplicativeExpression(source) {
  // Number 类型
  if (source[0].type === 'Number') {
    let node = {
      type: 'MultiplicativeExpression',
      children: [source[0]],
    };
    source[0] = node;
    return MultiplicativeExpression(source);
  }
  // 乘法
  if (source[0].type === 'MultiplicativeExpression' && source[1] && source[1].type === '*') {
    let node = {
      type: 'MultiplicativeExpression',
      operator: '*',
      children: [],
    };
    node.children.push(source.shift());
    node.children.push(source.shift());
    node.children.push(source.shift());
    source.unshift(node);
    return MultiplicativeExpression(source);
  }
  // 除法
  if (source[0].type === 'MultiplicativeExpression' && source[1] && source[1].type === '/') {
    let node = {
      type: 'MultiplicativeExpression',
      operator: '/',
      children: [],
    };
    node.children.push(source.shift());
    node.children.push(source.shift());
    node.children.push(source.shift());
    source.unshift(node);
    return MultiplicativeExpression(source);
  }

  if (source[0].type === 'MultiplicativeExpression') {
    return source[0];
  }

  return MultiplicativeExpression(source);
}
```

如果我们进入调试模式，走一篇代码的话，首先刚进入 MultiplicativeExpression 的时候，我们的 source 就是通过 tokenize() 函数之后的结果。

如果我们的 source 是 `10 * 25`，那么 MultiplicativeExpression 执行完毕之后，我们 source 数组最后只会有两个元素，一个 type 是 `MultiplicativeExpression`，另一个 type 是 `EOF`。因为在我们处理 MultiplicativeExpression 的时候已经把所有属于 MultiplicativeExpression 的节点合并到 MultiplicativeExpression 里面了。所以如果我们的代码无误的话，就只会剩余这两个元素。

## AddictiveExpression

各位同学看到这里应该都会有一些疲倦了，不过我们离完成已经不远了。革命尚未成功，我们坚持一下！

接下来我们一起来完成 LL 语法分析的剩余的部分，我们来实现一下比较复杂的 `AddictiveExpression`，加法语法分析。

`AddictiveExpression`的三种情况是与我们的 `MultiplicativeExpression`的逻辑是基本一样的，只需要换一下名字和符号就有了基本的逻辑结构了。但是`AddictiveExpression`是需要处理它的产生式的三种情况之外，还有`MultiplicativeExpression`所有的逻辑。

这里估计大家都要懵了。

![](https://img-blog.csdnimg.cn/2020093003423819.gif#pic_center)

不要慌张，我们先回去看看我们 `AddictiveExpression`的产生式就明白了：

> \<AdditiveExpression>::=
> \<MultiplicativeExpression>
> |\<AdditiveExpression>`<+>`\<MultiplicativeExpression>
> |\<AdditiveExpression\>`<->`\<MultiplicativeExpression>

通过展开 `<MultiplicativeExpression>`之后我们得到：

> \<AdditiveExpression>::=
> `<Number>`
> |\<MultiplicativeExpression>`<*>` `<Number>`
> |\<MultiplicativeExpression> `</>` `<Number>`
> |\<AdditiveExpression>`<+>`\<MultiplicativeExpression>
> |\<AdditiveExpression\>`<->`\<MultiplicativeExpression>

如果还记得我们在讲解四则运算的语法定义的时候，加法的表达式的第一部分是 `MultiplicativeExpression`，所以上面的表达式当中的头三个其实是`MultiplicativeExpression`对不对？所以在处理加法的这里，我们也需要去调用 `MultiplicativeExpression()` 函数，先处理掉 `MultiplicativeExpression`，然后再执行我们加法中的情况。（加法中的情况也就是上面表达式里面的最后两条）。

如果还是蒙圈，那就**再读多百遍，其义自见**！

![](https://img-blog.csdnimg.cn/20200826170258357.gif#pic_center)

> 简单的说就是 `AdditiveExpression` 是包含了所有 `MultiplicativeExpression` 的逻辑的，因为 `AdditiveExpression`的第一条就是 `MultiplicativeExpression`。所以说我们在加法表达式函数中找到一个不认识的东西的时候，我们需要取调用一次`MultiplicativeExpression`函数，然后再重新调用 `AdditiveExpression`函数。

![](https://img-blog.csdnimg.cn/20200929040544273.gif#pic_center)

懂了吗？如果还是没有，那就继续再读百遍，其义真的会自见的！

回归正题，回归正题，回归正题啦！

所以说 `AdditiveExpression`的第一条分支逻辑，就是第一次进到`AdditiveExpression`的时候我们就会执行以下这个代码先：

```javascript
/** Crafted by 三钻 **/
/** @website https://tridiamond.tech **/
MultiplicativeExpression(source);
return AddictiveExpression(source);
```

其实就是如果刚进来 `AdditiveExpression` 的时候发现还有加法的字符，那就要先去`MultiplicativeExpression`中处理掉之后，才能再回来`AdditiveExpression`继续处理。毕竟只会处理加减的人，不可能让他去处理乘除法嘛。术业有专攻！

那 `AdditiveExpression` 本身的逻辑也会比 `MultiplicativeExpression` 有一个更复杂的地方，就是它的第三项是一个 `MultiplicativeExpression`。

如果我们再来看看`AdditiveExpression`的产生式：

> \<AdditiveExpression>::=
>
> \<Number>
>
> |\<MultiplicativeExpression>\<\*>\<Number>
> |\<MultiplicativeExpression>\ </>\<Number>
> |\<AdditiveExpression>\<+>`<MultiplicativeExpression>`
> |\<AdditiveExpression\>\<->`<MultiplicativeExpression>`

这里高亮的`MultiplicativeExpression` 是一个`非终结符`。非终结符就意味着它本身也需要产生一次，所以我们在使用这个第三项之前我们还要而外的掉一次 `MultiplicativeExpression()` 函数，去把 source 里面的这个非终结符给它处理掉。

所以在如要 `+` 和 `-` 符号的时候，就会比 `MultiplicativeExpression`多执行一行。

多说只会懵，我们直接来看看代码是如何实现，可能不用再读百变也会其义自见了！哈哈。

```javascript
/** Crafted by 三钻 **/
/** @website https://tridiamond.tech **/

/**
 * 加法表达式
 * @param source
 */
function AdditiveExpression(source) {
  // 第一个遇到乘法表达式时
  if (source[0].type === 'MultiplicativeExpression') {
    let node = {
      type: 'AdditiveExpression',
      children: [source[0]],
    };
    source[0] = node;
    return AdditiveExpression(source);
  }
  // 加法
  if (source[0].type === 'AdditiveExpression' && source[1] && source[1].type === '+') {
    let node = {
      type: 'AdditiveExpression',
      operator: '+',
      children: [],
    };
    node.children.push(source.shift());
    node.children.push(source.shift());
    MultiplicativeExpression(source);
    node.children.push(source.shift());
    source.unshift(node);
    return AdditiveExpression(source);
  }
  // 减法
  if (source[0].type === 'AdditiveExpression' && source[1] && source[1].type === '-') {
    let node = {
      type: 'AdditiveExpression',
      operator: '-',
      children: [],
    };
    node.children.push(source.shift());
    node.children.push(source.shift());
    MultiplicativeExpression(source);
    node.children.push(source.shift());
    source.unshift(node);
    return AdditiveExpression(source);
  }

  if (source[0].type === 'AdditiveExpression') {
    return source[0];
  }

  MultiplicativeExpression(source);
  return AdditiveExpression(source);
}
```

## Expression

那么最后我们就是实现我们的 `整体的表达式` 。

其实最后这个步骤就是把 Expression 的整体加上 EOF 的结构，然后给他产生一下。进入 `Expression()` 的时候我们就判断一下 source 的第一个元素是不是 `AdditiveExpression`。因为它同样会包含了 `AdditiveExpression`的所有逻辑，所以这里判断 source 第一个是 `AdditiveExpression`，然后第二个是 `EOF` 的话，Expression 就会总结，然后给我们的 source resolve 成一个最终节点。

我们来看看 `Expression()`函数的 代码：

```javascript
/** Crafted by 三钻 **/
/** @website https://tridiamond.tech **/

/**
 * 表达式
 * @param tokens
 */
function Expression(tokens) {
  if (source[0].type === 'AdditiveExpression' && source[1] && source[1].type === 'EOF') {
    let node = {
      type: 'Expression',
      children: [source.shift(), source.shift()],
    };
    source.unshift(node);
    return node;
  }
  AdditiveExpression(source);
  return Expression(source);
}
```

最后我们来看看整个 LL 语法分析的代码：

```javascript
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

let source = [];

for (let token of tokenize('10 + 20 + 30')) {
  if (token.type !== 'Whitespace' && token.type !== 'LineTerminator') source.push(token);
}

/**
 * 表达式
 * @param tokens
 */
function Expression(tokens) {
  if (source[0].type === 'AdditiveExpression' && source[1] && source[1].type === 'EOF') {
    let node = {
      type: 'Expression',
      children: [source.shift(), source.shift()],
    };
    source.unshift(node);
    return node;
  }
  AdditiveExpression(source);
  return Expression(source);
}

/**
 * 加法表达式
 * @param source
 */
function AdditiveExpression(source) {
  // 第一个遇到乘法表达式时
  if (source[0].type === 'MultiplicativeExpression') {
    let node = {
      type: 'AdditiveExpression',
      children: [source[0]],
    };
    source[0] = node;
    return AdditiveExpression(source);
  }
  // 加法
  if (source[0].type === 'AdditiveExpression' && source[1] && source[1].type === '+') {
    let node = {
      type: 'AdditiveExpression',
      operator: '+',
      children: [],
    };
    node.children.push(source.shift());
    node.children.push(source.shift());
    MultiplicativeExpression(source);
    node.children.push(source.shift());
    source.unshift(node);
    return AdditiveExpression(source);
  }
  // 减法
  if (source[0].type === 'AdditiveExpression' && source[1] && source[1].type === '-') {
    let node = {
      type: 'AdditiveExpression',
      operator: '-',
      children: [],
    };
    node.children.push(source.shift());
    node.children.push(source.shift());
    MultiplicativeExpression(source);
    node.children.push(source.shift());
    source.unshift(node);
    return AdditiveExpression(source);
  }

  if (source[0].type === 'AdditiveExpression') {
    return source[0];
  }

  MultiplicativeExpression(source);
  return AdditiveExpression(source);
}

/**
 * 乘法表达式
 * @param source
 */
function MultiplicativeExpression(source) {
  // Number 类型
  if (source[0].type === 'Number') {
    let node = {
      type: 'MultiplicativeExpression',
      children: [source[0]],
    };
    source[0] = node;
    return MultiplicativeExpression(source);
  }
  // 乘法
  if (source[0].type === 'MultiplicativeExpression' && source[1] && source[1].type === '*') {
    let node = {
      type: 'MultiplicativeExpression',
      operator: '*',
      children: [],
    };
    node.children.push(source.shift());
    node.children.push(source.shift());
    node.children.push(source.shift());
    source.unshift(node);
    return MultiplicativeExpression(source);
  }
  // 除法
  if (source[0].type === 'MultiplicativeExpression' && source[1] && source[1].type === '/') {
    let node = {
      type: 'MultiplicativeExpression',
      operator: '/',
      children: [],
    };
    node.children.push(source.shift());
    node.children.push(source.shift());
    node.children.push(source.shift());
    source.unshift(node);
    return MultiplicativeExpression(source);
  }

  if (source[0].type === 'MultiplicativeExpression') {
    return source[0];
  }

  return MultiplicativeExpression(source);
}

console.log(Expression(source));
```

好，这个就是整个 LL 语法分析的主要过程了。我们到了这里就成功的解析了一个四则运算的表达式。对，不容易但是我们终于完成了。下期再见！

> 我是来自《**技术银河**》的**三钻**，"学习是为了更好的学习，成长是为了不退步。坚持才能成功，失败只是因为没有坚持。同学们加油哦！~"

![](https://img-blog.csdnimg.cn/20201012023447223.gif#pic_center)
