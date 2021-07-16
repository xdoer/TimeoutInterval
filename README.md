# TimeoutInterval

合并计数器实例，提高应用性能

## 安装

```bash
npm -i @xdoer/timeout-interval
```

## 特点

> - 计时准确。使用 setTimeout 递归，及时修正计时误差。【首次执行，会有小于 offset 的计时误差】
> - 合并递归计时实例。在误差允许的范围内。会合并递归执行的实例，减少系统消耗

## 使用

下面将 setInterval 的回调时间称之为 interval, 将误差时间称之为 offset。同时为了方便描述，将底层递归 setTimeout 模拟的 setInterval 称之为 setInterval

### 基本使用

你可以像常规的 `setInterval` 和 `clearInterval` 一样使用。两次调用 `setTimeoutInterval` 的间隔在 500ms 的整数倍内，会合并计数器。

```ts
import { setTimeoutInterval, clearTimeoutInterval } from '@xdoer/timeout-interval';

const timerId = setTimeoutInterval(() => {
  console.log('1');
}, 1000);

clearTimeoutInterval(timerId);
```

上面的例子中，多次调用 `setTimeoutInterval` 的间隔在 500ms 的整数倍内，会合并计数器，也就是说，除了第一次的 `setTimeoutInterval` 调用，之后的调用，首次执行回调，最大会有 500ms 的计时误差。

如果你需要准确的计时器，你可以使用 `baseSetTimeoutInterval` API

```ts
import { baseSetTimeoutInterval } from '@xdoer/timeout-interval';

let timerId;

baseSetTimeoutInterval(
  () => {
    console.log('1');
  },
  1000,
  id => (timerId = id)
);

// 使用 clearTimeout 停止计时
clearTimeout(id);
```

### 高级使用

你可以通过构造函数的方式，创建实例

```ts
import { TimeoutController } from '@xdoer/timeout-interval';

// 设定 offset 误差在 1000ms
const timeoutInterval = new TimeoutController(500);

// 你可以通过 add 方法添加回调函数
const timerId = timeoutInterval.add(() => {
  console.log(1);
}, 1000);

// 通过 remove 方法停止计数器
timeoutInterval.remove(timerId);
```

或者你想像 `setInterval` 一样使用

```ts
import { TimeoutController } from '@xdoer/timeout-interval';

const timeoutInterval = new TimeoutController(1000);

export const setTimeoutInterval = timeoutInterval.add.bind(timeoutInterval);

export const clearTimeoutInterval = timeoutInterval.remove.bind(timeoutInterval);
```

## 调试

### 数据结构

包默认导出了一个 `timeoutInterval` 对象，它是一个 `TimeoutController` 实例 你可以打印一下，观察其数据结构.

```ts
import { timeoutInterval } from '@xdoer/timeout-interval';

console.log(timeoutInterval);
```

### 计时实例

可以通过代理劫持的方式，观察计时实例

```ts
window.setTimeout = new Proxy(window.setTimeout, {
  apply: (...args) => {
    const timerId = Reflect.apply(...args)
    console.log('setTimeout', timerId, args[2][1])
    return timerId
  }
}
```

## 原理

### 批量执行回调

```ts
const interval = 1000;
setInterval(() => {
  cbs.forEach(cb => cb());
}, interval);
```

在上面的例子的基础上，构造了 `setTimeoutInterval`，它的作用是向上面的 cbs 插入回调函数。调用多少次 `setTimeoutInterval`，就会向 cbs 插入多少个回调函数。`clearTimeoutInterval` 则将回调函数从 cbs 中移除。

### 计数器合并

```ts
let now = 0;
setInterval(() => {
  now = Date.now();
  cbs.forEach(cb => cb());
}, interval);
```

通过 `setTimeoutInterval` 向 cbs 插入回调函数时，需要根据 `Date.now() - now` 得到计数器目前执行的时间，在 interval 相同的情况下，只要执行时间在 offset 的范围内，就可以直接向 cbs 中插入回调函数，否则需要新的 setInterval 实例，去执行回调函数。

实际在本项目中，会根据 offset 为 interval 分配时间片段，这样的话，可以极大的减少 setInterval 实例，减小系统消耗。比如：interval 为 3000ms， offset 为 500ms，那么，无论调用多少次 setTimeoutInterval,注册多少个回调函数，都只会有 3000 / 500 = 6 个 setInterval 实例。

## 例子

默认合并计时误差在 500ms，也就是说在计时间隔的每一个 500ms，通过 `setTimeoutInterval` 插入任意数量的回调函数，都会共用一个计数实例。

下面的四个计数器中，timer1、timer2、timer4 会共用一个底层的 `setInterval` 实例，timer3 会用一个底层的 `setInterval` 实例。

```ts
import { setTimeoutInterval, clearTimeoutInterval } from '@xdoer/timeout-interval';

const timer1 = setTimeoutInterval(() => {
  console.log('1');
}, 1000);

await sleep(100);

const timer2 = setTimeoutInterval(() => {
  console.log('2');
}, 1000);

await sleep(500);

const timer3 = setTimeoutInterval(() => {
  console.log('3');
}, 1000);

await sleep(600);

const timer4 = setTimeoutInterval(() => {
  console.log('4');
}, 1000);
```

**_对于计时间隔 interval， 如果误差为 offset，则最多会产生 interval / offset 个计时实例_**

上面的例子中，timer1 注册了一个回调函数，计数器实例 A 开始执行，过了 100ms，timer2 开始注册回调函数，此时，计数器 A 已经执行了 100ms，检查计时误差有 500ms，因而可以直接将 timer2 的回调函数插入到计数器 A。又过了 500ms，timer3 开始注册回调函数，此时，距离计数器 A 执行已经过了 600ms，大于计时误差 500ms，因而只能新建计数器实例 B，并将 timer3 回调函数插入。又过了 600ms, timer4 注册回调函数， 此时距离计数器 A 开始执行过了 1200ms，由于每过 1000ms，开始一个计时循环，因而 1200ms 与 200ms 等效，200ms 在 500ms 的计时误差内，因而可以直接将 timer4 的回调函数插入到计数器实例 A 中。所以总共产生了两个计数器实例，相比传统的 setInterval, 大大提高了性能。
