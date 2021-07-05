# TimeoutInterval

合并计数器实例，提高应用性能

## 安装

```bash
npm -i @xdoer/timeout-interval
```

## 使用

### 基本使用

你可以像常规的 `setInterval` 和 `clearInterval` 一样使用。

```ts
import { setTimeoutInterval, clearTimeoutInterval } from '@xdoer/timeout-interval';

const timerId = setTimeoutInterval(() => {
  console.log('1');
}, 1000);

clearTimeoutInterval(timerId);
```

### 合并计数器实例

默认合并计时误差在 500ms，也就是说在下一个计时间隔执行的 500ms 内，通过 `setTimeoutInterval` 插入任意数量的回调函数，都会共用一个计时实例。

下面的四个计数器中，timer1、timer2、timer4 会共用一个实例，timer3 会用一个实例。

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

### 自定义计时误差

你可以通过构造函数的方式，创建实例

```ts
import { TimeoutController } from '@xdoer/timeout-interval';

// 设定误差在 1000ms
const timeoutInterval = new TimeoutController(1000);

// 你可以通过 add 方法添加回调函数
const timerId = timeoutInterval.add(() => {
  console.log(1);
}, 1000);

// 通过 clear 方法停止计数器
timeoutInterval.remove(timerId);
```

或者你想像 `setInterval` 一样使用

```ts
import { TimeoutController } from '@xdoer/timeout-interval';

const timeoutInterval = new TimeoutController(1000);

export const setTimeoutInterval = timeoutInterval.add.bind(timeoutInterval);

export const clearTimeoutInterval = timeoutInterval.remove.bind(timeoutInterval);
```

## 特点

> - 计时准确。使用 setTimeout 递归，及时修正计时误差。【首次执行，会有小于 offset 的计时误差】
> - 合并递归计时实例。在误差允许的范围内。会合并递归执行的实例，减少系统消耗

查阅文章: [写个倒计时？](https://aiyou.life/post/iWhkaOqqO/)

## 原理

### 批量执行回调

```ts
const interval = 1000;
setInterval(() => {
  cbs.forEach(cb => cb());
}, interval);
```

在 callback 处，可以循环调用注册在计数器中的函数

### 偏移纠正

使用 `setTimeout` 递归来模拟 `setInterval`，当线程阻塞后，可以及时纠正执行时间。
