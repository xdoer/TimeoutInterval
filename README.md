# TimeoutInterval

合并 n 个 setInterval，提高应用性能

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
> - 合并递归实例。在误差允许的范围内。会合并递归执行的实例，减少系统消耗

查阅文章: [写个倒计时？](https://aiyou.life/post/iWhkaOqqO/)

## 配置

默认会将偏移时间在 500ms 内的计时器进行合并

```ts
import { TimeoutController } from '@xdoer/timeout-interval';

TimeoutController.offset = 500;
```

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
