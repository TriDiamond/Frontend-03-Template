
let element = document.documentElement;
let contexts = new Map();

let isLinteningMouse = false;

//****鼠标事件****
element.addEventListener('mousedown', event => {

    let context = Object.create(null);
    contexts.set('mouse' + (1 << event.button), context);

    start(event, context);

    let mousemove = event => {
        let button = 1;
        while (button <= event.buttons) {
            if (button & event.buttons) {
                let key = button;
                // 中键和右键的顺序问题，mousedown中中键和右键的event.button值
                // 和mousemove中event.buttons掩码中的位置是反过来的
                if (button === 2) {
                    key = 4;
                } else if (button === 4) {
                    key = 2;
                }

                const context = contexts.get('mouse' + key);
                move(event, context);
            }
            
            button = button << 1;
        }
    };
    let mouseup = event => {
        const context = contexts.get('mouse' + (1 << event.button));
        end(event, context);
        contexts.delete('mouse' + (1 << event.button));

        if (event.buttons === 0) {
            document.removeEventListener('mousemove', mousemove);
            document.removeEventListener('mouseup', mouseup);
            isLinteningMouse = false;
        }
    };

    if (!isLinteningMouse) {
        document.addEventListener('mousemove', mousemove);
        document.addEventListener('mouseup', mouseup);
        isLinteningMouse = true;
    }
});

//****触屏事件****
element.addEventListener('touchstart', event => {
    for (let touch of event.changedTouches) {
        let context = Object.create(null);

        contexts.set(touch.identifier, context);
        start(touch, context);
    }
});

element.addEventListener('touchmove', event => {
    for (let touch of event.changedTouches) {
        const context = contexts.get(touch.indetifier);
        move(touch, context);
    }
});

element.addEventListener('touchend', event => {
    for (let touch of event.changedTouches) {
        const context = contexts.get(touch.indetifier);
        end(touch, context);
        // 移除context
        contexts.delete(context);
    }
});

// touchcancel事件，是touch的点的序列，以一个异常的模式去结束的
element.addEventListener('touchcancel', event => {
    for (let touch of event.changedTouches) {
        const context = contexts.get(touch.indetifier);
        cancel(touch, context);
        // 移除context
        contexts.delete(context);
    }
});

// 并不能是全局的，因为鼠标有左右键，touch存在多个点
/* let handler;
let startX, startY;
let isPan = false, isTap = true, isPress = false; */

let start = (point, context) => {
    // console.log('start', point.clientX, point.clientY);
    context.startX = point.clientX, context.startY = point.clientY;
    context.points = [{
        t: Date.now(),
        x: point.clientX,
        y: point.clientY,
    }];

    context.isTap = true;
    context.isPan = false;
    context.isPress = false;

    context.handler = setTimeout(() => {
        context.isTap = false;
        context.isPan = false;
        context.isPress = true;

        context.handler = null;
        console.log('press start');
    }, 500);
};

let move = (point, context) => {
    let dx = point.clientX - context.startX, dy = point.clientY - context.startY;

    if (!context.isPan && (dx ** 2 + dy ** 2 > 100)) {
        context.isTap = false;
        context.isPan = true;
        context.isPress = false;

        context.isPan = true;
        console.log('pan start');
        clearTimeout(context.handler);
    }

    if (context.isPan) {
        console.log(dx, dy, 'pan');
    }

    // 过滤, 只存取0.5s内的速度
    context.points = context.points.filter(point => Date.now() - point.t < 500);

    context.points.push({
        t: Date.now(),
        x: point.clientX,
        y: point.clientY,
    });
};

let end = (point, context) => {
    if (context.isTap) {
        console.log('tap');
        dispatch('tap', {});
        clearTimeout(context.handler);
        return;
    }

    if (context.isPan) {
        console.log('pan end');
    }

    if (context.isPress) {
        console.log('press end');
        dispatch('press', {});
        return;
    }

    // 计算速度
    context.points = context.points.filter(point => Date.now() - point.t < 500);
    let d, v;
    if (!context.points.length) {
        v = 0;
    } else {
        d = Math.sqrt((point.clientX - context.points[0].x) ** 2 + 
                (point.clientY - context.points[0].y) ** 2);
        v = d / (Date.now() - context.points[0].t);
    }

    if (v > 1.5) {
        console.log('flick');
        context.isFlick = true;
    } else {
        context.isFlick = false;
    }
};

let cancel = (point, context) => {
    clearTimeout(context.handler);
    console.log('cancel', point.clientX, point.clientY);
};

export function dispatch(type, properties) {
    let event = new Event(type);
    for (let name in properties) {
        event[name] = properties[name];
    }

    element.dispatchEvent(event);
}

export class Listener {
    constructor(element, recognizer) {

    }
}

export class Recognizer {
    constructor() {

    }
}

export function enableGesture(element) {

}

