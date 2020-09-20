# 实现一个 TicTacToe 游戏

这里我们给大家讲讲一个好玩的编程练习，很多同学想到编程练习就会觉得与算法有关。但是往往在编程的过程中，我们要实现某种逻辑或者是功能的时候，确实是需要用到算法。但是我觉得 Winter 老师说的也挺对的。

> 编程练习有一部分是与算法和数据结构密切相关的，但是也有一部分是跟语言比较相关的。我们既要知道这个算法我们怎么去写，我们还要跟语言相结合，就是怎么去用我们的语言更好的去表达。不过编程练习的核心还是提升我们编程的能力。

TicTacToe 是一个非常著名的一个小游戏，国外叫做 TicTacToe，国内我们叫它 “三子棋” 或者 “一条龙”。

如果我们要实现这个小游戏，我们首先就需要了解这个游戏的规则。如果不懂这个游戏的规则，我们是无法用代码语言来表达的。

## 规则

- 棋盘：3 x 3 方格
- 双方分别持有 ⭕️ 和 ❌ 两种棋子
- 双方交替落子
- 率先连成三子直线的一方获胜
- 这个直线分别可以是“横”，“竖”，“斜” 三种

## 代码实现

### 创建棋盘

这个游戏是基于拥有一个可以放棋子的棋盘，换做我们的程序的话，就是一个存放数据的地方，记录着每个棋子所放在的位置。

这里我们可以用一个二维数字来存放：

```js
let parttern = [
  [2, 0, 0],
  [0, 1, 0],
  [0, 0, 0],
];

console.log(pattern);
```

- `0` 表示为没有棋子存放在这个棋盘的位置
- `1` 表示为在其面上有 ⭕️ 的棋子
- `2` 表示为在其面上有 ❌ 的棋子

我们拥有棋盘的数据之后，因为这是一个可以给用户玩的游戏，我们当然需要展示在浏览器上的。所以这里我们就需要加入 HTML 和 CSS。

```html
<style>
  * {
    box-sizing: border-box;
    background: #0f0e18;
  }
  .container {
    margin: 3rem;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }
  h1 {
    color: #ea4dc5;
  }
  #board {
    width: 300px;
    height: 300px;
    display: flex;
    flex-wrap: wrap;
  }
  .cell {
    width: 100px;
    height: 100px;
    background: #2d2f42;
    border: 1px solid #0f0e18;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: background 500ms ease;
  }
  .cell:hover {
    background: #454966;
  }
  .cell .iconfont {
    background: transparent;
    width: 100%;
    height: 100%;
    font-size: 50px;
    line-height: 100px;
    text-align: center;
    vertical-align: middle;
  }
  .blue {
    color: #7ceefc;
  }
  .purple {
    color: #ea4dc5;
  }
  #tips p {
    color: #dddddd;
  }
</style>

<div class="container">
  <h1>Tic-tac-toe Simulator</h1>
  <!-- 标题 -->
  <div id="board"></div>
  <!-- 棋盘 -->
  <div id="tips"></div>
  <!-- 这里是用于提示的，后面的功能会用到 -->
</div>
```

写好了上边的 HTML 和 CSS，我们会发现棋盘上是一个空 `div`，棋盘上的格子还没有被加上。

这里我们是需要根据我们的 `pattern` 中的数据来创建棋盘的。所以我们需要加入 `JavaScript` ，根据我们的棋盘数据来创建我们棋盘上的格子和棋子。

```js
// 棋盘
let pattern = [
  [2, 0, 0],
  [0, 1, 0],
  [0, 0, 0],
];

let chess = 1;

/** 渲染棋盘 */
function build() {
  // 获取棋盘元素
  let board = document.getElementById('board');

  board.innerHTML = '';

  // 填充棋盘
  for (let y = 0; y < 3; y++) {
    for (let x = 0; x < 3; x++) {
      let cell = document.createElement('div');
      cell.classList.add('cell');

      // 创建圆圈棋子
      let circle = document.createElement('i');
      circle.classList.add('iconfont', 'icon-circle', 'blue');
      // 创建叉叉棋子
      let cross = document.createElement('i');
      cross.classList.add('iconfont', 'icon-cross', 'purple');
      // 创建空棋子
      let empty = document.createElement('i');

      let chessIcon = pattern[y][x] == 2 ? cross : pattern[y][x] == 1 ? circle : empty;
      cell.appendChild(chessIcon);
      board.appendChild(cell);
    }
  }
}
```

创建这个棋盘我们使用了一下思路：

- 首先循环一遍我们的二维数组 `pattern`
- 一个双循环就等同于我们从上到下，从左到右的走了一篇这个棋盘数据了
- 在循环这个棋盘的同时我们需要把棋子也同时放入棋盘中
- 首先我们创建一个棋盘格子 `div` 元素，给予它一个 class 名为 `cell`
- 如果我们遇到 `1` 的时候就放入 ⭕️ 到 `cell` 里面
- 如果我们遇到 `2` 的时候就放入 ❌ 到 `cell` 里面
- 如果我们遇到 `0` 的时候就放入一个 “空” 到 `cell` 里面
- 棋子这里我给了一个 `i` 元素，并且它的 class 使用了 iconfont 的使用方式
- 当然如果我们也是可以用 `emoji` 替代这部分内容，直接给 `cell` 元素加入文本 （`cell.innerText = '⭕️'`）
- 最后把 `cell` 加入到棋盘 `board` 里面即可

这里的代码我使用了 阿里巴巴的 `iconfont`，当然我们也可以直接用 `emoji`。跟着我的文章练习的同学，也可以使用我在用的 `iconfont`。这里我附上，我在使用的地址：

```html
<link rel="stylesheet" href="//at.alicdn.com/t/font_2079768_2oql7pr49rm.css" />
```

最后显示出来的就是这样的效果：

![](https://img-blog.csdnimg.cn/20200920211658275.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1RyaURpYW1vbmQ2,size_16,color_FFFFFF,t_70#pic_center)

### 落棋子

我们已经拥有一个 3 x 3 的棋盘了，下来就是实现落棋子的动作的方法。我们想要达到的效果就是让用户点击一个格子的时候，就把棋子落到对应点击的位子。如果该位置已经有棋子了就不生效。

```javascript
/**
 * 把棋子放入棋盘
 *
 *   - 先把当前棋子代号给予当前 x，y 位置的元素
 *
 * @param {Number} x x轴
 * @param {Number} y y轴
 */
function move(x, y) {
  if (pattern[y][x]) return;

  pattern[y][x] = chess;

  chess = 3 - chess;

  build();
}
```

这段代码的逻辑很简单：

- 如果当前 `x`，`y` 位置已经有棋子，那必然就不是 0 ，如果是 0 就直接返回，推出此方法即可
- 如果可以落下棋子，就给当前位置赋予棋子的代码 `1` 就是 ⭕️， `2` 就是 ❌
- 这里我们使用了 1 和 2 的对等特性，$3-1=2$，同样 $3-2=1$ ，用这样的对等换算我们就可以反正当前棋子了
- 也就是说上一位玩家的棋子是 `1`，$3-当前棋子=下一位玩家的棋子$ ，那就是 `2`
- 最后调用我们的棋盘构建方法 `build` 重新构建棋盘即可

这个方法写了，但是我们发现我们根本没有调用到它，所以在棋盘上点击的时候是无任何效果的。

所以这里我们要在构建棋盘的时候，就给每一个格子加上一个 “点击 (click)” 事件的监听。

```javascript
/** 渲染棋盘 */
function build() {
  //... 省略了这部分代码

  let chessIcon = pattern[y][x] == 2 ? cross : pattern[y][x] == 1 ? circle : empty;
  cell.appendChild(chessIcon);
  cell.addEventListener('click', () => move(x, y)); // 《 == 这里加入监听事件
  board.appendChild(cell);

  // ... 省略了这部分代码
}
```

这样我们的棋盘就可以点击格子放下棋子了！

### 判断输赢

我们的游戏到这里已经可以开始玩了，但是一个游戏不能没有结局吧，所以我们还需要让它可以判断输赢。

在了解 TicTacToe 这个游戏的时候，我们知道这个游戏是有几个条件可以胜利的，就是一方的棋子在“`横`”，“`竖`”，“`斜`”连成一线就可以赢得游戏。所以这里我们就需要分别检测这三种情况。

通过分析我们就有 4 种情况：

- 竖行有 3 个棋子都是一样的
- 横行有 3 个棋子都是一样的
- 正斜行 “`/`” 有 3 个棋子都是一样的
- 反斜行 “`\`” 有 3 个棋子都是一样的

那么我们就写一个 `check()` 方法来检测：

```javascript
/**
 * 检查棋盘中的所有棋子
 *
 *  - 找出是否已经有棋子获胜了
 *  - 有三个棋子连成一线就属于赢了
 *
 * @param {Array} pattern 棋盘数据
 * @param {Number} chess 棋子代号
 * @return {Boolean}
 */
function check(pattern, chess) {
  // 首先检查所有横行
  for (let i = 0; i < 3; i++) {
    let win = true;
    for (let j = 0; j < 3; j++) {
      if (pattern[i][j] !== chess) win = false;
    }
    if (win) return true;
  }

  // 检查竖行
  for (let i = 0; i < 3; i++) {
    let win = true;
    for (let j = 0; j < 3; j++) {
      if (pattern[j][i] !== chess) win = false;
    }
    if (win) return true;
  }

  // 检查交叉行
  // 这里用花括号 "{}" 可以让 win 变量
  // 变成独立作用域的变量，不受外面的
  // win 变量影响

  // "反斜行 \ 检测"
  {
    let win = true;
    for (let j = 0; j < 3; j++) {
      if (pattern[j][j] !== chess) win = false;
    }
    if (win) return true;
  }

  // "正斜行 / 检测"
  {
    let win = true;
    for (let j = 0; j < 3; j++) {
      if (pattern[j][2 - j] !== chess) win = false;
    }
    if (win) return true;
  }

  return false;
}
```

有了这个检测输赢的方法，我们就可以把它放入一个地方让它检测游戏的赢家了。

我们可以把这个检测放入用户落下棋子的时候，在棋子反正和重建之前，就检测当前玩家是否胜利了。

```javascript
/**
     * 把棋子放入棋盘
     *
     *   - 先把当前棋子代号给予当前 x，y 位置的元素
     *   - 检测是否有棋子已经赢了
     *
     * @param {Number} x x轴
     * @param {Number} y y轴
     */
function move(x, y) {
  if (hasWinner || pattern[y][x]) return;

  pattern[y][x] = chess;

  // 这里加入了胜负判断
  if (check(pattern, chess);) {
    tips(chess == 2 ? '❌ is the winner!' : '⭕️ is the winner!');
  }

  chess = 3 - chess;

  build();
}
```

加入这段代码我们就可以判断胜负的，但是我们还需要在页面上提示用户到底是谁赢了才完美嘛。所以这里我们加入了一个提示插入的方法：

```javascript
/**
 * 插入提示
 * @param {String} message 提示文案
 */
function tips(message) {
  let tips = document.getElementById('tips');

  tips.innerHTML = '';

  let text = document.createElement('p');
  text.innerText = message;
  tips.appendChild(text);
}
```

最终的效果如下：

![](https://img-blog.csdnimg.cn/20200920214904433.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1RyaURpYW1vbmQ2,size_16,color_FFFFFF,t_70#pic_center)
