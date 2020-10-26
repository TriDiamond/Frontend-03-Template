# Proxy 与双向绑定

同学们好，我是来自《技术银河》的 三钻。

我们的博客：

- infoQ:https://www.infoq.cn/profile/836632354C24AF/publish/all
- CSDN：https://blog.csdn.net/TriDiamond6
- 掘金：https://juejin.im/user/1873223546578589
- 知乎：https://www.zhihu.com/people/tridiamond

欢迎来围观哦~

这里要给同学们分享的是 Proxy 与双向绑定，我们对大部分的 JavaScript 的这种基础库其实已经在其他文章中做过一些讲解了，或者是在我们编程的时候有所接触了。唯有这个 Proxy 我们之前是非常的回避的，因为在业务中也不太推荐大量的使用 Proxy。

Proxy 的设计其实是一种，强大且危险的一种设计。因为应用了 Proxy 的一些代码，它的 "预期性" 会变差，所以 proxy 这个特性是专门为底层库而设计的。

## Proxy 基本用法

这里我们就一起学习一下 proxy 的基本用法，在后面我们会一起实现一下 `Vue 3.0` 的 `reactive` 的模型。当然这里实现的 `reactive` 并不是一个生产可用的代码，只是写一个概念版或者是玩具版的一个 `reactive`。主要还是用它去认识和学习一下 proxy 有哪些强大的用途。

这里我们边写代码边了解 Proxy 的一个整体特性。首先我们先创建一个 `object`，然后我们给这个 `object` 一些属性。

```javascript
let object = {
  a: 1,
  b: 2,
};
```

现在如果我们去访问这个 `object` 的 `a` 属性和 `b` 属性，这个中间其实是有一个获取过程，但是在 JavaScript 的底层是一个写死的方法，也就是说我们无法去干预或者监听这个获取对象属性的过程的代码。

那么这个 `object` 它就是一个不可 `observe (观察)` 的一个对象，所以就是一个单纯的数据存储。这也是 JavaScript 最底层的机制，我们是没有办法去改变的。

> 那么如果我们想有一个对象，我们既想它拥有普通对象一样的特性，又想让它能够被监听，那么我们可以怎么做呢？这个时候我们就可以通过一个 `proxy` 来给 `object` 做一层包裹。

那么接下来我们就用 proxy 来实现一个这样的对象。

- 首先我们需要创建一个 `Proxy()`
- 并且第一个参数需要把我们的 `object` 传进去
- 然后第二个参数是一个 `config` 的配置对象
- 这个 `config` 对象里面就包含了所有的我们针对 `proxy` 对象的`钩子`
- 这里我们就做一个最简单的钩子 `set` —— 当我们去设置对象的一个属性的时候就会触发我们的 `set` 函数
- 这个 `set` 函数会接收我们`当前对象`、`属性名`、`属性值`等三个参数

```javascript
let object = {
  a: 1,
  b: 2,
};

let po = new Proxy(object, {
  set(obj, prop, val) {
    console.log(obj, prop, val);
  },
});
```

这个时候我们把这个代码在浏览器运行一下，这里我们运行一个 `po.a = 6`。

![](https://img-blog.csdnimg.cn/2020102521265263.png#pic_center)

这里同学们可以看到，如果 `po` 是一个普通对象的话这里应该什么代码都不会去执行的，除非 `a` 它本身就是一个 `setter`。但是在我们编写的这个 `proxy` 对象上，不管我们去设置哪一个属性，都会运行我们的 `set` 函数，并且获得不一一样的值。

我们来尝试设置一个 `po` 对象中没有的属性看看。

![](https://img-blog.csdnimg.cn/20201025213305653.png#pic_center)

首先 proxy 跟 getter 和 setter 最主要的一个区别就是，proxy 对象上即使我们设置一个没有的属性，它也会默认触发这个 set 的方法。

我们的 proxy 里面不只提供了 `get`、`set` 这些属性的钩子，其实里面还可以拦截并且改变原生的操作或者是对对象进行操作的内置函数的行为。

<img src="https://img-blog.csdnimg.cn/20201025213720690.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1RyaURpYW1vbmQ2,size_16,color_FFFFFF,t_70#pic_center" style="zoom: 33%;" />

如果我们上 [MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy) 的网站上是可以看到所有 proxy 所支持的钩子。这里列出了我们可以对 `apply`、`construct`、`defineProperty`、`deleteProperty` 等等这一系列的内置或者原生的操作惊醒拦截并且改变它们的行为。**所以说 `proxy` 对象是一个非常强大的对象**。

回到我们的例子中，我们 `proxy` 实际上就是代理了 `object` 这个对象。如果我们去调用原始的 `object`上的值，并不会触发 `proxy` 上 `hook (钩子)` 里面的函数的。

只有使用我们的 `po`（也就是我们定义的一个 `object` 对象的 `proxy` 代理对象） 才会最后去执行到 proxy 对象的拦截行为，而 object 还是原来的 object。

> 所以我们可以把 `po` 理解成一个特殊的对象，而 `po` 上面所有的行为都是可以被重新去指定的。这个也就是为什么我们一开始的时候会说，object 中使用了 proxy 之后对象行为的可预测性就会降低。因为我们看到的一个代码，比如 `po.a = 6` 在执行的时候也许背后就做了一系列很复杂的操作，这些我们是不会知道的。所以 proxy 的这个特性是一个非常危险的特性。

接下来我们来看看 Proxy 的一些应用。

## 模仿 Reactive 实现原理

这里我们尝试给对象做一个简单的包装。 Vue 3.0 其中一个改动就是把 Vue 原来的能力拆了一个包，产生了一个叫` reactive` 的这一个单独的包。

`Reactive` 是一个 Vue 3.0 中非常好的一个东西，这里我们就尝试去模仿一下它在 Vue 中的实现原理。如果有看过 Vue 3.0 源码的同学应该都会知道，Vue 3.0 中的 `reactive` 是使用 `proxy` 来实现的。

那么我们就来一起实现一个玩具版的 reactive 的小练习，从而然我们更能了解 proxy 的实际应用场景。

首先我们要知道，一般对 proxy 的使用，都是会对对象做某种监听或者是改变他行为的事情。所以说我们对 proxy 的封装是没有想我们这样直接用 `new Proxy` 这样的。我们都会把它包进一个函数里面，跟我们的 `Promise` 比较类似。

### 封装 reative 函数

所以这里我们先来实现一个包裹起来的 `reactive` 函数：

- `reactive` 函数会接收一个 `object` 作为参数
- 然后我们的 `proxy` 对象就是这个函数的返回值
- 之前的 `Proxy` 的 `config` 中我们写了 `set`， 这里我们加上一个 `get` 方法
- 然后我们就可以把 `po` 改为使用 `reactive(object)` 来监听它所有的属性相关的操作了

```javascript
let object = {
  a: 1,
  b: 2,
};

let po = reactive(object);

function reactive(object) {
  return new Proxy(object, {
    set(obj, prop, val) {
      console.log(obj, prop, val);
    },
    get(obj, prop) {
      console.log(obj, prop);
    },
  });
}
```

> 就是这样我们就把 `new Proxy` 给包装起来了，我们可以看到如果我们想去包装多个 `object` 的话就可以继续去复用这个 `reactive` 的代码。

然后我们来看看在浏览器中运行的效果：

这里我们执行以下 `po.a = 666`

![](https://img-blog.csdnimg.cn/20201025222924766.png#pic_center)

这里我们就可以得到 `set` 函数中的 `console.log` 打印出来的内容了。但是这里面其实还有一个问题，如果我们在 console 中答应 object ，就会发现我们的 object 原来它并没有变化。就是我们执行的 `po.a = 666` 并没有在 object 中生效。

![](https://img-blog.csdnimg.cn/20201025223319344.png#pic_center)

所以这里我们需要在 `set` 函数中把这个执行改变的代码加上，让它实际的去操作这个 object 改变的行为。然后我们同时可以把 `get` 的功能也实现了。

```javascript
let object = {
  a: 1,
  b: 2,
};

let po = reactive(object);

function reactive(object) {
  return new Proxy(object, {
    set(obj, prop, val) {
      obj[prop] = val;
      console.log(obj, prop, val);
      return obj[prop];
    },
    get(obj, prop) {
      console.log(obj, prop);
      return obj[prop];
    },
  });
}
```

这时候我们执行 `po.x = 666`，我们就会发现原始被代理的对象 object 上面已经添加了新的属性 `x`，同样我们也是可以去改原来的变量的，如果我们执行 `po.b = 777` 那么 object 中的属性也会跟着发生变化。

![](https://img-blog.csdnimg.cn/20201025223937810.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1RyaURpYW1vbmQ2,size_16,color_FFFFFF,t_70#pic_center)

这里我们就实现了一个 `po` 对 `object` 的一个完全的代理，当然如果我们想真正做一个完整的代理我们是需要把 proxy 中所有的 hook 都要考虑清楚。因为有的时候我们去访问一个对象或者改变一个对象的时候，其实并不是说通过这种表面的 `get`、`set` 的属性的方式去访问的。

我们还是可以通过一些内置的方法，比如说 `defineProperty`需要对我们的对象发生作用，这个时候我们就需要把所有的 hook 都补全了。

但是我们可以忽略一些 hook 不去处理，比如说 `apply` 和 `construct`，因为它们管的是用 `new` 去调用这个对象和对象后面加圆括号产生的结果。

学习到这里我们已经获得了一个基本的，能够代理 `object` 行为并且可以去监听 `object` 的所有设置属性或者改变属性的行为的一个 proxy 对象。

接下来我们一起来尝试给他再加入以下真正的 reactive 的特性，让事件可以变得可以监听。

### 实现事件监听

我们有了 reactive 这样一个函数之后，我们可以考虑以下如何去监听。当然我们可以给 `po` 上面去加 `addEventListener` 类似的操作，但是在 Vue 当中他们用了一个特别有意思的 API。

就是我们可以直接通过 `effect` 传一个函数进入来监听 `po` 上面的一个属性，以此来代替这个事件监听的机制。那么下面我们来尝试实现一个 "粗糙版"。

- 因为这个 `effect` 是接收一个回调函数的，所以我们这里需要再写一个 `effect` 函数
- 然后我们的 `effect` 函数需要接收一个 `callback` 参数
- 我们需要一个全局的 `callbacks` 数组变量来储存我们所有的 callback 函数
- 在 `effect` 函数中我们把传入进来的 callback 函数给 push 到我们的 callback 数组中储存起来
- 这样的话，我们在 `set` 的时候就直接遍历 `callbacks`并执行里面所有的回调函数即可

```javascript
// 回调函数储存组数
let callbacks = [];

let object = {
  a: 1,
  b: 2,
};

let po = reactive(object);

/**
 * effect 函数
 * @param {Function} callback 回调函数
 * @return void
 */
function effect(callback) {
  callbacks.push(callback);
}

// 加入一个监听事件
effect(() => {
  console.log('effected a : ', po.a);
});

/**
 * reactive 相应函数
 * @param {Object} object
 * @return Object
 */
function reactive(object) {
  return new Proxy(object, {
    // 对象赋值
    set(obj, prop, val) {
      obj[prop] = val;

      // 调用所有监听回调函数
      for (let callback of callbacks) {
        callback();
      }

      return obj[prop];
    },
    // 对象取值
    get(obj, prop) {
      console.log(obj, prop);
      return obj[prop];
    },
  });
}
```

这个就是一个非常粗糙的实现了 reactive 中属性的监听事件。接下来我们来看看实际效果如何：

![](https://img-blog.csdnimg.cn/20201025231209386.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1RyaURpYW1vbmQ2,size_16,color_FFFFFF,t_70#pic_center)

这里可以看到我们加入的 `effect()` 回调函数确实被执行了。如果我们只考虑实现的正确性，而不考虑性能的话我们就已经完成了 `reactive` 的操作。但是这个里面显然它有一个严重的性能问题的，比如说我们有 100 个对象，并且给 100 个对象设置了 100 个 effect，那么每次执行一遍就要调一万遍。因为每次它都把我们全局变量 `callbacks` 中记录的回调函数都执行一遍。

显然我们实现的这个 `reactive` 只是一个中间步骤，它并不是一个最终结果。那么我们接下来就去尝试解决这个问题，看看能不能做到仅传一个函数就能让它只有在对应的变量变化的时候，触发这个函数的调用。

### 建立 reactive 与 effect 连接

上一部分我们建立了对象属性的监听，这里我们给 `reactive` 对象属性和 `effect` 函数之间建立独立的连接。之前我们的 `effect` 函数与我们 `reactive`对象属性是没有一对一的关系的。这样 100 个对象就会绑定 100 `effect`，所以这里就会有一个性能隐患。

也就是说如果我们监听了 `po.a` 的话，当我们执行 `po.a = 2` 的时候，我们的 `effect` 回调函数就会被执行。但是如果我们执行的是 `po.b = 3`时，就不应该执行我们的 `effect` 函数，因为 `po.b` 并没有被监听。

如果我们想实现这样的效果，我们就需要一个`对象属性`与`effect` 之间的依赖关系，它们之间有一个一对一的关联关系，互相响应。

让我们先来尝试一下建立一个 `userReactivities` 来储存我们的监听对象属性。

- 首先我们需要准备一个 `usedReactivities` 的全局变量，来储存我们需要监听的对象和对象的属性
- 接着我们尝试在 `effect` 里面去调用一次这个代理对象的属性，比如 `po.a`，这样就触发了这个属性的监听，因为我们调用了 `po.a`，也就是一个获取变量值的动作，所以这里就会调用到我们 `reactive` 中的 `get`。这里我们把对象和对象属性都注册进入 `usedReactivies` 这个变量里面
- 然后我们改造一下我们的 `effect` 函数，在这里我们首先需要清除一次我们的 `usedReactivities`，保证每次注册的时候都是全新的，这样才会清除掉之前监听的对象属性。

```javascript
// 回调函数储存组数
let callbacks = [];
// 使用过得函数属性
let usedReactivities = [];

let object = {
  a: 1,
  b: 2,
};

let po = reactive(object);

/**
 * effect 函数
 * @param {Function} callback 回调函数
 * @return void
 */
function effect(callback) {
  // callbacks.push(callback);
  usedReactivities = [];
  callback();
  console.log(usedReactivities);
}

// 加入一个监听事件
effect(() => {
  console.log('effected a : ', po.a);
});

/**
 * reactive 相应函数
 * @param {Object} object
 * @return Object
 */
function reactive(object) {
  return new Proxy(object, {
    // 对象赋值
    set(obj, prop, val) {
      obj[prop] = val;

      // 调用所有监听回调函数
      for (let callback of callbacks) {
        callback();
      }

      return obj[prop];
    },
    // 对象取值
    get(obj, prop) {
      usedReactivities.push([obj, prop]);
      return obj[prop];
    },
  });
}
```

![](https://img-blog.csdnimg.cn/20201026003403617.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1RyaURpYW1vbmQ2,size_16,color_FFFFFF,t_70#pic_center)

这里我们可以看到，在 effect 被调用的时候，我们的对象和对续属性都被正确的注入到 `usedReactivities` 之中。这里我们只是做了一个简单的对象和对象属性的存储，并不能让我们建立对象属性与 `effect` 函数的依赖关系。我们需要另外把所有 `callbacks` 储存起来，从而让他们与我们的对象属性建立依赖关系。

- 接下来我们可以使用 `callbacks` 这个全局变量来存储我们的依赖关系，所以这里我们就需要把它改造成一个 `new Map()` 来存，因为我们需要把 `object` 对象作为一个 `key`，这样我们才可以用它来找到对应的 `reactivities` （对象属性的对应 callback 函数）。
- 然后我们就可以去改造我们的 `effect` 函数，在我们调用了 `callback()` 之后，我们的 `usedReactivites` 中就会拥有我们需要监听的对象和对象属性了。接着我们就需要注入我们的对象属性与 effect 依赖关系到 `callbacks` 里面。
- 我们的 `对象属性` 与 `effect` 的依赖数据是以**对象和对象属性**为 key，**key** `[0]` 是我们的**对象**，**key** `[1]` 是我们的**对象属性**，我们的 **value** 就是我们的 `callback` **回调函数**
- 有了这个依赖关系，我们就需要在 `reactive` 触发 `set` 的时候根据当前对象和对象属性找到对应的 `callback` 函数来执行，如果找不到就是这个对象属性没有被监听，不需要执行回调函数。

```javascript
// 回调函数储存组数
let callbacks = new Map();
// 使用过得函数属性
let usedReactivities = [];

let object = {
  a: 1,
  b: 2,
};

let po = reactive(object);

/**
 * effect 函数
 * @param {Function} callback 回调函数
 * @return void
 */
function effect(callback) {
  // callbacks.push(callback);
  usedReactivities = [];
  callback();

  for (let reactivity of usedReactivities) {
    if (!callbacks.has(reactivity[0])) {
      callbacks.set(reactivity[0], new Map());
    }

    if (!callbacks.has(reactivity[1])) {
      callbacks.get(reactivity[0]).set(reactivity[1], []);
    }

    callbacks.get(reactivity[0]).get(reactivity[1]).push(callback);
  }
}

// 加入一个监听事件
effect(() => {
  console.log('effected a : ', po.a);
});

/**
 * reactive 相应函数
 * @param {Object} object
 * @return Object
 */
function reactive(object) {
  return new Proxy(object, {
    // 对象赋值
    set(obj, prop, val) {
      obj[prop] = val;

      if (callbacks.get(obj))
        if (callbacks.get(obj).get(prop))
          // 调用所有监听回调函数
          for (let callback of callbacks.get(obj).get(prop)) {
            callback();
          }

      return obj[prop];
    },
    // 对象取值
    get(obj, prop) {
      usedReactivities.push([obj, prop]);
      return obj[prop];
    },
  });
}
```

![](https://img-blog.csdnimg.cn/20201026143142150.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1RyaURpYW1vbmQ2,size_16,color_FFFFFF,t_70#pic_center)

最后我们在浏览器中运行，我们就会发现执行 `po.a=3` 触发了我们 `effect` 回调函数，但是 `po.b=6` 并没有触发。这个就是我们想要的效果了，但是我们的代码还是写的比较粗糙的，也没有考虑到解除的效果。不过我们这段代码已经演示了 `reactivity` 的实现原理。

### 优化 reactive

到了这里我们的 `effect` 和 `reactive` 已经可以跑起来了，但是其实里面还是有一些小问题的。

比如说现在我们的 object 中的 `a` 也是一个对象：

```javascript
let object = {
  a: { b: 3 },
  b: 2,
};
```

然后我们在 `effect` 里面，调用了 `po.a.b` 这样的练级对象调用，那么这个对象它是一个监听不到 `a` 里面的 `b` 属性的。

所以说我们有必要对它再进行一些处理，让它能够支持 `po.a.b` 这种形式的调用。要满足这样的功能，我们就要对 `reactive` 的 `get` 和 `set` 有一定的要求。

当我们 `get` 中的 `obj[prop]` 是一个对象的时候，我们就需要给它套一个 `reactivity`。也就是说当我们检测到 `prop` 是一个 object 的话，我们就给它返回一个 `reactive(obj[prop])`。

那么我们来改造一下 `reactive` 中的 `get` 方法：

```javascript
/**
 * reactive 相应函数
 * @param {Object} object
 * @return Object
 */
function reactive(object) {
  return new Proxy(object, {
    // 对象赋值
    set(obj, prop, val) {
      obj[prop] = val;

      if (callbacks.get(obj))
        if (callbacks.get(obj).get(prop))
          // 调用所有监听回调函数
          for (let callback of callbacks.get(obj).get(prop)) {
            callback();
          }

      return obj[prop];
    },
    // 对象取值
    get(obj, prop) {
      usedReactivities.push([obj, prop]);

      if (typeof obj[prop] === 'object') return reactive(obj[prop]);

      return obj[prop];
    },
  });
}
```

这样的改造虽然是可以我们对象中的对象也被代理了，但是我们会法出现一个问题，就是我们的 `reactive` 是会返回一个新的 `proxy` 的。那就意味着，`po.a.b` 拿到的 `proxy` 和 `po.a` 不是同一个 `proxy`。

所以这里我们就需要把 `proxy` 对象放入一个全局的暂存变量里面，方便我们调用的时候在缓存数据里面重新拿出来。我们就声明一个 `reativities` ，默认值为 `new Map()`。

当每个对象去调用 `reactivity` 的时候，我们会加一个缓存，因为 `proxy` 本身它是不存储任何状态的，而所有的状态都会代理到 `object` 上。某种意义上讲 `reactive` 其实是一个无状态的函数，所以我们可以对它进行缓存。

我们就在 `reactive` 的函数开始的位置，加入一个判断，如果我们缓存变量 `reactivies` 中有这个 `object`，我们就直接返回。如果没有我们就执行我们的新 `proxy` 生成并且把它存入 `reactivies` 。

好，我们来看看代码是怎么实现的。

```javascript
// 这个callbacks是一个依赖收集而已
// 它表示的是，某个object的某个prop，被一些函数使用了。
// 我们把这些函数存在一个array里。通过 callbacks.get(object).get(props),
// 我们就能拿到这些函数
let callbacks = new Map();

// reactivities 只是保存了object和它对应的proxy的k-v关系。
let reactivities = new Map();

// useReactivities是当我们初次调用effect(callback)的时候，
// 会先初始化运行一次callback，然后把依赖关系暂存在useReactivities
// 这个数组里面。暂存的格式是像下面这样：
/**
  [
    [对象A，对象A被依赖的某个属性]，
    [对象B，对象B被依赖的某个属性]，
    [对象C，对象C被依赖的某个属性]，
    ...
  ]
  **/
let usedReactivities = [];

let object = {
  a: { b: 3 },
  b: 2,
};

let po = reactive(object);

/**
 * effect 函数
 * @param {Function} callback 回调函数
 * @return void
 */
function effect(callback) {
  // callbacks.push(callback);
  usedReactivities = [];
  callback();

  for (let reactivity of usedReactivities) {
    if (!callbacks.has(reactivity[0])) {
      callbacks.set(reactivity[0], new Map());
    }

    if (!callbacks.has(reactivity[1])) {
      callbacks.get(reactivity[0]).set(reactivity[1], []);
    }
    console.log('123', callbacks);

    callbacks.get(reactivity[0]).get(reactivity[1]).push(callback);
  }
}

// 加入一个监听事件
effect(() => {
  console.log('effected a.b : ', po.a.b);
});

/**
 * reactive 相应函数
 * @param {Object} object
 * @return Object
 */
function reactive(object) {
  if (reactivities.has(object)) return reactivities.get(object);

  let proxy = new Proxy(object, {
    // 对象赋值
    set(obj, prop, val) {
      obj[prop] = val;

      if (callbacks.get(obj))
        if (callbacks.get(obj).get(prop))
          // 调用所有监听回调函数
          for (let callback of callbacks.get(obj).get(prop)) {
            callback();
          }

      return obj[prop];
    },
    // 对象取值
    get(obj, prop) {
      usedReactivities.push([obj, prop]);

      if (typeof obj[prop] === 'object') return reactive(obj[prop]);

      return obj[prop];
    },
  });

  reactivities.set(object, proxy);

  return proxy;
}
```

这样我们就完成了 `reactive` 的逻辑，我们来看看实际效果是否正确。

![](https://img-blog.csdnimg.cn/20201026153551781.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1RyaURpYW1vbmQ2,size_16,color_FFFFFF,t_70#pic_center)

这里我们可以看到，无论是我们直接去改变级联对象中的 `b` ，还是给 `a` 重新赋值一个 `{b: 66}` 都是可以触发我们的 `effect` 回调函数的。

这就意味着我们最后的 function 已经能够成功地调用和执行了。到这里为止我们的 `proxy` 和 `reactive` 的实现和基本的模型就已经有了。当然还有很多细节，是需要我们用大量的 test case 去保证一些边缘的情况的。如果大家想看看一个真正完成的 `reactivity` 这个库是怎么写的，那么我们可以参考 Vue 的源代码。大家就可以看到这个代码量是我们这个的好几倍不止。

所以讲原理和实际操作还是有比较大的区别的，希望大家在学习的时候都理解这一点，要不然我们直接把这些代码拿过去生产使用，那就要出问题了。

## Reactive 响应式对象

接下来我们来考虑以下 `Reactive` 到底有什么应用场景。这个也是很多同学在 Vue 3.0 出来了以后，在疯狂的问的一个问题。

> 其实 `Reactive` 它是一个半成品的双向绑定，它可以负责从数据到 DOM 元素这一条线的监听。从 DOM 元素到数据的这一条线的监听其实很简单，因为 DOM 元素本来就有事件。然后任何的原生输入都可以代理到这个 `reactive` 的代理里面。

我们接下来就考虑一个实际的例子，这里我们来做一个输入的单向绑定来看看。

- 我们给我们之前实现的 `reactive` 中加入一个 `input` 元素
- 我们给这个 `input` 绑上一个 `id="r"`
- 改造一下我们的 `object` 数据结构
- 在我们的 `effect` 当中加入单向绑定（从数据到 input）

```html
<input type="text" id="r" />

<script>
  let callbacks = new Map();
  let reactivities = new Map();
  let usedReactivities = [];

  let object = {
    r: 1,
  };

  let po = reactive(object);

  // 加入一个监听事件
  effect(() => {
    // 加入了单向数据绑定
    document.getElementById('r').value = po.r;
  });

  /**
   * effect 函数
   * @param {Function} callback 回调函数
   * @return void
   */
  function effect(callback) {
    usedReactivities = [];
    callback();

    for (let reactivity of usedReactivities) {
      if (!callbacks.has(reactivity[0])) {
        callbacks.set(reactivity[0], new Map());
      }

      if (!callbacks.has(reactivity[1])) {
        callbacks.get(reactivity[0]).set(reactivity[1], []);
      }

      callbacks.get(reactivity[0]).get(reactivity[1]).push(callback);
    }
  }

  /**
   * reactive 相应函数
   * @param {Object} object
   * @return Object
   */
  function reactive(object) {
    if (reactivities.has(object)) return reactivities.get(object);

    let proxy = new Proxy(object, {
      // 对象赋值
      set(obj, prop, val) {
        obj[prop] = val;

        if (callbacks.get(obj))
          if (callbacks.get(obj).get(prop))
            // 调用所有监听回调函数
            for (let callback of callbacks.get(obj).get(prop)) {
              callback();
            }

        return obj[prop];
      },
      // 对象取值
      get(obj, prop) {
        usedReactivities.push([obj, prop]);

        if (typeof obj[prop] === 'object') return reactive(obj[prop]);

        return obj[prop];
      },
    });

    reactivities.set(object, proxy);

    return proxy;
  }
</script>
```

然后我们在浏览器运行时，我们会看到 input 中的数字是 `1`，然后在 `console` 中输入 `po.r = 10`，我们就会发现数据会被同步到我们的 input 中。

![](https://img-blog.csdnimg.cn/20201026163150861.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1RyaURpYW1vbmQ2,size_16,color_FFFFFF,t_70#pic_center)

就是这样我们就已经实现了初步的数据绑定了。那么如果我们想实现 `双向绑定`需要怎么做呢？其实也很简单，我们只需要加入 `addEventListener` 即可实现双向绑定。

在我们的 `effect` 调用的后面加入下面一行代码即可：

```javascript
/** ... 代码省略 ... **/

// 加入一个监听事件
effect(() => {
  // 加入了单向数据绑定
  document.getElementById('r').value = po.r;
});
// 数据双向绑定 （从 input 到数据）
document.getElementById('r').addEventListener('input', event => (po.r = event.target.value));

/** ... 代码省略 ... **/
```

这个时候我们回到我们的浏览器，在 input 中尝试输入数字，我们就会发现我们的 `po.r` 的值也会响应到值的变化。

接下来我们尝试实现一个 "响应的颜色选择器"：

- 我们之前已经有一个属性 `r`，现在我们在 `object` 里面补上 `b` 和 `g`。
- 也同时加上这两个单独的 input 元素，分别的 id 是 `id="b"` 和 `id="g"`
- 然后我们再多加两个 `effect` 各自给到 `b` 和 `g` 的 input 元素的。
- 给 input 元素中加入 `type="range"`，并且给他们都加上最大与最小值
- 数据双绑定的代码也要给 `b`和 `g` 加上
- 建立一个 `div` 元素，加上属性 `id="color"`，`style="width:100px; height: 100px"`
- 最后我们需要加入一个全局的 effect，这里面需要在任何 input 输入变动的时候，响应改变我们 div 盒子的背景颜色

我们来把这些逻辑写成代码：

```html
<input id="r" type="range" min="0" max="255" />
<input id="g" type="range" min="0" max="255" />
<input id="b" type="range" min="0" max="255" />
<div id="color" style="width: 100px; height: 100px"></div>

<script>
  let callbacks = new Map();
  let reactivities = new Map();
  let usedReactivities = [];

  let object = {
    r: 1,
    g: 1,
    b: 1,
  };

  let po = reactive(object);

  /**
   * effect 函数
   * @param {Function} callback 回调函数
   * @return void
   */
  function effect(callback) {
    // callbacks.push(callback);
    usedReactivities = [];
    callback();

    for (let reactivity of usedReactivities) {
      if (!callbacks.has(reactivity[0])) {
        callbacks.set(reactivity[0], new Map());
      }

      if (!callbacks.has(reactivity[1])) {
        callbacks.get(reactivity[0]).set(reactivity[1], []);
      }

      callbacks.get(reactivity[0]).get(reactivity[1]).push(callback);
    }
  }

  // 红色颜色输入值变动
  effect(() => {
    document.getElementById('r').value = po.r;
  });
  // 绿色颜色输入值变动
  effect(() => {
    document.getElementById('g').value = po.g;
  });
  // 蓝色颜色输入值变动
  effect(() => {
    document.getElementById('b').value = po.b;
  });

  // 数据双向绑定 （从 input 到数据）
  // 绑定红色输入变动
  document.getElementById('r').addEventListener('input', event => (po.r = event.target.value));
  // 绑定绿色输入变动
  document.getElementById('g').addEventListener('input', event => (po.g = event.target.value));
  // 绑定蓝色输入变动
  document.getElementById('b').addEventListener('input', event => (po.b = event.target.value));

  // 响应盒子背景颜色
  effect(() => {
    document.getElementById('color').style.backgroundColor = `rgb(${po.r}, ${po.g}, ${po.b})`;
  });

  /**
   * reactive 相应函数
   * @param {Object} object
   * @return Object
   */
  function reactive(object) {
    if (reactivities.has(object)) return reactivities.get(object);

    let proxy = new Proxy(object, {
      // 对象赋值
      set(obj, prop, val) {
        obj[prop] = val;

        if (callbacks.get(obj))
          if (callbacks.get(obj).get(prop))
            // 调用所有监听回调函数
            for (let callback of callbacks.get(obj).get(prop)) {
              callback();
            }

        return obj[prop];
      },
      // 对象取值
      get(obj, prop) {
        usedReactivities.push([obj, prop]);

        if (typeof obj[prop] === 'object') return reactive(obj[prop]);

        return obj[prop];
      },
    });

    reactivities.set(object, proxy);

    return proxy;
  }
</script>
```

![](https://img-blog.csdnimg.cn/20201026170836593.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1RyaURpYW1vbmQ2,size_16,color_FFFFFF,t_70#pic_center)

在浏览器中运行，我们就可以看到上方有三个滑块，通过拖动改变每一个滑块的值，下面的盒子的背景颜色就会根据 `r`、`g`、`b` 三个值而变化。

我们这里所写的代码，仅仅是对它的变量和值进行了一下简单的绑定关系。

如果说我们再配合一定的[语法糖](https://www.zhihu.com/question/20651624)，比如说我们的 `build compiler` 那么我们就完全可以把它变成一个零代码的双向绑定模式。

这也正是双向绑定一个强大之处，在很多时候我们交互不需要使用代码，即可实现交互。其实想想以前我们用 Jquery 做很多的交互逻辑代码，我们需要些很多的逻辑和 update 代码来实现一个交互的过程，而有了双向绑定后，我们可以花更多专注于编写 Vue 和输入的关系。

这一切都是基于我们拥有了 `reactivity` 这种响应式对象，那么 Vue 的 reactivity 包被拆出来之后，也会给大家带来更有意思的想法和实践。

# 使用 Range 实现 CSSOM 精准操作

这一部分的编程练习，我们来使用 `Range` 和 `CSSOM` 做一个综合练习。

这里我们一起来尝试实现一个简单的拖拽功能。我们一般的拖拽就是把一个在浏览器上的盒子捡起来，然后用鼠标可以拖动这个盒子到任意的位置。

那么我们今天要做的拖拽跟这个稍微有一点不一样。我们要允许这个盒子参与到我们的排版当中。意识就是说在我们的拖拽的过程中，实际是在改变他在页面上的排版的位置。

首先我们还是需要实现一个正常的拖拽。

## 基础拖拽

这里我们来开始实现一个基础的拖拽功能。

### 拖拽监听

- 创建一个 draggable 的 div 元素
- 给这个 div 赋予 属性 `id="draggable"`，一个宽高和背景颜色
- 使用 `getElementById` 获得这个 div 的 DOM 对象
- 给这个 dragable 的 div 元素加上 `addEventListener`，拖拽这个动作我们是无法使用 `drag` 事件来实现，因为我们需要的是这个盒子跟随我们的鼠标移动，所以我们要用到的是以下几个监听事件：
  - _mousedown_ —— 用于我们点击时触发
  - _mousemove_ —— 用于我们点击后拖动时候触发
  - _mouseup_ —— 用于我们松开鼠标点击时时触发

我们为了我们的拖拽能够响应 `mousemove` 和 `mouseup` 的事件，我们需要在 `mousedown` 的事件里面去监听这两个事件。

为什么我们需要在 `mousedown` 的时候去监听呢？因为只有我们的鼠标在按下去之后我们去监听这个事件才能在性能上和逻辑上都正确

1. 如果我们的 `mousemove` 写在 `mousedown` 之外，我们会发现当我们鼠标以移动，`mousemove` 就触发了。
2. 就算我们使用了一个 `flag` 来标记当前状态，让我们在 `mousedown`没有发生的情况下不去触发，但是它在性能上总是要多执行一遍这个函数。
3. 还有我们实际上 `mousemove` 和 `mouseup` 都是要在 document 上去进行监听的，如果我们在 dragable 这个 div 元素上去监听，就容易出现当我们鼠标一下拖得快，移开了 dragable 盒子的区域，那么它就会发生一个拖断的现象。

> 在现代新的浏览器上面，我们用 document 来监听，就会产生一个捕捉鼠标的效果。即使我们移出浏览器的范围外，这个事件仍然是能够接收到我们鼠标的移动信息的。

这里还有一给点需要我们注意的，就是当我们在 draggable 上的 mousedown 中监听了 mousemove 和 mouseup 之后，我们会发现我们在 mouseup 的时候，我们是要把 mousemove 和 mouseup 的监听给移出掉的。

为了可以让我们在 mouseup 的时候可以移出这两个监听，我们是需要用两个变量把 mousemove 和 mouseup 的事件监听给保存起来的。

```html
<div id="draggable" style="width: 100px; height: 100px; background-color: aqua"></div>

<script>
  let draggable = document.getElementById('draggable');

  draggable.addEventListener('mousedown', function (event) {
    let up = () => {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
    };

    let move = event => {
      console.log(event);
    };

    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
  });
</script>
```

![](https://img-blog.csdnimg.cn/20201026195609495.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1RyaURpYW1vbmQ2,size_16,color_FFFFFF,t_70#pic_center)

### 移动计算

上面的我们实现的只是鼠标动作的监听，这个时候我们点击盒子然后拖动，只会得到这些鼠标动作的事件，但是盒子并不会与我们鼠标一起移动的。

这里我们就需要用到 CSS 中的 `transform` 属性。

- 在 move 的事件中我们会触发这个 draggable 元素的 transform 属性的改变
- 我们会用到 transform 中的 translate 函数来改变元素在页面上的所在位置
- 然后 translate 里面有两个位置，一个是 x 轴，一个是 y 轴

```javascript
let move = event => {
  draggable.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
};
```

![](https://img-blog.csdnimg.cn/202010262100526.gif#pic_center)

这里我们发现有一个问题，即使我们从盒子的中间开始拖动，我们只要拖一下我们的鼠标就会固定在盒子右上角。并不是我们从哪里开始拖动，鼠标就固定在哪里。

这个是因为我们的 transform 中用到的 x 和 y 是按照鼠标的 `clientX` 和 `clientY` 的，所以它 并没有识别我们的鼠标的起始点。我们要修正这个现象，我们只需要用鼠标的起始点与 clientX 和 clientY 做一个差值即可。

那么我们就把这个逻辑加上就可以修复这个问题了。

- 在 mousedown 的时候记录鼠标 x 和 y 的起始位置
- 在计算我们 transform 的 x 和 y 的时候，用 clientX - 鼠标 X 起始点，clientY - 鼠标 Y 起始点

```javascript
let draggable = document.getElementById('draggable');

draggable.addEventListener('mousedown', function (event) {
  let startX = event.clientX,
    startY = event.clientY;

  let up = () => {
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', up);
  };

  let move = event => {
    draggable.style.transform = `translate(${event.clientX - startX}px, ${
      event.clientY - startY
    }px)`;
  };

  document.addEventListener('mousemove', move);
  document.addEventListener('mouseup', up);
});
```

![](https://img-blog.csdnimg.cn/20201026212927583.gif#pic_center)

这样我们就可以正常的拖动这个盒子了。但是我们又会发现另外一个问题，如果我们再次点击这个盒子我们会发现盒子会飞出我们鼠标的位置了。

![](https://img-blog.csdnimg.cn/20201026213204465.gif#pic_center)

问题在哪里呢？就是我们没有考虑到在我们第二次点击的时候，我们的 draggable 元素重置到了它起始的位置开始计算了，并没有考虑到我们 draggable 元素一定被偏移到的位置。

所以我们每一次点击的时候，应该在原有的 translate 属性偏移的位置上去再次移动。也就是在原有的 X，Y 位置之上叠加新的 X，Y 偏移位置。那么这里我们要再加两个变量 `baseX` 和 `baseY` 来储存我们的上一次移动到的位置。

注意着两个变量需要在我们全局的作用域里面，如果我们这个功能做成了一个模块的，那就要在这个模块的作用域下。只要在这个 mousedown 监听之外就可以了。

- 在 mousedown 之外加入两个变量 `baseX` 和 `baseY`
- 它们的默认值都是 `0`
- 在 mouseup 的时候我们去更新一下这个 baseX 和 baseY
- 在我们 translate 的地方也要加上 baseX 和 baseY 的叠加值

```javascript
let draggable = document.getElementById('draggable');

let baseX = 0,
  baseY = 0;

draggable.addEventListener('mousedown', function (event) {
  let startX = event.clientX,
    startY = event.clientY;

  let up = event => {
    baseX = baseX + event.clientX - startX;
    baseY = baseY + event.clientY - startY;
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', up);
  };

  let move = event => {
    draggable.style.transform = `translate(${baseX + event.clientX - startX}px, ${
      baseY + event.clientY - startY
    }px)`;
  };

  document.addEventListener('mousemove', move);
  document.addEventListener('mouseup', up);
});
```

![](https://img-blog.csdnimg.cn/20201026214449506.gif#pic_center)

这样我们就完成了我们的基本拖拽的盒子啦！

## 正常流中拖拽

上面我们完成了一个普通的拖拽，接下来我们就来看看怎么把这个普通的拖拽变成一个在正常流中的拖拽。

首先我们放入一些文字：

```html
<div id="container">
  三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻
  三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻
  三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻
  三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻
  三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻
  三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻
  三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻
  三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻
  三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻
  三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻
  三钻 三钻
</div>
<div id="draggable" style="width: 100px; height: 100px; background-color: aqua"></div>
```

然后我们尝试把下边的 draggable 的元素拖进这个 container 的元素之中。那么我们能怎么做呢？这里就需要用到 range 和 CSSOM 去处理了。我们一起来看看我们可以怎么使用它们。

首先如果我们想把这个 draggable 元素拖到文字之中，我们是有一个前提条件的。我们要看到这些文字它们是没有分节点的，那就意味着我们必须要用 `Range` 去找到 draggable 能拖拽到的空位。

所以我们首先就需要先建一张 `Range` 表，然后把所有能插入的空隙都列出来。

### 获取文字位置

我们来看看代码的实现思路：

- 使用 `document.getElementById`把 container 元素取出来
- 我们需要找到每一个文字的所在位置，并且给每一个文字创建一个 range
- 所以这里我们使用 `container.childNodes[0].textContent.length` 获得我们 container 里面文字的总长度
- 通过循环这个长度，我们在每一个字的位置创建一个 `Range`，这样我们就可以利用这些 Range 来拿到每一个文字所在的 X 和 Y 的位置。
- 要拿每一个文字的所在位置，我们就需要使用 CSSOM 中的 `range.getBoundingClientRect()`
- 最后我们需要把所有这些 range 保存起来，在我们后面拖拽的监听事件里面来找到盒子可以插入的位置

```javascript
let ranges = [];

let container = document.getElementById('container');

for (let i = 0; i < container.childNodes[0].textContent.length; i++) {
  let range = document.createRange();
  range.setStart(container.childNodes[0], i);
  range.setEnd(container.childNodes[0], i);

  ranges.push(range);

  console.log(range.getBoundingClientRect());
}
```

![](https://img-blog.csdnimg.cn/20201026220945170.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1RyaURpYW1vbmQ2,size_16,color_FFFFFF,t_70#pic_center)

### 寻找最近的文字

我们在上面的代码中我们给 container 里面每一个文字都创建了一个 range，并且都可以找到每一个文字的具体位置。

现在我们需要知道，当我们拖动我们的盒子到文字之中的时候，我们盒子最接近那个字的位置，并且放入那个文字的位置。

所以我们需要编写一个函数，从这些 range 里面找到某一个点最近的 range。

- 这个方法，我们需要接收一个点的 X 和 Y 值
- 然后我们 for 循环 ranges，找一个离我们黑子位置最近的一个 range
- 这个其实也不难找，这个跟我们在一堆数字里面找最大的值是一模一样的找法
- 我们就放两个变量，一个 `min=infinity` —— 因为我们要找最小的值，所以我们给的初始值是 Infinity，这样任何值都会比它小并且踢掉掉它
- 第二个 `nearest=null` ，最近的 range 一开始是没有的
- 接着我们就需要挨个 range 来计算它与我们的 X，Y 的距离，这里我们直接可以使用数学中的 $x^2 + y^2 = z^2$ 的公式
- 这里面的 x = range 所在的 x 位置 - x 位置，y = range 所在的 y 位置 - y 位置
- 而 range 的 X 和 Y 的位置，我们可以通过 `range.getBoundingClientRect()` 来获取
- 算出来的 $z^2$ 我们都可以与我们的 `min` 比较，如果小于我们的 `min` 值，就直接替换，并且记录当前的 range 到我们的 `nearest` 变量之中
- 循环结束我们就能拿到最近的 range 了

> **这里要注意一个点**，我们需要在循环的时候再去调用 `range.getBoundingClientRect()`，而不再创建 range 之后直接获得它的所在位置。这个是因为 range 是不会变得，但是界面发生变化的时候，ranges 的所在位置是会变的。所以我们要在计算距离的时候再去获取 range 此时此刻的位置。

> 还有一个地方，我们在计算当前点到 range 的距离的时候，我们是没有给结果开根号。这个是因为我们不需要获取到 z 的值，只需要获取到 $z^2$ 即可，因为开不开根号不会影响它们直接的大小关系。我们只需要找到最小值即可。

```javascript
function getNearest(x, y) {
  let min = Infinity;
  let nearest = null;

  for (let range of ranges) {
    let rect = range.getBoundingClientRect();
    let distance = (rect.x - x) ** 2 + (rect.y - y) ** 2;
    if (distance < min) {
      nearest = range;
      min = distance;
    }
  }
  return nearest;
}
```

说了一大堆，其实代码没有多少，这里我们就完成了一个找到一个离我们一个点最近的一个 range 的函数。在我们调用它之前，我们先对它进行一个简单的测试。

其实这个操作就是一种单元测试，只不过我们没有用像 Mocha、Jest 这种工具把单元测试的 case 给管理起来。

那么我们在浏览器运行，然后再 console 里面调用一下这个函数看一下：

![](https://img-blog.csdnimg.cn/20201026224920554.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1RyaURpYW1vbmQ2,size_16,color_FFFFFF,t_70#pic_center)

这里我们用 x，y 都为 0 的位置来寻找一个 range，我们的函数确实返回了一个最近的 range。然后我们使用 `.getBoundingClientRect()` 来取得这个 range 的具体位置，它的位置在 x=8，y=10。这个看起来是没有问题的。所以我们的这个获取最近 range 的方法就可以投入使用了。

### 实现正常流拖拽

这里我们终于拿到最近的文字的 Range，这样我们就可以继续完成我们的功能了。

- 首先我们需要改造我们的 move 监听回调方法
- 这里我们就不需要再改变 draggable 的 transform 属性了
- 先通过使用我们的 `getNearest` 函数，获得盒子当前位置最近的 range
- 然后我们使用 range 的 `insertNode` 方法，把我们的 draggable 盒子插入到这个文字 range 里面
- 这样我们就已经完成了这个功能了

我们来看看代码是如何实现的：

```javascript
let move = event => {
  let range = getNearest(event.clientX, event.clientY);
  range.insertNode(draggable);
};
```

![](https://img-blog.csdnimg.cn/20201026230000818.gif#pic_center)

看到我们上面的效果图，我们发现我们的盒子有被插入到文字的空隙中，但是有两个问题。第一就是盒子并不是加入如了行内，第二就是在拖动的时候会出现那种选中的状态。

接下来我们来处理掉这两个问题就完美了。

首先盒子在拖动后，没有加入好文字的行内，那是因为我们的盒子没有加上 `display: inline-block` 的属性。我们的盒子默认就是块级盒。加上这个属性我们就解决了第一个问题了。

而第二个问题，我们可以加上一个监听事件来禁止这个选中的动作。也就是 `document.addEventListener('selectstart', event => event.preventDefault)` 加上这个即可。

所以最后我们完成的代码如下：

```html
<div id="container" style="color: #ededed">
  三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻
  三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻
  三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻
  三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻
  三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻
  三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻
  三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻
  三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻
  三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻
  三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻 三钻
  三钻 三钻
</div>
<div
  id="draggable"
  style="display: inline-block; width: 100px; height: 100px; background-color: aqua"
></div>

<script>
  let draggable = document.getElementById('draggable');

  let baseX = 0,
    baseY = 0;

  draggable.addEventListener('mousedown', function (event) {
    let startX = event.clientX,
      startY = event.clientY;

    let up = event => {
      baseX = baseX + event.clientX - startX;
      baseY = baseY + event.clientY - startY;
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
    };

    let move = event => {
      let range = getNearest(event.clientX, event.clientY);
      range.insertNode(draggable);
    };

    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
  });

  let ranges = [];

  let container = document.getElementById('container');

  for (let i = 0; i < container.childNodes[0].textContent.length; i++) {
    let range = document.createRange();
    range.setStart(container.childNodes[0], i);
    range.setEnd(container.childNodes[0], i);

    ranges.push(range);

    console.log(range.getBoundingClientRect());
  }

  function getNearest(x, y) {
    let min = Infinity;
    let nearest = null;

    for (let range of ranges) {
      let rect = range.getBoundingClientRect();
      let distance = (rect.x - x) ** 2 + (rect.y - y) ** 2;
      if (distance < min) {
        nearest = range;
        min = distance;
      }
    }
    return nearest;
  }

  document.addEventListener('selectstart', event => event.preventDefault());
</script>
```

![](https://img-blog.csdnimg.cn/20201026230912595.gif#pic_center)

这样我们就完成了在正常流中的拖拽，我们想往哪里拖都可以，这个盒子都会被保留在这个正常流之中。通过实现这个功能，让我们更进一步的认识到 range 和 CSSOM 在 DOM API 里面的一些应用场景。

基本上我们要实现一些视觉效果都是离不开我们的 CSSOM。
