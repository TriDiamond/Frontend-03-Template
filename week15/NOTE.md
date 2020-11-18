# 实现手势库

---

在之前的文章中我们一起实现了一个轮播图的基本效果，我们可以用鼠标去把它来回拖拽。效果上它已经是一个可以做到无尽轮播的轮播图了。

其实我们会发现，我们鼠标在图片上任何微笑的动作都会出发到拖拽，并且对图片进行位移的效果。这个其实并不是一个我们提倡的行为。

在使用鼠标场景下，因为我们鼠标是放在桌面上的，而且鼠标本身也是有一定的重量，所以当我们点击的时候，一般是不会出现任何鼠标的移动信号的。

但是如果是在手机的触屏上，就算我们手再稳，都会出现一定的移位的，这个就是跟我们的手指和屏幕的接触面积和手指是软等问题导致的。当我们点击发生位移的时候，它发生的时间序列都会是我们之前监听的 `down`、`move` 和 `up`这样的过程。

在触屏上的事件就是 `touch`、`start`、`move` 和 `end`，其实和鼠标的 `down`、`move` 和 `up` 的性质是差不多的。但是我们也会发现鼠标和触屏是不太一样的，我们前面实现的轮播图还有一个非常大的问题，就是根本没有去支持触屏的。

在现代网页应用开发的场景下，很多时候我们都需要一些功能是可以在电脑和移动端上同时可用的。所以我们是很有必要做一个可以同一触屏和鼠标上的体验，同时也可以让我们的代码去支持基本的手势区分，比如说点一下和划一下等等这些区分。

## 手势基本知识

所以接下来我们就去了解一下手势的一些基本知识，让我们了解到怎么去区分点击和拖拽移动的行为。

这里我们需要使用 `start`、`move` 和 `end` 这三种场景来进行抽象，同时我们也把鼠标的 `down`、`move` 和 `up` 也统一抽象到触屏下的 `start`、`move` 和 `end` 的模型里面。

当然我们还有 `pointer` 事件，这些也是可以统一抽象到这个模型里面。

我们先来一起整理一下手势体系里面有什么：

![](https://img-blog.csdnimg.cn/2020111613520069.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1RyaURpYW1vbmQ2,size_16,color_FFFFFF,t_70#pic_center)

- **start**
  - 是第一个发生的事件
- **tap**
  - 接着我们如果直接点击屏幕，就是一个 `tap` 的事件
  - 它与 click 是一个比较相似的事件
- **pan start**
  - 点击后我们没有把手抬起来，并且发生了一个移动的行为就是一个 `pan start`。
  - 一般来说在识别这个事件的时候，我们会允许一个较低的误差，在 Retina 屏上我们会允许一个 10px 容错范围，如果是一倍屏就是 5px，三倍屏就是 15px。
  - 那么 `pan` 其实是摄像机领域中的专业词，是移动摄像机的意思。**而这里我们表示的是一个比较缓慢的触点推移**。
- **pan**
  - 一开始移动的时候会触发 `pan start`，之后每一次移动都会触发一个 `pan` 事件
- **pan end**
  - 移动停止时触发的事件
- **flick**
  - 如果我们在移动结束的时候达到一定的速度，我们就会认为用户进行了一次清扫或者划动的一个行为，并且会触发一个 `flick` / `swipe` 事件。
- **press start**
  - 当我们去点击后停留在触屏上的时候，就会触发一个长按的事件
  - 这个长按是通过判定我们停留超过 0.5 秒的时间
  - 超过这个时间我们就判定这个行为是一个按压而不是轻点
  - 这种按压的动作就会触发一些事件，比如说弹出一个菜单
  - 但是如果我们在按压动作的时候发生一个移动 10px 以上的话，就会触发我们之前的 `pan start` 事件
  - 这种手势是我们去设计手势库的时候经常会遗漏的一种
- **press end**
  - 如果我们老老实实按住屏幕，经过一定时间之后手再松开，就会发生一个 `press end` 的事件
  - 有一些事件也是再这个 `press end` 的时候触发的，比如说我们有一个按钮，我们控制它是按下去的时候触发，还是按完之后松开的时候触发

> 这个就是我们基础手势库的体系，当然我们没有包含双指手势。

## 实现鼠标操作

首先我们来创建一个新的项目目录，然后在这个目录里面创建一个新的 JavaScript 文件。然后我们就在这个文件里面尝试实现我们的手势。

我们首先还是先去实现一个鼠标的操作。首先我们假设我们使用 `document.documentElement` 取到一个容器的元素，它代表 HTML 元素。

这个时候我们对获取到的 element 去做事件监听，而在最外层我们就只监听一个 mousedown 的事件。

在 mousedown 的回调函数里面，我们就可以去添加其他的事件。那么这里我们分别写两个事件的处理函数，一个是 mousemove， 一个就是 mouseup。

这里与我们的 carousel 组件的实现一样，我们 mousemove 和 mosueup 都会在 mousedown 的时候被监听，然后是在 mouseup 的时候被移出。

这里我们不需要给 addEventListener 传第三个参数的，这个参数就是 `options`，而 `options` 里面可以加三个参数。一个是用于启用捕捉模式的 `capture`，一个是控制只触发一次的 `once`，最后一个就是控制这个里面是否可以 preventDefault，是同步触发还是异步触发的参数叫 `passive`。

然后我们在 mousemove 的函数中打印一下当鼠标点击时的 X 和 Y 坐标。这里我们使用 `event.clientX` 和 `event.clientY`即可获得这两个坐标。我们也不关系其他相关的信息。

这样我们就完成了 mouse 事件的抽象，具体代码如下：

```javascript
let element = document.documentElement;

element.addEventListener('mousedown', event => {
  let mousemove = event => {
    console.log(event.clientX, event.clientY);
  };

  let mouseup = event => {
    element.removeEventListener('mousemove', mousemove);
    element.removeEventListener('mouseup', mouseup);
  };

  element.addEventListener('mousemove', mousemove);
  element.addEventListener('mouseup', mouseup);
});
```

接下来，我们在根目录建立一个 `gesture.html` 文件，然后引入 `gesture.js`，最后在浏览器跑起来看看。

![](https://img-blog.csdnimg.cn/20201115174022176.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1RyaURpYW1vbmQ2,size_16,color_FFFFFF,t_70#pic_center)

当我们点击并且拖动的时候，console 中答应出了一堆数字，这样就证明我么的 mousemove 被正确的触发了。

## 实现触屏操作

首相我们鼠标中的 mouse 事件是无法被转换成触屏事件的，但是大家经常使用的 `click` 这类更高级的事件是可以监听到的。

像 mousedown、mouseup、mousemove 这些在移动端都是有独立的触屏事件系列的。

在 touch 系列里面一样有三个对应的事件，`touchstart`、`touchmove`、`touchend`，他们对应的就是 `mousedown`、`mousemove`、`mouseup`。

所以对应的写法就是下面这样：

```javascript
element.addEventListener('touchstart', event => {});

element.addEventListener('touchmove', event => {});

element.addEventListener('touchend', event => {});
```

尽管我们看起来鼠标与触屏是比较相似的，但是 Touch 系列的事件与 mouse 系列的事件是不一样的，touch 事件只要我们 start 后，就一定会触发到 move。所以 move 和 start 一定会触发在同一个元素上，不管我们手的位置移动到哪里，这样的话我们就不需要像 mouse 一样，在 mousedown 监听开始之后再去监听 mousemove。

这是因为我们鼠标没有按任何按键都是可以在浏览器页面中移动的，而触屏就不一样，我们没有把手指按到屏幕上是无法触发任何移动事件的。

另外的一个不同就是，touch 系列的事件 `event` 是有多个触点的对象的，这是因为我们触屏上是支持多指手势的。在 `event` 之中是有一个 `changedTouches` 这样的事件的，这个里面是一个数组的结构。

在 mouse 系列里面的 event 是可以直接拿到 clientX 和 clientY 的。而在 touch 系列里面的 event 是有多个触点，所以需要在 changedTouches 的数组里面找到某一个触点，再从触点中才能拿到对应的 clientX 和 clientY。

```javascript
element.addEventListener('touchstart', event => {
  console.log(event.changedTouches);
});
```

这里我们可以打印出来看一下：

![](https://img-blog.csdnimg.cn/20201115215453650.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1RyaURpYW1vbmQ2,size_16,color_FFFFFF,t_70#pic_center)

明显看到，调用 event 中的 changedTouches，返回的是一个 TouchList 对象。而这个对象中就有多个 Touch 对象，每一个里面都有这个触点相关的所有信息。

这里面其实还有一个非常神奇的东西，就是 `identifier`。那么这个 `identifier` 是用来做什么的呢？其实当我们去触发 touchstart 的时候，我们是可以拿到 touchstart 的这个点的信息的。但是某一个点在 move 的时候，我们没有办法知道是哪一个点在 move，所以我们需要在每一个点需要一个唯一的标识符去追踪它。

所以 touchstart、touchmove 和 touchend 各自都有一个标识符，而这个符就 touch 的唯一 ID。

知道了 touch 事件的数据结构，我们可以使用这个结构获得与 mouse 事件系列一样的数据。那么如果我们需要获得每一个触点的所在坐标，我们就可以循环 TouchList 数组，访问到每一个 Touch 对象，从中获得它们的 clientX 和 clientY 值。

这里无论是 start、move 还是 end 都是有 `changedTouches` 这个标志的，所以在每个事件中的 event 都是可以获得它们对应的 changedTouches 中的 TouchList 对象。

```javascript
element.addEventListener('touchstart', event => {
  for (touch of event.changedTouches) {
    console.log(touch.clientX, touch.clientY);
  }
});

element.addEventListener('touchmove', event => {
  for (touch of event.changedTouches) {
    console.log(touch.clientX, touch.clientY);
  }
});

element.addEventListener('touchend', event => {
  for (touch of event.changedTouches) {
    console.log(touch.clientX, touch.clientY);
  }
});
```

这样我们就和我们鼠标事件一样，能获得某一个点的坐标。

![](https://img-blog.csdnimg.cn/20201115222057280.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1RyaURpYW1vbmQ2,size_16,color_FFFFFF,t_70#pic_center)

这里我们需要注意的是，touch 事件里面比鼠标事件多了一个事件叫 `touchcancel`。那么 cancel 和 end 有什么区别呢？Canel 表示的是我们手指 touch 的点的序列被异常情况所结束了。

我们正常的序列就是一个 start，接着一堆的 move，最后是一个 end。如果我们代码中加入一个 3 秒的延迟后输出一个 alert 弹窗，当我们手指在移动的过程中被弹窗所打断了，这个时候就会出现一个 `touchcancel` 的事件，而没有出现一个正常的 touchend 的事件。诸如此类的系统操作都有可能会打断我们的 touch 事件的序列，cancel 事件就会替代了 end 事件。

> 触屏事件是会多出一个 touchcancel 事件，而鼠标事件是没有这样的情况的。

## 实现通用监听

写到这里我们已经有一个基本的 touch 系列的抽象，接下来我们就要去考虑一下，要怎么写一个通用的 gesture 手势的逻辑。

首先我们想要达到的效果，就是无论用户是用鼠标操作的，还是在移动端使用触屏操作的，都会调用到我们通用的事件，然后我们功能中对应需要响应这些事件的逻辑都会被执行。

那么要实现这样的通用逻辑，我们就需要 `4 个通用的函数`：

- start()
  - 123
  - 123
  -
- move()
- end()
- cancel()

这 4 个函数的参数就是一个点的 `point` 对象，然后我们就可以在这 4 个函数里面写它的主体逻辑。那么接下来我们就需要去改造我们的鼠标和触屏的监听事件，让它们对应的事件触发的地方调用我们对应的这 4 个函数。

- mousedown 和 touchstart 就会调用 start 函数
- mousemove 和 touchmove 就会调用 move 函数
- mouseup 和 touchend 就会调用 end 函数
- 最后 touchcancel 就会调用 cancel 函数

最后我们在每一个函数中打印出 point 中的 X 和 Y 坐标。

```javascript
let element = document.documentElement;

element.addEventListener('mousedown', event => {
  start(event);

  let mousemove = event => {
    move(event);
  };

  let mouseup = event => {
    end(event);
    element.removeEventListener('mousemove', mousemove);
    element.removeEventListener('mouseup', mouseup);
  };

  element.addEventListener('mousemove', mousemove);
  element.addEventListener('mouseup', mouseup);
});

element.addEventListener('touchstart', event => {
  for (touch of event.changedTouches) {
    start(touch);
  }
});

element.addEventListener('touchmove', event => {
  for (touch of event.changedTouches) {
    move(touch);
  }
});

element.addEventListener('touchend', event => {
  for (touch of event.changedTouches) {
    end(touch);
  }
});

element.addEventListener('cancel', event => {
  for (touch of event.changedTouches) {
    cancel(touch);
  }
});

let start = point => {
  console.log('start', point.clientX, point.clientY);
};
let move = point => {
  console.log('move', point.clientX, point.clientY);
};
let end = point => {
  console.log('end', point.clientX, point.clientY);
};
let cancel = point => {
  console.log('cancel', point.clientX, point.clientY);
};
```

这个时候我们在浏览器中，可以使用网页和移动端模式测试一下，我们就发现现在无乱是用鼠标拖动还是用移动端的拖动都会打印出当前坐标。

这个就是一个统一的抽象了，这样我们写代码的时候就不用针对具体的鼠标还是 touch 事件去做处理了。我们只需要抽象的去针对每一个点的 `start`、`move`、`end`、`cancel` 等 4 种事件类型去写逻辑就可以了。

## 实现手势逻辑

![](https://img-blog.csdnimg.cn/20201116140014330.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1RyaURpYW1vbmQ2,size_16,color_FFFFFF,t_70#pic_center)

接下来我们就开始实现 gesture 的逻辑，首先我们回顾一下我们之前讲到的时间。

首先我们会触发一个 start 事件，也就是当我们手指触摸到屏幕时第一个触发的事件。然后就会有三种情况：

- **手指松开**
  - 这个时候就会触发 end 事件，这样就构成一个 `tap` 点击的行为
  - 通过监听 end 事件来实现即可
- **手指拖动超过 10 px**
  - 这种就是 `pan start` 拖动的行为
  - 我们可以在 move 事件判断当前与上一个触点的距离
- **手指停留在当前位置超过 0.5s**
  - 这种就是 `press start` 按压的行为
  - 我们可以添加一个 setTimeout 来实现

### Press 事件

![](https://img-blog.csdnimg.cn/20201116173507503.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1RyaURpYW1vbmQ2,size_16,color_FFFFFF,t_70#pic_center)

所以我们第一步就是在 `start` 函数中加入一个 `setTimout` 的 handler 处理程序。

```javascript
let handler;

let start = point => {
  handler = setTimeout(() => {
    console.log('presss ');
  }, 500);
};
```

一般来说 `press` 是我们比较常见的一个行为。但是实际上这里是 press start 事件，后面还会跟随着一个 press end 的事件。我们也可以统称这个为 `press` 事件，然后这个手势库的使用者只需要监听这个 `press` 事件即可，极少的情况下是需要监听 press end 事件的。

这里我们需要注意的是，当我们触发其他的事件的时候，这个 500 毫秒的 setTimout 是有可能会被取消掉的。所以我们需要给这段逻辑赋予给一个 `handler`，并且放在全局作用域中，让其他事件可以获取到这个变量，并且可使用它取消掉这个处理逻辑。

### Pan 事件

![](https://img-blog.csdnimg.cn/20201116174021134.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1RyaURpYW1vbmQ2,size_16,color_FFFFFF,t_70#pic_center)

接下来我们就去监听移动 10px 的 `pan` 事件，这里就需要我们记录一开始用户触摸屏幕时的 x 和 y 坐标，当用户移动手指的时候，持续计算新移动到的位置与初始位置的距离。如果这个距离超过了 10px 就可以触发我们的 `pan start` 的事件了。

所以首先我们需要在 start 函数中加入 `startX` 和 `startY` 的坐标记录，这里要注意的是，因为这两个值都是会在多个地方被使用的，所以也是需要在全局作用域中声明。

然后在 `move` 函数中计算当前触点与起点的直径距离。这里我们需要用到数学中的直径运算公式 $x^2 + y^2 = z^2$，而这里面的 x 是 `当前触点的 x 坐标` - `起点的 x 坐标` 的 x 轴的距离， y 就是 `当前出点的 y 坐标` - `起点的 y 坐标` 运算出来的 y 轴的距离。**最终两个距离二次幂相加就是直径距离的二次幂**。

在代码中我们一般都会尽量避免使用根号运算，因为根号运算会对性能有一定的影响。我们知道最终要判断的是直径距离是否是大于一个固定的 10px。那就是说 z = 10，而 z 的二次幂就是 100，所以我们直接判断这个直径距离是否大于 100 即可。

> 这里还有一个需要注意的，就是当我们手指一动超过 10px 之后，如果我们手指没有离开屏幕但是往回一动了，这个时候我们距离起点已经不够 10px 了。这个时候其实也是算 pan 事件，因为只要我们一动有超过 10px，后面所有的一动都是属于 pan 事件，无论我们最后一动到哪里。

所以我们需要一个 `isPan` 的状态，第一次一动超出 10px 的时候，就会触发 `pan-start` 事件，并且把 `isPan` 置为 true，而后面的所有移动都会触发 `pan` 事件。

根据我们上面讲到的 `press` 事件，如果我们按下手指的 0.5 秒内，出现了移动，那么 `press` 事件就会被取消。所以这里我们就需要把 handler 给清楚掉，这里我们使用 `clearTimeout` 把 hanlder 中的定时器给取消掉。

```javascript
let handler;
let startX, startY;
let isPan = false;

let start = point => {
  (startX = point.clientX), (startY = point.clientY);

  isPan = false;

  handler = setTimeout(() => {
    console.log('pressstart');
  }, 500);
};

let move = point => {
  let dx = point.clientX - startX,
    dy = point.clientY - startY;

  let d = dx ** 2 + dy ** 2;

  if (!isPan && d > 100) {
    isPan = true;
    console.log('pan-start');
    clearTimeout(handler);
  }

  if (isPan) {
    console.log(dx, dy);
    console.log('pan');
  }
};
```

### Tap 事件

![](https://img-blog.csdnimg.cn/20201116174345237.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1RyaURpYW1vbmQ2,size_16,color_FFFFFF,t_70#pic_center)

Tap 的这个逻辑我们可以在 end 事件里面去检查。首先我们默认有一个 `isTap` 等于 true 的状态，如果我们触发了 pan 事件的话，那就不会去触发我们的 tap 的逻辑了，所以 tap 和 pan 是互斥的关系的。但是为了不让它们变得很耦合，所以我们不使用原有的 isPan 作为判断状态，而是另外声明一个 `isTap` 的状态来记录。

这里我们 tap 和 pan 都有单独的状态，那么我们 press 也不例外，我们也给 press 加上一个 `isPress` 的状态，它的默认值是 false。如果我们 0.5 秒的定时器被触发了，`isPress` 也就会变成 true。

既然我们给每个事件都加入了状态，那么这里我们就给每一个事件触发的时候设置好这些状态的值。

- **press 时**
  - isTap = false
  - isPan = false
  - isPress = true
- **pan 时**
  - isTap = false
  - isPan = true
  - isPress = false
- **tap 时**
  - isTap = true
  - isPan = false
  - isPress = false

如果我们发现用户没有移动，也没有按住触屏超过 0.5 秒，当用户离开屏幕时就会调用 end 函数，这个时候我们就可以认定用户的操作就是 tap。这里我们要注意的是，我们 press 的 0.5 秒定时器是没有被关闭的，所以我们在 isTap 的逻辑中需要 `clearTimeout(handler)`。

说到取消 press 定时器，其实我们 handler 的回调函数中，也需要做一个保护代码逻辑，在触发了 press-start 之后，我们需要保证每次点击屏幕只会触发一次，所以在 setTimout 的回调函数中的最后，我们需要加上 `handler = null`。这样只要 press-start 触发了，就不会再被触发。

```javascript
let handler;
let startX, startY;
let isPan = false,
  isPress = false,
  isTap = false;

let start = point => {
  (startX = point.clientX), (startY = point.clientY);

  isPan = false;
  isTap = true;
  isPress = false;

  handler = setTimeout(() => {
    isPan = false;
    isTap = false;
    isPress = true;
    console.log('press-start');
    handler = null;
  }, 500);
};

let move = point => {
  let dx = point.clientX - startX,
    dy = point.clientY - startY;

  let d = dx ** 2 + dy ** 2;

  if (!isPan && d > 100) {
    isPan = true;
    isTap = false;
    isPress = false;
    console.log('pan-start');
    clearTimeout(handler);
  }

  if (isPan) {
    console.log(dx, dy);
    console.log('pan');
  }
};

let end = point => {
  if (isTap) {
    console.log('tap');
    clearTimeout(handler);
  }
};
```

### End 事件

到了最后这里我们要处理的就是所有的结束时间，包括 `press-end` 和 `pan-end`。

这两个 end 事件都会在 end 函数中判断所得，如果在用户操作的过程中触发了 `pan-start` 或者 `press-start` 事件，到了 end 函数这里，对应的状态就会是 true。

所以我们对 end 函数做了以下改造：

```javascript
let end = point => {
  if (isTap) {
    console.log('tap');
    clearTimeout(handler);
  }

  if (isPan) {
    console.log('pan-end');
  }

  if (isPress) {
    console.log('press-end');
  }
};
```

最后我们需要再 cancel 事件触发的时候，清楚掉 press 事件的 setTimeout。既然我们的操作被打断了，那也不可能会触发我们的长按事件了。

```javascript
let cancel = point => {
  clearTimeout(handler);
  console.log('cancel');
};
```

> 我们除了 `flick` 的逻辑，我们已经完成所有手势库里面的事件了。并且也能正确的区分这几种手势操作了。

### 全局变量改造

我们来想想一个代码中的问题，我们的 `handler`、`startX`、`startY`、`isPan`、`isPress`、`isTap` 都放入全局作用域之中了，那么这些变量是放在全局当中是否是正确的呢？

其实我们忽视一些情况。如果我们从触屏的角度去考虑，我们就会有多个 touch 的情况。如果我们从鼠标点击的角度去考虑，那么它就有可能有左右键的区分。在这种场景下我们把这些变量放在全局就显然是不对的，因为我们这些状态和变量需要适应不用的场景而定的。

那么我们应该放在哪里呢？显然除了全局以外我们也只有一种选项，就是在函数调用的时候添加多一个 `context` 对象参数。那么 `context` 对象中就会有我们上面所有的属性。

首先我们把所有调用到这些变量的地方，在变量名前面加入 `context.` 。

改好了原有变量的调用方式之后，我们就要来想想，我们要怎么存储这个 context 对象，并且如何把属性插入进去和获取出来传给这些函数。

首先我们来看看**触屏的事件**怎么改：

- **支持多触点/按键**
  - 像我们之前说的，我们可能有多个触点同时触发，或者多个鼠标按键行为
  - 所以我们是需要把所有的 context 都存储起来的。
  - 那么我们就在全局当中建立一个 `contexts` 数据结构，这里我们使用 `Map` 数据结构来存储。
- **构建 context**
  - context 需要在第一个触发的 touchstart 事件中生成，这里我们直接生成一个空对象即可
  - 然后把新生成的 context 加入到 contexts 阵列中，唯一值就用触点的 `identifier`
  - 最后在 start 函数调用时传入 context
- **获取 context**
  - 我们在 touchstart 中生成了 context，那么我们在其他事件中就要把 context 取出
  - 这里我们使用每个事件中循环得到的 touch 触点的 identifier 去取得对应的 context
  - 最后把 context 传入事件调用函数
- **清楚 context**
  - 在事件结束的时候，我们是需要去从 contexts 阵列中回收对应的 context 的
  - 我们触屏的结束事件有两个，一个是 touchend，一个是 touchancel
  - 在这两个事件中，我们需要调用 `contexts.delete(touch.identifier)` 来清楚对应的 context

```javascript
let contexts = new Map();

element.addEventListener('touchstart', event => {
  let context = Object.create(null);
  contexts.set(event.identifier, context);

  for (touch of event.changedTouches) {
    start(touch, context);
  }
});

element.addEventListener('touchmove', event => {
  for (touch of event.changedTouches) {
    let context = contexts.get(touch.identifier);
    move(touch, context);
  }
});

element.addEventListener('touchend', event => {
  for (touch of event.changedTouches) {
    let context = contexts.get(touch.identifier);
    end(touch, context);
    contexts.delete(touch.identifier);
  }
});

element.addEventListener('cancel', event => {
  for (touch of event.changedTouches) {
    let context = contexts.get(touch.identifier);
    cancel(touch, context);
    contexts.delete(touch.identifier);
  }
});
```

这样我们触屏的事件都改好了，接下来我们来看看鼠标事件需要怎么修改。

- **鼠标拖拽条件**
  - 鼠标的拖拽我们可以让它只支持左键拖拽
  - 这样的话我们就在调用 start 之前判断一下左键是否被按下就可以了
  - 在我们浏览器的模型里面它至少支持 5 个键的 down 点击和 up 松开行为，包括 左键、右键、中建、前进、后退
  - 所以如果我们想把 5 个键分开处理，例如左键拖拽，右键拖拽等等，我们是可以在 mouse 的事件里面去实现的
  - 那么这些按键怎么判断呢？这里我们就要科补一下了，其实 `event` 中有一个 `button` 属性，这个属性会是一个 01234 这样的数值，它表示的是我们按下的是哪一个键，最常用的有以下几项：
    - `0` 为 左键点击
    - `1` 为 中键点击
    - `2` 为 右键点击
  - 所以这里我们用 `event.button == 0` 作为判断右键点击即可
- **构建 context**
  - 与触屏一样，我们使用 `Object.create(null)` 创建一个空对象，这样创建对象是一个非常好的习惯，这样表示我们要用这个对象做一个 `k-v`（key-values）的匹配关系。同时也可以避免 object 上原始的属性跳出来添乱。
  - 然后就是把新创的 context 插入到 contexts map 中，但是在 mouse 事件中 event 是没有 identifier 这个属性的，所以为了我们插入 contexts 中的 context 保持唯一，并且和触屏类的 context 区分开，这里我们就使用 `mouse` + `event.button` 这样的 key 格式来存储。
  - mousedown 事件中我们确实能使用 mouse + 按键类型作为唯一值，但是在 mosuemove 的时候，这个事件是不区分按键的。因为无论我们按了那个按钮，甚至同时按了多个按键我们都是可以移动鼠标的。所以 mousemove 的 event 中没有 `button` 属性，不过是有 `buttons` 属性的。buttons 里面含有所有当前移动状态下有被按下的多个按键。
  - 这个 `buttons` 存储的内容是用了一个非常古典的设计，叫做掩码。掩码就是用二进制来表示的：
    - **左键** 的二进制码： `0b00001`
    - **右键** 的二进制码： `0b00100`
    - **中键** 的二进制码： `0b00010`
    - 大家看出了规律了吗？是的，这个二进制码就是从后到前开始标记的，最后一位数就是我们 button 里面的 0 也就是左键，往前一位就是 1 也就是中键，再往前就是 2 也就是右键，以此类推
  - 既然 mousemove 事件中的 buttons 是使用掩码的，那么我们也只能用适应，使用掩码的形式去处理它。
