# TimeoutInterval

合并计时器实例，提高应用性能

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

### 合并计时器实例

默认合并计时误差在 500ms，也就是说在下一个计时间隔执行的 500ms 内，通过 `setTimeoutInterval` 插入任意数量的回调函数，都会共用一个计时实例。

下面的五个计时器中，前三个会合并为一个计时器实例，后两个会分别产生一个计时器实例[TODO: 这里似乎可以合并为一个计时器实例]。

```ts
import { setTimeoutInterval, clearTimeoutInterval } from '@xdoer/timeout-interval';

setTimeoutInterval(() => {
  console.log('1');
}, 1000);

await sleep(300);

setTimeoutInterval(() => {
  console.log('2');
}, 1000);

await sleep(1200);

setTimeoutInterval(() => {
  console.log('3');
}, 1000);

await sleep(10501);

setTimeoutInterval(() => {
  console.log('4');
}, 1000);

await sleep(10502);

setTimeoutInterval(() => {
  console.log('5');
}, 1000);
```

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

// 通过 clear 方法停止计时器
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

> - 计时准确。使用 setTimeout 递归，及时修正计时误差。
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

在 callback 处，可以循环调用注册在计时器中的函数

### 偏移纠正

使用 `setTimeout` 递归来模拟 `setInterval`，当线程阻塞后，可以及时纠正执行时间。
