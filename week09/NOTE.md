# 寻路算法

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

## 寻路问题的定义

> **寻路的问题** —— 就是在一张地图上指定一个起点和一个终点，从起点通过横竖斜各个方向去找到它通往终点的一个路径。

在我们的这个练习里面我们会制造一张 100 x 100 个格子的地图，并且在上面绘制我们的从起点到终点的路径。

> 在一开始我们会先用简单的横竖两个方向来寻找我们的终点，因为斜向的路径会有一定的差异，尤其是在地图比较空旷的情况下。后面我们会逐渐地增加各种各样的功能，直到我们把搜素全部解决完。

## 地图编辑器

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
}
#container {
  display: flex;
  flex-wrap: wrap;
  width: 701px;
}
```

以上是布局的 CSS，但是整个底盘是需要我们用数据来构建的，这样我们后面才能使用它来做我们寻路的问题。所以这里我们需要加入 JavaScript 来做整个渲染的过程。

HTML 的部分我们只需要加入一个 `div`，并且拥有一个 ID 为 `container` 即可：

```html
<div id="container"></div>
```

**实现思路**：

1. 创建一个 10000 个数据的数组，并且给里面都放入 `0`
2. 从左到右，从上到下，循环遍历所有底盘的格子
3. 在遍历的同时在创建 `div` 元素，`class` 为 `cell`
4. 遍历的过程中遇到值为 `1` 的就给予背景颜色 `#7ceefc`
5. 添加 `mousemove` (鼠标移动) 监听
6. 鼠标移动监听中有两种情况，如果是鼠标左键点击状态下就加入背景颜色，如果是右键点击的话就是清楚当前背景颜色
7. 最后把使用 `appendChild` 把`cell` 加入到 `container` 之中
8. 使用 localStorage 记录我们的底盘数据

**代码实现**：

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
    if (map[100 * y + x] == 1) cell.style.backgroundColor = '#7ceefc';
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
          cell.style.backgroundColor = '#7ceefc';
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

![](https://img-blog.csdnimg.cn/20200927013003307.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1RyaURpYW1vbmQ2,size_16,color_FFFFFF,t_70#pic_center)

## 实现广度优先搜索

![](https://img-blog.csdnimg.cn/20200927013515877.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1RyaURpYW1vbmQ2,size_16,color_FFFFFF,t_70#pic_center)
