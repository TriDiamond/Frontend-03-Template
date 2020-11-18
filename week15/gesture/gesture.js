/**
 * 派发事件
 */
export class Dispatcher {
  /**
   * 构造 Dispatcher
   * @param {*} element 可监听元素
   */
  constructor(element) {
    this.element = element;
  }
  /**
   * 事件派发
   * @param {*} type 事件类型
   * @param {*} properties 事件携带数据
   */
  dispatch(type, properties) {
    let event = new Event(type);
    // 配置事件上的数据
    for (const name in properties) {
      event[name] = properties[name];
    }
    // 派发事件
    this.element.dispatchEvent(event);
  }
}

/**
 *实现对鼠标和触摸事件统一处理监听
 */
export class Listener {
  /**
   * 构造 Listener
   * @param {*} element 监听元素
   * @param {*} recognizer 识别器 new Recognizer()
   */
  constructor(element, recognizer) {
    let isListeningMouse = false; // 处理多键位同时按下，mouseup 重复绑定的问题
    // 全局存储上下文
    let contexts = new Map();

    // mouse 系列时间不会在移动端处理
    // 鼠标按下监听移动，抬起清空监听
    element.addEventListener('mousedown', event => {
      let context = Object.create(null);
      // key = mouse + 键位
      // 移位作为 key
      contexts.set('mouse' + (1 << event.button), context);

      recognizer.start(event, context);
      let mousemove = event => {
        let button = 1;
        // 匹配对应键位
        // 二进制掩码表示键位
        while (button <= event.buttons) {
          if (button & event.buttons) {
            // 只处理鼠标按下
            // 处理和 event 中键位顺序不一直的问题
            let key;
            if (button === 2) {
              key = 4;
            } else if (button === 4) {
              key = 2;
            } else key = button;
            let context = contexts.get('mouse' + key);
            recognizer.move(event, context);
            button = button << 1;
          }
        }
      };
      let mouseup = event => {
        console.log('mouseup');
        contexts.get('mouse' + (1 << event.button));
        recognizer.end(event, context);
        // 移除context
        contexts.delete('mouse' + (1 << event.button));

        if (event.buttons === 0) {
          // 没有键位信息移除监听
          document.removeEventListener('mouseup', mouseup);
          document.removeEventListener('mousemove', mousemove);
          isListeningMouse = false;
        }
      };
      if (!isListeningMouse) {
        document.addEventListener('mouseup', mouseup);
        document.addEventListener('mousemove', mousemove);
        isListeningMouse = true;
      }
    });

    // 监听移动设备手势
    element.addEventListener('touchstart', event => {
      // touch 多个触点 changedTouches
      for (let touch of event.changedTouches) {
        // 创建上下文并存入全局中
        let context = Object.create(null);
        contexts.set(touch.identifier, context);
        recognizer.start(touch, context);
      }
    });

    element.addEventListener('touchmove', event => {
      for (let touch of event.changedTouches) {
        let context = contexts.get(touch.identifier);
        recognizer.move(touch, context);
      }
    });

    element.addEventListener('touchend', event => {
      for (let touch of event.changedTouches) {
        let context = contexts.get(touch.identifier);
        recognizer.end(touch, context);
        contexts.delete(touch.identifier);
      }
    });

    // 监听事件被系统取消
    element.addEventListener('touchcancel', event => {
      for (let touch of event.changedTouches) {
        let context = contexts.get(touch.identifier);
        recognizer.cancel(touch, context);
        contexts.delete(touch.identifier);
      }
    });
  }
}
/**
 * 识别事件类型
 */
export class Recognizer {
  /**
   * 构造 Recognizer
   * @param {*} dispatcher new Dispatcher()
   */
  constructor(dispatcher) {
    this.dispatcher = dispatcher;
  }

  start(point, context) {
    // 将手势全局状态转化为参数，方便对状态做更为细致的区分。(鼠标左右键，多个触控点)
    (context.startX = point.clientX), (context.startY = point.clientY);

    // 存储用于计算速度的信息
    context.points = [
      {
        t: Date.now(),
        x: point.clientX,
        y: point.clientY,
      },
    ];

    context.isTap = true;
    context.isPan = false;
    context.isPress = false;

    handle = setTimeout(() => {
      // 区分长按事件

      context.isTap = false;
      context.isPan = false;
      context.isPress = true;
      context.handle = null;
      this.dispatcher('press', {});
    }, 500);
  }

  move(point, context) {
    // console.log('move', point.clientX, point.clientY)
    let dx = point.clientX - startX,
      dy = point.clientY - startY;

    // 移动 10 px
    if (!context.isPan && dx ** 2 + dy ** 2 > 100) {
      context.isTap = false;
      context.isPan = true;
      context.isPress = false;
      this.dispatcher('panstart', {
        startX: context.startX,
        startY: context.startY,
        clientX: context.clientX,
        clientY: context.clientY,
        isVertical: Math.abs(dx) < Math.abs(dy),
      });
      clearTimeout(context.handle);
    }

    if (context.isPan) {
      console.log('pan');
      this.dispatcher('pan', {
        startX: context.startX,
        startY: context.startY,
        clientX: context.clientX,
        clientY: context.clientY,
        isVertical: context.isVertical,
      });
    }

    // 存入一段时间内移动数据
    // 只存储 500 ms 范围内的点
    context.points = context.points.filter(point => Date.now() - point.t < 500);
    context.points.push({
      t: Date.now(),
      x: point.clientX,
      y: point.clientY,
    });
  }

  end(point, context) {
    // console.log('end', point.clientX, point.clientY)
    console.log(point);

    // tap 事件
    if (isTap) {
      console.log('tap');
      this.dispatcher('tap', {});
      clearTimeout(context.handle);
    }

    // 长按
    if (isPress) {
      this.dispatcher('pressed', {});
      console.log('pressed');
    }

    //计算 flick 速度
    context.points = context.points.filter(point => Date.now() - point.t < 500);
    let d, v;
    if (!context.points.length) {
      // 鼠标离开的速度 0
      v = 0;
    } else {
      // 移动距离 = 开（x 轴距离平方 + y 轴距离平方）的平方
      d = Math.sqrt(
        (point.clientX - context.points[0].x) ** 2 + (point.clientY - context.points[0].y) ** 2
      );
      // 速度 = 移动距离 / (当前时间 - 第一个移动点的时间)
      v = d / (Date.now() - context.points[0].t);
    }

    // 像素每毫秒
    if (v > 1.5) {
      console.log('filck');
      this.dispatcher('filck', {
        startX: context.startX,
        startY: context.startY,
        clientX: context.clientX,
        clientY: context.clientY,
        isVertical: context.isVertical,
        isFilck: context.isFilck,
        velocity: v,
      });
      context.isFilck = true;
    } else {
      context.isFilck = false;
    }

    if (isPan) {
      console.log('paned');
      this.dispatcher('paned', {
        startX: context.startX,
        startY: context.startY,
        clientX: context.clientX,
        clientY: context.clientY,
        isVertical: context.isVertical,
        isFilck: context.isFilck,
      });
    }
  }

  cancel(point, context) {
    this.dispatcher('cancel', {});
    clearTimeout(context.handle);
  }
}

/**
 * 绑定监听
 * @param {*} element
 */
export function enableGesture(element) {
  new Listener(element, new Recognizer(new Dispatcher(element)));
}
