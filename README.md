# TimeoutInterval

递归一个 setTimeout，代替执行 n 个 setInterval

## 安装

```bash
npm -i @xdoer/timeout-interval
```

## 使用

```ts
import { setTimeoutInterval, clearTimeoutInterval } from '@xdoer/timeout-interval';

const timerId = setTimeoutInterval(() => {
  console.log('1');
}, 1000);

clearTimeoutInterval(timerId);
```

## 特点

> - 计时准确。使用 setTimeout 递归，及时修正计时误差。
> - 单一递归实例。无论调用多少次 `setTimeoutInterval` API，内部只会进行一个计时器，然后在所有注册的时间，执行回调函数

**_注意:与原生 setInterval 的区别在于，setTimeoutInterval 注册的回调函数先回立即执行一次，接着再间隔执行_**

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

### 计数器计时

应对不同的 `interval` ?

```ts
let cbs = [{ cb, interval }];
let delay = minInterval(cbs);
let count = 0;

setInterval(() => {
  cbs.forEach(({ cb, interval }) => {
    if (!((count * delay) % interval)) {
      cb();
    }
  });
  count++;
}, delay);
```

### 偏移纠正

使用 `setTimeout` 递归来模拟 `setInterval`，当线程阻塞后，可以及时纠正执行时间。
