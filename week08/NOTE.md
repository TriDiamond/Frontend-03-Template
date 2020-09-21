# 实现一个 TicTacToe 游戏

## 「初」前言

这里我们给大家讲讲一个好玩的编程练习，很多同学想到编程练习就会觉得与算法有关。但是往往在编程的过程中，我们要实现某种逻辑或者是功能的时候，确实是需要用到算法。但是我觉得 Winter 老师说的也挺对的。

> 编程练习有一部分是与算法和数据结构密切相关的，但是也有一部分是跟语言比较相关的。我们既要知道这个算法我们怎么去写，我们还要跟语言相结合，就是怎么去用我们的语言更好的去表达。不过编程练习的核心还是提升我们编程的能力。

TicTacToe 是一个非常著名的一个小游戏，国外叫做 TicTacToe，国内我们叫它 “三子棋” 或者 “一条龙”。

如果我们要实现这个小游戏，我们首先就需要了解这个游戏的规则。如果不懂这个游戏的规则，我们是无法用代码语言来表达的。

## 「一」规则

- 棋盘：3 x 3 方格
- 双方分别持有 ⭕️ 和 ❌ 两种棋子
- 双方交替落子
- 率先连成三子直线的一方获胜
- 这个直线分别可以是“横”，“竖”，“斜” 三种

## 「二」代码实现

### 「1」创建棋盘

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

创建这个棋盘我们使用了以下思路：

- 首先循环一遍我们的二维数组 `pattern`
- 一个双循环就等同于我们从上到下，从左到右的走了一篇这个棋盘数据了
- 在循环这个棋盘的同时我们需要把棋子也同时放入棋盘中
- 首先我们创建一个棋盘格子 `div` 元素，给予它一个 class 名为 `cell`
- 如果我们遇到 `1` 的时候就放入 ⭕️ 到 `cell` 里面
- 如果我们遇到 `2` 的时候就放入 ❌ 到 `cell` 里面
- 如果我们遇到 `0` 的时候就放入一个 “空” 到 `cell` 里面
- 棋子这里我给了一个 `i` 元素，并且它的 class 用了 iconfont
- 当然如果我们也是可以用 `emoji` 替代这部分内容，直接给 `cell` 元素加入文本 （例如：`cell.innerText = '⭕️'`）
- 最后把 `cell` 加入到棋盘 `board` 里面即可

这里的代码我使用了 “阿里巴巴” 的 `iconfont`，当然我们也可以直接用 `emoji`。跟着我的文章练习的同学，也可以使用我在用的 `iconfont`。这里我附上我在使用的 iconfont 地址：

```html
<link rel="stylesheet" href="//at.alicdn.com/t/font_2079768_2oql7pr49rm.css" />
```

最后显示出来的就是这样的效果：

![](https://img-blog.csdnimg.cn/20200920211658275.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1RyaURpYW1vbmQ2,size_16,color_FFFFFF,t_70#pic_center)

### 「2」落棋子

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

### 「3」判断输赢

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

有了这个检测输赢的方法，我们就可以把它放到一个地方让它检测游戏的赢家了。

我们可以把这个检测放入用户落棋子的时候，在棋子类型反转和重建之前，就检测当前玩家是否胜利了。

```javascript
/** 全局变量 —— 是否有赢家了 */
let hasWinner = false

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

> 这里我们需要加入一个 `hasWinner` 的全局变量，这个是用来记录这个游戏是否已经有赢家了，如果有赢家，就不能让用户在落棋子了。所以在 `move` 方法的开头就判断了，如果有赢家了就直接返回，退出方法。

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

## 「三」实现 AI

现在我们已经拥有了一个可以玩的 “TicTacToe” 游戏了。但是在这个时代，没有一点 AI 支持的程序，怎么能成为一个好的产品呢？所以这里我们来一起给我们的游戏加入一下 AI 的功能。

### 「1」预判下一步是否会赢

我们首先整理一下这个需求，在某一个玩家落棋之后，就可以检测这盘棋的下一个玩家是否即将会赢。

要判断下一个玩家是否即将会赢，我们就需要模拟下一个玩家落棋子的位置，其实对我们的程序来说，就是把棋子依次放入现在棋盘中空出来的格子，然后判断下一个玩家会不会赢了游戏。

**实现思路：**

- 我们的时机是在上一个玩家落下棋子后，开始模拟下一个玩家所有可能走的位置
- 这个时候我们可以循环现在的棋盘上的格子，模拟下一个玩家把棋子放入每一个非空的格子的结果
- 如果遇到有一个格子放入棋子后会赢的话，那下一个玩家就是可以赢了！

> 这里我们要注意的是，我们需要模拟下一个玩家在当前局面下走了每一个空格子的结果，这个时候如果我们用原来的 `pattern` 数据来模拟，就会影响了现在游戏里棋子的位置。所以我们需要不停的克隆现在棋盘的数据来模拟。这样才不会影响当前棋盘的数据。

**实现预测方法：**`willWin()`

```javascript
/**
 * 检测当前棋子是否要赢了
 *
 *   - 循环整个棋盘
 *   - 跳过所有已经有棋子的格子
 *   - 克隆棋盘数据（因为我们要让下一个棋子都走一遍所有空位的地方
 *     看看会不会赢，如果直接在原来的棋盘上模拟，就会弄脏了数据）
 *   - 让当前棋子模拟走一下当前循环到的空位子
 *   - 然后检测是否会赢了
 *
 * @param {Array} pattern 棋盘数据
 * @param {Number} chess 棋子代号
 * @return {boolean}
 */
function willWin(pattern, chess) {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (pattern[i][j]) continue;
      let tmp = clone(pattern);
      tmp[i][j] = chess;
      if (check(tmp, chess)) {
        return true;
      }
    }
  }
  return false;
}
```

**克隆方法：**`clone()`

```javascript
/**
 * 克隆棋盘数据
 * @param {Array} pattern 棋盘数据
 * @return {Array} 克隆出来的棋盘数据
 */
function clone(pattern) {
  return JSON.parse(JSON.stringify(pattern));
}
```

最后我们需要在上一个玩家落棋，之后加入输赢预判方法：“改装我们的 `move()` 方法即可”

```javascript
/**
 * 把棋子放入棋盘
 *
 *   - 先把当前棋子代号给予当前 x，y 位置的元素
 *   - 检测是否有棋子已经赢了
 *   - 反转上一个棋子的代号，并且重新渲染棋盘
 *
 * @param {Number} x x轴
 * @param {Number} y y轴
 */
function move(x, y) {
  if (hasWinner || pattern[y][x]) return;

  pattern[y][x] = chess;

  hasWinner = check(pattern, chess);
  if (hasWinner) {
    tips(chess == 2 ? '❌ is the winner!' : '⭕️ is the winner!');
  }

  chess = 3 - chess;

  build();

  if (hasWinner) return;

  // 这里加入了输赢预判
  if (willWin(pattern, chess)) {
    tips(chess == 2 ? '❌ is going to win!' : '⭕️ is going to win!');
  }
}
```

> 这里还加入了一个判断：`if(hasWinner) return;`，这个是为了如果这步棋有玩家已经赢了，我们就不需要再预判输赢了，可以直接返回了。

就这样我们就实现了一个，智能的输赢预判功能了，最后的效果如下图：

![](https://img-blog.csdnimg.cn/2020092121002185.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1RyaURpYW1vbmQ2,size_16,color_FFFFFF,t_70#pic_center)

### 「2」预判游戏胜负

上面我们实现的 AI 只能给我们预判下一步棋是否会赢。但是并没有给我们预判出，以现在的局面最终谁会赢。

这里我们一起来实现一个更加智能的 AI，让程序在每一个玩家落子之后，判断以现在棋子的局面，最终谁会赢，或者是否结果是和棋。

**实现思路：**

- 首先我们要给我们游戏的最终结果定义好标识
- 结果是 `-1` 就是最后会输
- 结果是 `0` 就是最后会和
- 结果是 `1` 就是最后会赢
- 这里胜负是正负相反的，这个设计就是为了让我们更好的判断输赢
- 也可以这么理解，对方的棋子放入了可以赢的位置，那么我们的结果就肯定是输，这个结果就是刚好相反的，所以我们用了正负的标识来表达就非常方便我们用程序来判断
- 使用我们上面说到的逻辑，我们就可以锁定一个思路，如果我们找到对方要输的棋子的位置，那我们就是会赢的位置，如果我们找到对方要赢的位置，我们就要输
- 利用这样的逻辑我们可以用一个递归的方法来循环模拟两个玩家的落子动作，并且判断出落棋后的结果，一直深度搜索直到我们找到一个赢家
- 这个递归最终会模拟两个玩家走了这盘棋的所有情况并且找到一个能赢的局面，就可以结束循环了。这个也叫做“胜负节支”。赢已经是最好的结果了，我们并不需要继续模拟到所有的情况，我们已经找到最佳的情况了。
- 当让在其他棋盘游戏中，可能有很多胜利的局面，有可能是赢了但是损失了很多，也有赢了但是又快又减少了损失。但是在这个 “TicTacToe” 当中就不需要考虑这些因素了。

说了那么多，我们来看看代码是怎么实现的，我们先来实现一个寻找最佳结果的方法 `bestChoice`：

```javascript
/**
     * 找到最佳结果
     *
     *   - 结果是 -1 就是最后会输
     *   - 结果是  1 就是最后会赢
     *   - 结果是  0 就是最后会和
     *
     * @param {Array} pattern 棋盘数据
     * @param {Number} chess 棋子代号
     */
    function bestChoice(pattern, chess) {
      // 定义可以赢的位置
      let point;

      // 如果当前局面，我们已经即将要赢了
      // 我们就可以直接返回结果了
      if ((point = willWin(pattern, chess))) {
        return {
          point: point,
          result: 1,
        };
      }

      // 定义一个结果，-2 是要比 -1，0，1 要小
      // 所以是一个最差的局面，我们需要从最差的局面开始
      // 数字变得越高，我们就越接近赢
      let result = -2;
      point = null;
      outer: for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
          // 跳过所有已经有棋子的地方（因为不能在这些地方放我们的棋子了）
          if (pattern[y][x]) continue;

          // 先克隆当前棋盘数据来做预测
          let tmp = clone(pattern);

          // 模拟我们的棋子下了这个位置
          tmp[y][x]= chess;

          // 找到我们下了这个棋子之后对手的最佳结果
          let opp = bestChoice(tmp, 3 - chess);

          // 记录最佳结果
          if (-opp.result >= result) {
            result = -opp.result;
            point = [x, y];
          }

          if (result === 1) break outer;
        }
      }
```

> 这段代码做了什么？其实就是让我们的程序进行了自我博弈，A 方找到自己可以赢的落子位置，然后 B 方着自己可以赢的落子位置，知道最后进入一个结果，要不两方都赢不了，那就是和局，要不就是一方获胜为止。

> 我们会关注到，这里 `bestChoice` 返回了一个对象，一个属性是 `result`， 这个就是预判出来这个游戏最后的结果。而另外一个是 `point`，这个就是当前玩家可以走的位置，也是可以达到最佳结果的位置。这个在我们实现最后一个 AI 功能的时候会用到。这一步我们只需要用到 `result` 属性来做判断，输出胜负提示即可。

有了这个更高级的预判 AI，我们就可以把我们的 `willWin()` 替换下来了。

这里我们改造一下我们的 `move()` 方法：

```javascript
/**
 * 把棋子放入棋盘
 *
 *   - 先把当前棋子代号给予当前 x，y 位置的元素
 *   - 检测是否有棋子已经赢了
 *   - 反转上一个棋子的代号，并且重新渲染棋盘
 *
 * @param {Number} x x轴
 * @param {Number} y y轴
 */
function userMove(x, y) {
  if (hasWinner || pattern[y][x]) return;

  pattern[y][x] = chess;

  if ((hasWinner = check(pattern, chess))) {
    tips(chess == 2 ? '❌ is the winner!' : '⭕️ is the winner!');
  }

  chess = 3 - chess;

  build();

  if (hasWinner) return;

  let result = bestChoice(pattern, chess).result;
  let chessMark = chess == 2 ? '❌' : '⭕️';
  tips(
    result == -1
      ? `${chessMark} is going to loss!`
      : result == 0
      ? `This game is going to draw!`
      : `${chessMark} is going to win!`
  );
}
```

最后出来的效果就是如此：

![](https://img-blog.csdnimg.cn/2020092121303788.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1RyaURpYW1vbmQ2,size_16,color_FFFFFF,t_70#pic_center)

> 当然这个预判是在预判最好的结果，这里我们假设了两个玩家都是非常优秀的，每一步都是走了最佳的位置。但是如果玩家失误还是有可能反败为胜的哦！

### 「3」加入电脑玩家

我们前面实现的 AI，已经足够让我们实现一个很聪明的 AI 电脑玩家了。

在上一步我们实现了 `bestChoice()` 方法的时候，这个方法返回的属性里，有一个 `point` 属性，这个`point` 其实就是玩家最佳落子的位置，我们只需要让程序自动落子到这个位置，我们就完成了电脑玩家的功能了。

**实现思路：**

- 上一个玩家落子之后，就可以调用我们电脑玩家落子方法
- 使用 `bestChoice` 找到最佳结果的落子位子
- 给最佳位子放下电脑玩家的棋子
- 最后继续预测这个游戏的结局

真的就是那么简单，我们来看看代码怎么实现：

> 这里我们需要改造 `move()` 方法，改为 `userMove()`，并且创建一个 `computerMove()`。

```javascript
/**
 * 把棋子放入棋盘
 *
 *   - 先把当前棋子代号给予当前 x，y 位置的元素
 *   - 检测是否有棋子已经赢了
 *   - 反转上一个棋子的代号，并且重新渲染棋盘
 *
 * @param {Number} x x轴
 * @param {Number} y y轴
 */
function userMove(x, y) {
  if (hasWinner || pattern[y][x]) return;

  pattern[y][x] = chess;

  if ((hasWinner = check(pattern, chess))) {
    tips(chess == 2 ? '❌ is the winner!' : '⭕️ is the winner!');
  }

  chess = 3 - chess;

  build();

  if (hasWinner) return;

  computerMove();
}

/** 电脑自动走棋子 */
function computerMove() {
  let choice = bestChoice(pattern, chess);

  if (choice.point) pattern[choice.point[1]][choice.point[0]] = chess;

  if ((hasWinner = check(pattern, chess))) {
    tips(chess == 2 ? '❌ is the winner!' : '⭕️ is the winner!');
  }

  chess = 3 - chess;
  build();

  if (hasWinner) return;

  let result = bestChoice(pattern, chess).result;
  let chessMark = chess == 2 ? '❌' : '⭕️';
  tips(
    result == -1
      ? `${chessMark} is going to loss!`
      : result == 0
      ? `This game is going to draw!`
      : `${chessMark} is going to win!`
  );
}
```

就是这样我们就实现了电脑玩家，这样一个单生狗也可以玩 “TicTacToe” 了。 😂😂😂

开个玩笑哈，说不定玩着玩着你就找到人生另一半的啦！加油哦！💪

## 「四」优化

写到这里，我们已经完成了一个 “TicTacToe” 游戏了。实现完一个功能后，我们都会问自己一个问题，这个程序有没有可以优化的地方呢？

以我们上面的代码示例，其实是有一个地方可以优化的，那就是我们的棋盘数据。

示例里面我们的棋盘数据是使用了一个二维数组的，这样在我们克隆的时候需要使用 JSON 转换来克隆，这个过程我们需要用到大量的内存空间。

如果我们把棋盘的数据改造成一个一维数组的话，我们就可以用 JavaScript 里面的 `Object.create(pattern)` 来克隆了。这个方法创建了一个新对象，使用现有的对象来提供新创建的对象的 \_\_proto\_\_，这样的方式就能节省大量的内存空间。因为我们使用了原型克隆，而不是整个对象的克隆。

**首先我们改造棋盘数据**：

```javascript
// 棋盘
let pattern = [0, 0, 0, 0, 0, 0, 0, 0, 0];
```

> 现在我们棋盘是一个一位数字，那么我们怎么换行呢？

> 用数学去理解的话：$当前行数 * 3 + 当前行的指针位置$，当然我们行数在数组种是从`0`开始的。

所以就是这样一个现象：

> [
>
> $(0*3+1)$, $(0*3+2)$, $(0*3+3)$,
>
> $(1*3+1)$, $(1*3+2)$, $(1*3+3)$,
>
> $(2*3+1)$, $(2*3+2)$, $(2*3+3)$,
>
> ]

最后得出的位置就是这样的：

> [
>
> 1, 2, 3,
>
> 4, 5, 6,
>
> 7, 8, 9
>
> ]

这样是不是就能找到我们 9 个格子的位置呀？

> 所以在代码中，我们只需要把所有的 `pattern[y][x]` 改为 `pattern[y * 3 + x]` 即可！

## 「终」总结

其实这个 “TicTacToe” 练习的重点在于抽象思路。我们是怎么把一个游戏复杂的逻辑一步一步抽象成我们程序的代码，通过 `if` ` else` 判断，加上 `iteration` 循环来实现我们的需求和功能。这个过程其实不单纯的锻炼我们的算法和数学，更多是编程能力。

这里我又要感叹一下，覃超老师经常说的 “无毒神掌” 了。一切学习和技能不在于我们有多么好的天赋，更多的在于我们有没有反复练习。只有经历过无数遍磨练的知识和技能才会变成我们内力。
