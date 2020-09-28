# 寻路算法练习

**学习寻路算法有什么好处？**

- 寻路是广度优先搜索算法
- 所有的搜索的算法的思路的非常相似
- 所以在讲广度优先的算法的过程中也可以把深度优先搜索类的都讲一遍
- 搜索是算法里面特别重要，通用型也是特别好的一类算法
- 这里可以帮助大家在算法方面有一定的提升

**通过可视化来理解算法**

- 算法里面也是有 UI 相关的部分的
- 并且有一些 JavaScript 特有的部分
- 学习这部分可以让大家对 JavaScript 语言提高熟悉程度
- 并且对语言里面的应用方式获得一个更深的了解
- 还有最重要的是通过异步编程的特性，来讲解一些可视化相关的知识
- 通过把算法的步骤可视化后，我们就可以非常直观地看到算法的运转状况

# 寻路问题的定义

> **寻路的问题** —— 就是在一张地图上指定一个起点和一个终点，从起点通过横竖斜各个方向去找到它通往终点的一个路径。

在我们的这个练习里面我们会制造一张 100 x 100 个格子的地图，并且在上面绘制我们的从起点到终点的路径。

> 在一开始我们会先用简单的横竖两个方向来寻找我们的终点，因为斜向的路径会有一定的差异，尤其是在地图比较空旷的情况下。后面我们会逐渐地增加各种各样的功能，直到我们把搜素全部解决完。

# 地图编辑器

在这么大规模的寻路问题当中，我们首选需要做一个地图编辑器。它的功能如下：

1. 可以通过鼠标左键点击，或者点击并拖动就可以绘制地图
2. 可以通过鼠标右键点击，或者点击并拖动就可以清楚地图
3. 可以保存地图的数据，刷新地图后，还可以重新绘制出来

首先我们需要绘制我们地图的底盘，在绘制之前我们就需要给我们的 HTML 加入 CSS。

我们的底盘是一个 100 x 100 格的，所以我们需要给每个格子一个样式。这里我们只需要用 `flex` 来布局即可。假设我们每个格子都是 `6px` 宽高，然后依次每行排列 100 个。所以我们的 HTML 布局代码就是如下：

```html
<div id="container">
  <div class="cell"></div>
  <div class="cell"></div>
  <div class="cell"></div>
  <div class="cell"></div>
  ...
</div>
```

- `container` 就是外包框
- `cell` 就是里面的格子

布局的 CSS 就是如下：

```css
body {
  background: #0f0e18;
  /* 让整个内容剧中 */
  display: flex;
  flex-direction: column;
  align-items: center;
}
.cell {
  display: inline-block;
  line-height: 7px;
  width: 6px;
  height: 6px;
  background-color: #2d2f42;
  border-bottom: solid 1px #0f0e18;
  border-right: solid 1px #0f0e18;
  vertical-align: bottom;
  transition: all 400ms ease;
}
#container {
  padding-bottom: 1rem;
  display: flex;
  flex-wrap: wrap;
  width: 701px;
}

/* 为了更好看，加入了 button 的样式，可有可无！*/
button {
  background: transparent;
  /* border: none; */
  color: var(--blue-color);
  border: 1px solid aqua;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 400ms ease;
}
button:hover {
  background: var(--blue-color);
  color: #333;
}
```

以上是布局的 CSS，但是整个底盘是需要我们用数据来构建的，这样我们后面才能使用它来做我们寻路的问题。所以这里我们需要加入 JavaScript 来做整个渲染的过程。

HTML 的部分我们只需要加入一个 `div`，并且拥有一个 ID 为 `container` 即可：

```html
<div id="container"></div>
```

## **实现思路**：

1. 创建一个 10000 个数据的数组，并且给里面都放入 `0`
2. 从左到右，从上到下，循环遍历所有底盘的格子
3. 在遍历的同时在创建 `div` 元素，`class` 为 `cell`
4. 遍历的过程中遇到值为 `1` 的就给予背景颜色 `#7ceefc`
5. 添加 `mousemove` (鼠标移动) 监听
6. 鼠标移动监听中有两种情况，如果是鼠标左键点击状态下就加入背景颜色，如果是右键点击的话就是清楚当前背景颜色
7. 最后把使用 `appendChild` 把`cell` 加入到 `container` 之中
8. 使用 localStorage 记录我们的底盘数据

## **代码实现**：

```javascript
// 定义 100 x 100 的底盘数据
// 使用 localStorage 获取，如果没有就新建一个
let map = localStorage['map'] ? JSON.parse(localStorage['map']) : Array(10000).fill(0);

// 获取 container 元素对象
let container = document.getElementById('container');

// 遍历所有格子
for (let y = 0; y < 100; y++) {
  for (let x = 0; x < 100; x++) {
    // 创建地图方格
    let cell = document.createElement('div');
    cell.classList.add('cell');
    // 遇到格子的状态是 1 的，就赋予背景颜色
    if (map[100 * y + x] == 1) cell.style.backgroundColor = 'aqua';
    // 添加鼠标移动监听事件
    cell.addEventListener('mousemove', () => {
      // 只有在鼠标点击状态下执行
      if (mousedown) {
        if (clear) {
          // 1. 右键点击时，就是清楚格子的状态
          cell.style.backgroundColor = '';
          map[100 * y + x] = 0;
        } else {
          // 2. 左键点击时，就是画入格子的状态
          cell.style.backgroundColor = 'aqua';
          map[100 * y + x] = 1;
        }
      }
    });
    // 加入到 container 之中
    container.appendChild(cell);
  }
}

let mousedown = false;
let clear = false;

// 鼠标按键点击时，把鼠标点击状态变为 true
document.addEventListener('mousedown', e => {
  mousedown = true;
  clear = e.which === 3;
});
// 离开点击鼠标按键后，把状态更变成 false
document.addEventListener('mouseup', () => (mousedown = false));
// 因为我们需要使用右键，所以要把右键默认打开菜单禁用
document.addEventListener('contextmenu', e => e.preventDefault());
```

最后我们这里添加一个保存按钮，让我们刷新页面的时候也会保存着我们编辑过的地图：

```html
<div id="container"></div>
<!-- 保存地图数据到 localStorage -->
<button onclick="localStorage['map'] = JSON.stringify(map)">save</button>
```

最后呈现的结果就是这样的：

![](https://img-blog.csdnimg.cn/20200928191540743.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1RyaURpYW1vbmQ2,size_16,color_FFFFFF,t_70#pic_center)

> [查看效果](http://tridiamond.tech/frontend-tutorials/exercises/path-finder/1-map-editor.html) ｜ [查看代码](https://github.com/TriDiamond/frontend-tutorials/blob/master/exercises/path-finder/1-map-editor.html) ｜ **喜欢的同学 🌟star 一下谢谢！**

# 实现广度优先搜索

现在我们来深入的解决寻路的问题，上面我们已经定义过寻路问题，就是 “`找到一个起点和终点，然后我们需要找一条路径，可以从起点到达终点，并且不能越过我们的边界和墙`”。

我们一眼看过去这个 100 x 100 的网格，确实会觉得这个问题不是特别地好解决。在算这个路径的过程，中间有大量的数据需要我们去运算。但是我们可以把这个问题变得更简单一点。

我们会到起点，从起点这个位置开展我们的思考。问一下我们自己一个问题：”从这里我们可以走到哪里呢？“

这里我们问题还是不简单，可以走的地方可多了。因为起点的位置可能没有任何障碍物，也不再任何边缘上。那就是说哪里都可以呀？

![](https://img-blog.csdnimg.cn/20200826170415899.gif#pic_center)

好吧，那么我们再把问题的范围再缩窄一点，“我们从起点开始，`第一步`能走到哪里呢？”。好这个问题的关键就是`第一步`。

假设我们忽略斜着走的情况（这个我们后面再考虑进去，这里的终点是简化问题），我们可以走往`上`，`下`，`左`，`右` 4 个格子。如果我们逆时针的给这些位置标记一下就会得出一下的路径标记。

![](https://img-blog.csdnimg.cn/2020092819344460.png#pic_center)

就是这样，我们就完成了寻路的第一本步骤了。接下来我们看看下一步我们又能走到哪里。如果上面标记的`1`，`2`，`3`，`4` 都是可以走的，按照我们刚刚的思路，我们现在看 `1` 号格子又能走哪里呢？

![](https://img-blog.csdnimg.cn/20200928194257598.png#pic_center)

没有错，按照逆时针的方式，我们可以走的格子有 `5`，`6`，`7` 三个格子。所以我们可以按照这样的走法，把`2`，`3`，`4` 都走一遍。最后我们就会发现下面这样的路径：

![](https://img-blog.csdnimg.cn/20200929011003158.png#pic_center)

最后我们看看下面的动画效果，看看整个过程是怎么样的。

![](https://img-blog.csdnimg.cn/20200928163913547.gif#pic_center)

所以我们就是这样，一直往外寻找我们可以走到哪些格子，直到我们找到我们的终点。这样即可帮助我们找到从起点到终点的路线。当然在寻找的时候如果我们遇到边界或者障碍的时候就会跳过，因为这些都是走不过去的。

> 这个思路的问题，很容易让大家想到递归，但是这个方法并不适合使用递归来表达。如果我们用递归来表达，我们肯定是从找到 `1` 这个格子之后，就会开始展开找 `1` 周围的格子了。那么 5，6，7 就会在 2，3，4 之前被执行了（因为是递归，我们会逐层展开的）。

> 所以说，如果我们默认用递归的方式来表达，这个寻路的方式就会变成 “`深度优先搜索`”，但是对寻路问题来说深度优先搜索是不好的，“`广度优先搜索`”才是好的。

## **为什么寻路广度优先搜索比深度优先搜索好呢？**

我们来举个例子，就更好理解了！

![](https://img-blog.csdnimg.cn/20200826164747158.gif#pic_center)

> 假设我们现在走入了一个迷宫，前方有成千上万个分叉口，这个时候我们有两种搜索出路的方法

**方案一**：

独自一人，选择左边或者右边一直走那边的每一条分支，并且都一直走到底直到走到有死胡同了，然后就回头走另外那边的分支。就这样一直走一直切换分支，直到我们找到出口的分支为止。运气好的话，很快就找到出口了，运气不好的话，所有分支都基本走个遍才能找到出口。

**方案二**：

我们是独自一个人，但是我们有 “分身术”，当我们遇到分叉口的时候我们是可以每一个分叉口都去尝试一遍。比如 A，B，C 三个分叉口，我们可以 A 路线走一步，然后 B 路线也走一步，最后 C 路线也走一步，这里我们步伐整齐统一，就有点像我们上面的动态图中一样，一直往所有分叉口往外扩展寻找路线。这样我们就可以在 N 个分叉口依次一步一步往前走，直到找到出口。这样的方式等同于我们依次的在寻找每一个分叉口，这样的搜索显然是比第一个好的。（**我不知道你们，但是就有分身术这个技能我就觉得已经在寻路这个问题中赢了！**）

![](https://img-blog.csdnimg.cn/20200929014054873.gif#pic_center)

> 回归到算法的话，**方案一**其实就是“`深度优先搜索`”，而**方案二**就是"`广度优先搜索`"！显然在寻路这种问题是广度优先搜索更为高效！

## 实现广度优先搜索代码

玩过走迷宫的同学肯定都会想到，在走迷宫的时候，我们都会给我们走过的路径标记，这样我们才知道我们走过哪里，最后通过这些记录找到可以到达终点的路径。我们这个寻路的问题也不例外，根据我们上面的分析，我们从起点就开始往外扩展寻找可以走的格子，每当我们找到一个可走的格子，我们都需要记录起来。

在算法当中我们都会把数据加入一个 “`集合`” 里面，而这个集合就是所有搜索算法的 “`灵魂`”。所有搜索算法的差异，完全就是在于这个 “`集合 (queue)`” 里面。

而 `queue` 是一种数据结构，我们也叫它为 “`队列`”，它的特性就是 `先进先出` ，`一边进另外一边出`。实际效果与下图：

![](https://img-blog.csdnimg.cn/20200929020713965.gif#pic_center)

那么 JavaScript 中有没有队列这样的数据结构呢？有！`JavaScript 中的数组就是天然的队列 (Queue)`，同时 `JavaScript 中的数组也是天然的栈 (Stack)`。

![](https://img-blog.csdnimg.cn/20200826170415899.gif#pic_center)

JavaScript 的数组有 2 组常用的处理方法 `shif` 和 `unshift`，以及 `push` 和 `pop`。 但是如果我们混搭来使用他们的话，就会让我们的数组变成不一样的数据结构。

- `push` 与 `shift` 或者 `pop` 与 `unshift` 结合使用，那么数组就是一个`队列 (Queue)`
- `push` 和 `pop` 结合使用那么，数组就是一个`栈 (Stack)` （当然 shif 和 unshif 也是可以的，但是我们一般不会用这个组合来做栈，因为我们考虑到 JavaScript 的数组的实现，这样使用性能会变低。）

这些理论知识都搞懂了，我们就可以开始整理一下编写代码的思路了：

1. 我们需要声明一个队列，也就是声明一个 `queue`，并且把我们的起点默认放入队列中。（JavaScript 中我们使用数组即可）
2. 编写一个 “入队” 的方法，条件是如果遇到边缘或者障碍就直接跳出方法，这些都是不可走的格子所以不会加入我们的队列。
3. 如果没有遇到以上情况，我们就可以先把可以走的格子在我们的 `map`（在实现我们的地图数据的时候声明的一个数组）中记录一个状态，这里我们可以使用 `2`， 代表这个格子我们已经走过了，这里我们加入一个标记。
4. 循环我们队列中可以走的格子，这里的主要目标就是把所有记录了可以走的格子都找到它的 `上`，`下`，`左`，`右`，并且把这些可走的格子都入队列，然后进入下一个循环时就会去找这些新入队列的格子可以走到哪里，然后把后面找到的格子再次入队列，以此类推。
5. 这个循环有一个截止条件，那就是如果我们在循环每个格子的时候，找到了终点的格子，我们就可以直接返回 `true`，代表我们已经找到终点了。

好思路又了，我们马上来看看代码实现：

```javascript
// 上一部分的代码，这里就忽略了...
// 只要在上部分的代码后面改造这部分即可

// 离开点击鼠标按键后，把状态更变成 false
document.addEventListener('mouseup', () => (mousedown = false));
// 因为我们需要使用右键，所以要把右键默认打开菜单禁用
document.addEventListener('contextmenu', e => e.preventDefault());

/**
 * 寻路方法
 * @param {Array} map 地图数据
 * @param {Array} start 起点 例如：[0, 0]
 * @param {Array} end 终点 例如：[50, 50]
 * @return Boolean
 */
function path(map, start, end) {
  var queue = [start];

  function insert(x, y) {
    // 到达底盘边缘，直接停止
    if (x < 0 || x >= 100 || y < 0 || y >= 100) return;
    // 遇到地图的墙，也停止
    if (map[y * 100 + x]) return;
    // 标记可以走的路的格子的状态为 2
    map[y * 100 + x] = 2;
    // 把可走的路推入队列
    queue.push([x, y]);
  }

  // 循环格子 4 边的格子
  while (queue.length) {
    let [x, y] = queue.shift();
    console.log(x, y);

    // 遇到了终点位置就可以返回了
    if (x === end[0] && y === end[1]) return true;

    // 把上下左右推入队列
    insert(x - 1, y);
    insert(x, y - 1);
    insert(x + 1, y);
    insert(x, y + 1);
  }

  return false;
}
```

为了可以调试看看，我们的代码是否正确，我们来加一个按钮，并且让它可以执行我们这个寻路的方法 `path`。

```html
<div id="container"></div>
<!-- 保存地图数据到 localStorage -->
<div>
  <button onclick="localStorage['map'] = JSON.stringify(map)">save</button>
  <button onclick="path(map, [0,0], [50,50])">find</button>
</div>
```

> 这里我们的按钮会执行一个寻路方法，设置了起点是 x = 0，y = 0 的位置，终点是 x = 50，y = 50 的位置。点击这个按钮之后，我们就可以在浏览器的调试工具中的 `console` 之中看到寻路过程中走过的 x 和 y。如果我们的代码是对的话，最后我们会看到在 50, 50 的时候就会停止运行了。

> [查看效果](http://tridiamond.tech/frontend-tutorials/exercises/path-finder/2-map-path.html) ｜ [查看代码](https://github.com/TriDiamond/frontend-tutorials/blob/master/exercises/path-finder/2-map-path.html) ｜ **喜欢的同学 🌟star 一下谢谢！**

# 加入 Async 和 Await 来方便调试和展示

上一个代码中，其实已经实现了寻路算法的主体部分了。但是里面还是有一些问题的：

1. 算法虽然最终返回了我们终点的位置，并且返回了 `true`，看起来是符合了我们的预期的。但是它的正确性我们不太好保证。**所以我们希望有一个可视化的效果来观察这个寻路算法的过程**。
2. 我们是找到一条路径，**这个最终的路径我们还没有把它找出来**。

这些问题我们下来几个步骤中会一步一步来解决。

> 如何有看我们的 《TicTacToe 三子棋》的编程与算法练习的文章的话，我们里面有讲到使用 `async` 和 `await` ，来让函数中间可插入一些异步的操作。

这部分的代码我们做了一些代码的改造：

1. 把 `path()` 函数改为 `async` 函数
2. 把 `insert()` 函数改为 `async` 函数
3. 因为 `insert()` 编程了异步函数，所以我们 `while()` 循环中的 insert 调用都需要在前面加入 `await`
4. 同时我们需要加入一个等待函数`sleep()`，它必须返回一个 `promise`
5. 在我们入队列之后，在改变当前格子状态为 `2` 之前，我们会对 DOM 元素中的格子的背景颜色进行改变，这样我们就可以看到寻路的过程
6. 因为我们需要看到这个过程，所以每一次入队列的时候我们需要给一个 1 秒的等待时间，这个就是使用 `async` 和 `await` 的好处。在加入这个背景颜色之前，我们就可以加入一个 `await sleep(1)`，这样入队列和改变格子背景颜色之前就会有 1 秒的延迟。

好废话少说，我们来看看代码有什么变化：

```javascript
// 上一部分的代码，这里就忽略了...
// 只要在上部分的代码后面改造这部分即可

// 离开点击鼠标按键后，把状态更变成 false
document.addEventListener('mouseup', () => (mousedown = false));
// 因为我们需要使用右键，所以要把右键默认打开菜单禁用
document.addEventListener('contextmenu', e => e.preventDefault());

/**
 * 等待函数
 * @param {Integer} t 时间 (秒)
 * @return Promise
 */
function sleep(t) {
  return new Promise(function (resolve) {
    setTimeout(resolve, t);
  });
}

/**
 * 寻路方法 (异步)
 * @param {Array} map 地图数据
 * @param {Array} start 起点 例如：[0, 0]
 * @param {Array} end 终点 例如：[50, 50]
 * @return Boolean
 */
async function path(map, start, end) {
  var queue = [start];

  /**
   * 入队方法 (异步)
   * @param {Integer} x
   * @param {Integer} y
   */
  async function insert(x, y) {
    // 到达底盘边缘，直接停止
    if (x < 0 || x >= 100 || y < 0 || y >= 100) return;
    // 遇到地图的墙，也停止
    if (map[y * 100 + x]) return;
    // 加入 30 毫秒的停顿，让我们可以看到 UI 上面的变化
    await sleep(1);
    // 给搜索到的路径的格子加上背景颜色
    container.children[y * 100 + x].style.backgroundColor = 'DARKSLATEBLUE';
    // 标记可以走的路的格子的状态为 2
    map[y * 100 + x] = 2;
    // 把可走的路推入队列
    queue.push([x, y]);
  }

  // 循环格子 4 边的格子
  while (queue.length) {
    let [x, y] = queue.shift();
    // console.log(x, y);

    // 遇到了终点位置就可以返回了
    if (x === end[0] && y === end[1]) return true;

    // 把上下左右推入队列
    await insert(x - 1, y);
    await insert(x, y - 1);
    await insert(x + 1, y);
    await insert(x, y + 1);
  }

  return false;
}
```

最后我们执行后的结果：

![](https://img-blog.csdnimg.cn/20200929034209607.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1RyaURpYW1vbmQ2,size_16,color_FFFFFF,t_70#pic_center)

> [查看效果](http://tridiamond.tech/frontend-tutorials/exercises/path-finder/3-map-search-async.html) ｜ [查看代码](https://github.com/TriDiamond/frontend-tutorials/blob/master/exercises/path-finder/3-map-search-async.html) ｜ **喜欢的同学 🌟star 一下谢谢！**

# 处理路径问题

上一步我们用一个动画，让我们特别清晰的去理解整个寻路算法的过程。但是上一步提到的第二个问题，我们目前是还没有解决的。所以这里我们就是要找到最终的路径是什么，我们最终通过寻路算法之后，我们怎么获得一个路径是可以从起点到达终点的呢？

其实处理这个路径的问题也是非常的简单的，我们先看看看我们之前讲过的寻路的思路：

![](https://img-blog.csdnimg.cn/20200929011003158.png#pic_center)

通过上面这个图，我们已经都还记得，在我们访问每一个格子的时候，我们都往外扩展找到可走的格子有哪些。这个过程当中，我们都是知道每一个被扩展到的格子都是由前一个给自扩展过来的。换句话说，每一个格子都是知道我们是从那个给自扩展过来的。

比如说 `5`，`6`，`7` 这三个格子都是从 `1` 这个格子扩展过来的。既然我们知道每个给自上一步的来源，是不是我们可以在每一个给自记录上一个来源的格子呢？所以在代码中我们是不是可以在入队的时候，就记录上一个给自的 x，y 轴呢？

> 那么我们就产生一个想法，通过这个记录，我们怎么寻找最终的路径呢？

我们假设终点是在 `8` 这个位置，我们过来 `8` 这个点的时候是从我们的起点一步一步扩展出来的，那我们反过来通过记录了每一个格子的前驱格子，就可以一步一步收缩回到起点呢？

那就是说，从 `8` 开始收，`8` 是从 `2` 走过来的，而 `2` 就是从`起点` 扩展过来的，最终我们就找到起点了。如果我们在收缩的过程记录着收缩时候访问到的格子，最终这些格子就是从起点到终点的整条路径了！是不是很神奇？！

> 其实也可以理解为一个 “原路返回” 的效果！

![](https://img-blog.csdnimg.cn/20200929040544273.gif#pic_center)

先不要鸡冻，稳住！我们接下来看看代码是如何处理的：

1. 其实基本上我们的代码没有太多的改变
2. 首先就是在 `while` 循环当中的 `insert()` 调用的时候添加了上一个坐标的传参
3. 这里我们顺便也把横向的可走的格子也加入到队列中
4. 这里因为我们需要记录所有格子的前驱坐标，所以我们需要声明一个 `table` 的变量存放这个数据
5. 在我们进入队列之前，我们就把当前入队列的格子的值存为上一个格子的坐标（这个为了我们后面方便收缩是找到整个路径）
6. 最后在 `while` 循环中，当我们遇到终点的 x 和 y 的时候，我们加入一段 `while` 循环
7. 这个 `while` 就是往回一直走，知道我们找到起点位置，在往回走的同时，把每一个经过的格子的背景改为另外一个背景颜色，这样就可以在我们的地图上画出一个路径了！

好思路清晰，我们来上一波代码吧！

```javascript
// 上一部分的代码，这里就忽略了...
// 只要在上部分的代码后面改造这部分即可

/**
 * 寻路方法 (异步)
 * @param {Array} map 地图数据
 * @param {Array} start 起点 例如：[0, 0]
 * @param {Array} end 终点 例如：[50, 50]
 * @return Boolean
 */
function sleep(t) {
  return new Promise(function (resolve) {
    setTimeout(resolve, t);
  });
}

/**
 * 入队方法 (异步)
 * @param {Integer} x
 * @param {Integer} y
 */
async function findPath(map, start, end) {
  // 创建一个记录表格
  let table = Object.create(map);
  let queue = [start];

  /**
   * 入队方法 (异步)
   * @param {Integer} x
   * @param {Integer} y
   * @param {Array} pre 上一个格子的坐标：[x,y]
   */
  async function insert(x, y, pre) {
    // 到达底盘边缘，直接停止
    if (x < 0 || x >= 100 || y < 0 || y >= 100) return;
    // 遇到地图的墙，也停止
    if (table[y * 100 + x]) return;
    // 加入 30 毫秒的停顿，让我们可以看到 UI 上面的变化
    // await sleep(1);
    // 给搜索到的路径的格子加上背景颜色
    container.children[y * 100 + x].style.backgroundColor = 'DARKSLATEBLUE';
    // 标记走过的格子的值，标记为上一个格子的 x，y 位置
    table[y * 100 + x] = pre;
    // 把可走的路推入队列
    queue.push([x, y]);
  }

  // 循环格子 4 边的格子
  while (queue.length) {
    let [x, y] = queue.shift();
    // console.log(x, y);

    // 遇到了终点位置就可以返回了
    if (x === end[0] && y === end[1]) {
      let path = [];

      // 往回走，直到走到起点
      // 这样就能画出最佳路径了
      while (x != start[0] || y != start[1]) {
        path.push(map[y * 100 + x]);
        [x, y] = table[y * 100 + x];
        await sleep(1);
        container.children[y * 100 + x].style.backgroundColor = 'fuchsia';
      }

      return path;
    }

    // 把上下左右推入队列
    await insert(x - 1, y, [x, y]);
    await insert(x, y - 1, [x, y]);
    await insert(x + 1, y, [x, y]);
    await insert(x, y + 1, [x, y]);

    // 把 4 个 斜边推入队列
    await insert(x - 1, y - 1, [x, y]);
    await insert(x + 1, y - 1, [x, y]);
    await insert(x - 1, y + 1, [x, y]);
    await insert(x + 1, y + 1, [x, y]);
  }

  return null;
}
```

> 注意：这里我们把原来的 `path` 函数名改为了 `findPath`，因为在寻找路径的 `while` 循环里面我们用了 `path` 做为记录路径的变量。这里还需要注意的就是，我们的 `find` 按钮里面的函数调用也需要一并修改哦。

```html
<!-- 保存地图数据到 localStorage -->
<div>
  <button onclick="localStorage['map'] = JSON.stringify(map)">save</button>
  <button onclick="findPath(map, [0,0], [50,50])">find</button>
</div>
```

运行最终效果如下：

![](https://img-blog.csdnimg.cn/20200929042259901.png#pic_center)

> [查看效果](http://tridiamond.tech/frontend-tutorials/exercises/path-finder/4-map-find-path.html) ｜ [查看代码](https://github.com/TriDiamond/frontend-tutorials/blob/master/exercises/path-finder/4-map-find-path.html) ｜ **喜欢的同学 🌟star 一下谢谢！**

# 启发式寻路（A\*）

到这里我们已经完成了整个广度优先寻路的算法。但是广搜式寻路是不是最好的寻路方案呢？`其实并不是的`!

![](https://img-blog.csdnimg.cn/2020092904383578.gif#pic_center)

通过各位数学科学家的努力下，他们证明了一件事情。我们是可以有一种方法能够加速寻路的，通过用这个方法我们不需要使用一个非常傻的方式来挨个去找。

> 这种寻路的方式叫做 “`启发式寻路`”

> 启发式寻路就是用一个函数去判断这些点扩展的优先级。只要我们判断好了优先级，我们就可以有目的的去验者格子的方向做优先找路。

“但是这个找到的路径是不是最佳路径呀？说的那么神奇的。“ 说实话，这个我们普通人的思路就排不上用场了。但是数学家证明了一件事情，只要我们使用启发式函数来估计值，并且这些值能够一定小于当前点到终点的路径的长度，这样就一定能找到最优路径。

> 这种能找到最优路径的启发式寻路，在计算机里面我们叫它做 “`A*`”。这里面的 `A` 代表着一种不一定能找到最优路径的启发式寻路。所以 `A*` 就是 A 寻路的一个特例，是一种可以找到最佳路径的一种算法。

要实现这个启发式寻路，其实我们是不需要改过多我们 `findPath()`函数里面的代码的。我们要改的是我们存储的数据结构，也就是我们的 `queue` 队列。

我们要把 `queue` 的先进先出变成一个`优先队列 (Prioritized Queue)`。

所以我们需要构建一个 `Sorted` 类，这个类有几个工作：

1. 这个类可以存储我们之前 `queue` 队列里面的数据
2. 可以支持传入排序函数（也就是和我们 `array sort` 函数一样的功能，可以传入一个排序规则函数，也叫 `compare` 函数）
3. 在我们通过这个类获取值的时候给我们数据里面的最小值
4. 在我们插入数据的时候不需要排序，只是单纯的保存
5. 每次去除数据的时候，可以把输出的数据在类的数据里面删除掉
6. 这样我们就可以一直在里面获取数据，知道没有数据为止
7. 最后加入一个可以获取当前数据的长度（这个在我们的寻路算法中需要用到）

> 这里我们用一个非常 “土鳖” 的数组来实现这个 Sorted 类，但是在计算机当中，我们还有很多其他方式可以实现这一种类。比如说 `winner tree`，`堆 (heap)`，`排序二叉树` 等很多的不同思路来实现有序的数据结构。

好废话少说，我们来看看怎么实现这个数据结构：

```javascript
/** 排序数据类 */
class Sorted {
  constructor(data, compare) {
    this.data = data.slice();
    this.compare = compare || ((a, b) => a - b);
  }
  take() {
    // 考虑到 null 也是可以参与比较的，所以这里返回 null 是不合适的
    if (!this.data.length) return;
    // 记录最小的值
    // 默认第一个位置为最小值
    let min = this.data[0];
    // 记录最小值的位置
    let minIndex = 0;

    // 开始比较数组里面的所有值，找到更小的值，就记录为 min
    // 同时记录最小值，和最小值的位置
    for (let i = 1; i < this.data.length; i++) {
      if (this.compare(this.data[i], min) < 0) {
        min = this.data[i];
        minIndex = i;
      }
    }

    // 现在我们要把最小值拿出去了，所以要在我们当前的数据中移除
    // 这里我们不考虑使用 splice，因为 splice 移除会涉及数组内的元素都要往前挪动
    // 这样 splice 就会有一个 O(N) 的时间复杂度
    // 这里我们用一个小技巧，把数组里面最后一位的值挪动到当前发现最小值的位置
    // 最后使用 pop 把最后一位数据移除
    this.data[minIndex] = this.data[this.data.length - 1];
    this.data.pop();
    // 最后把最小值输出
    return min;
  }
  give(value) {
    this.data.push(value);
  }
  get length() {
    return this.data.length;
  }
}
```

有了这个 `Sorted` 的数据结构之后，我们就可以用来解决我们的寻路问题，让我们可以找到最佳的路径了。

加入这个最佳路径的逻辑，我们需要改到一下几个点：

1. 首先改写我们的存储数据的 `queue`，使用我们 `Sorted` 的排序数据结构
2. 编写一个 `distance()` 函数来运算任何一个格子与终点格子的直线距离
3. 把所有入队列和出队列的调用改为使用 `Sorted` 类里面的 `take` 取值 和 `give` 插入值函数
4. 其他地方基本就没有什么改变了

接下来我们来看看代码是怎么实现的：

```javascript
// 上一部分的代码，这里就忽略了...
// 只要在上部分的代码后面改造这部分即可

/**
 * 寻路方法 (异步)
 * @param {Array} map 地图数据
 * @param {Array} start 起点 例如：[0, 0]
 * @param {Array} end 终点 例如：[50, 50]
 * @return Boolean
 */
async function findPath(map, start, end) {
  // 创建一个记录表格
  let table = Object.create(map);
  let queue = new Sorted([start], (a, b) => distance(a) - distance(b));

  async function insert(x, y, pre) {
    // 到达底盘边缘，直接停止
    if (x < 0 || x >= 100 || y < 0 || y >= 100) return;
    // 遇到地图的墙，也停止
    if (table[y * 100 + x]) return;
    // 加入 30 毫秒的停顿，让我们可以看到 UI 上面的变化
    await sleep(1);
    // 给搜索到的路径的格子加上背景颜色
    container.children[y * 100 + x].style.backgroundColor = 'DARKSLATEBLUE';
    // 标记走过的格子的值，标记为上一个格子的 x，y 位置
    table[y * 100 + x] = pre;
    // 把可走的路推入队列
    queue.give([x, y]);
  }

  /**
   * 获取格与格之前的距离
   * @param {Array} point 当前格子的坐标：[x,y]
   */
  function distance(point) {
    // 使用三角形 x^2 + y^2 = z^2 的方式来计算距离
    return (point[0] - end[0]) ** 2 + (point[1] - end[1]) ** 2;
  }

  // 循环格子 4 边的格子
  while (queue.length) {
    let [x, y] = queue.take();
    // console.log(x, y);

    // 遇到了终点位置就可以返回了
    if (x === end[0] && y === end[1]) {
      let path = [];

      // 往回走，直到走到起点
      // 这样就能画出最佳路径了
      while (x != start[0] || y != start[1]) {
        path.push(map[y * 100 + x]);
        [x, y] = table[y * 100 + x];
        container.children[y * 100 + x].style.backgroundColor = 'fuchsia';
      }

      return path;
    }

    // 把上下左右推入队列
    await insert(x - 1, y, [x, y]);
    await insert(x, y - 1, [x, y]);
    await insert(x + 1, y, [x, y]);
    await insert(x, y + 1, [x, y]);

    // 把 4 个 斜边推入队列
    await insert(x - 1, y - 1, [x, y]);
    await insert(x + 1, y - 1, [x, y]);
    await insert(x - 1, y + 1, [x, y]);
    await insert(x + 1, y + 1, [x, y]);
  }

  return null;
}
```

这个最终的运行效果如下：

![](https://img-blog.csdnimg.cn/20200929052123673.png#pic_center)

> [查看效果](http://tridiamond.tech/frontend-tutorials/exercises/path-finder/6-map-best-path.html) ｜ [查看代码](https://github.com/TriDiamond/frontend-tutorials/blob/master/exercises/path-finder/6-map-best-path.html) ｜ **喜欢的同学 🌟star 一下谢谢！**
