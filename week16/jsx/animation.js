


const TICK = Symbol('tick');
const TICK_HANDLER = Symbol("tick-handler");
const ANIMATIONS = Symbol("animations");
const START_TIME = Symbol("start-time");
const PAUSE_START = Symbol("pause-start"); // 暂停开始时间
const PAUSE_TIME = Symbol("pause-time"); // 暂停时间

// 时间线
export class Timeline {
    constructor() {
        this.state = 'Inited';
        this[ANIMATIONS] = new Set();
        this[START_TIME] = new Map();
    }

    // 没有stop的状态
    start() {
        if (this.state !== 'Inited') {
            return;
        }
        this.state = "started";

        let startTime = Date.now();
        this[PAUSE_TIME] = 0;

        this[TICK] = () => {
            let now = Date.now();
            for (let animation of this[ANIMATIONS]) {
                let t;
                if (this[START_TIME].get(animation) < startTime) {
                    t = now - startTime;
                } else {
                    t = now - this[START_TIME].get(animation);
                }
                t = t - this[PAUSE_TIME] - animation.delay; // 减去暂停的时间和延迟时间
                
                if (animation.duration < t) {
                    this[ANIMATIONS].delete(animation);
                    t = animation.duration; // 避免终止值超出范围
                }

                // 当前时间大于动画开始时间才执行动画，否则会计算出负值
                if (t > 0) {
                    animation.receive(t);
                }
            }

            this[TICK_HANDLER] = requestAnimationFrame(this[TICK]);
        }

        this[TICK]();
    }

    // 暂停，暂停和恢复是一组，要将暂停开始的时间和暂停结束的时间记下来
    pause() {
        if (this.state !== 'started') {
            return;
        }
        this.state = "paused";

        this[PAUSE_START] = Date.now();
        cancelAnimationFrame(this[TICK_HANDLER]);
    }

    // 恢复
    resume() {
        if (this.state !== 'paused') {
            return;
        }
        this.state = "started";

        this[PAUSE_TIME] += Date.now() - this[PAUSE_START];
        this[TICK]();
    }

    // 重启
    reset() {
        this.pause();
        this.state = "Inited";

        let startTime = Date.now();
        this[PAUSE_START] = 0;
        this[PAUSE_TIME] = 0;
        this[ANIMATIONS] = new Set();
        this[START_TIME] = new Map();
        this[TICK_HANDLER] = null;
    }

    add(animation, startTime) {
        if(arguments.length < 2) {
            startTime = Date.now();
        }

        this[ANIMATIONS].add(animation);
        this[START_TIME].set(animation, startTime);
    }
}

// 属性动画
// 把一个对象的某个属性从一个值变成另外一个值。
export class Animation {
    /**
     * 
     * @param {*} object            对象
     * @param {*} property          属性
     * @param {*} startValue        起始值，必须是js里面的数值
     * @param {*} endValue          终止值
     * @param {*} duration          时长
     * @param {*} delay             
     * @param {*} timingFunction    差值函数, 关于一个0 ~ 1的time，然后返回0 ~ 1的progress的一个函数
     */
    constructor(object, property, startValue, endValue, duration, delay, timingFunction, template) {
        timingFunction = timingFunction || (v => v);
        template = template || (v => v);

        this.object = object;
        this.property = property;
        this.startValue = startValue;
        this.endValue = endValue;
        this.duration = duration;
        this.delay = delay;
        this.timingFunction = timingFunction;
        this.template = template;
    }

    // 接受的是一个虚拟时间
    receive(time) {
        let range = this.endValue - this.startValue;
        let progress = this.timingFunction(time / this.duration);
        this.object[this.property] = this.template(this.startValue + range * progress);
    }
}