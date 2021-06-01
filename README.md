# TimeoutInterval

递归一个 setTimeout ，来代替 n 个 setInterval

## 安装

```bash
npm -i @xdoer/timeout-interval
```

## 使用

```ts
import {
  setTimeoutInterval,
  clearTimeoutInterval,
} from '@xdoer/timeout-interval';

const timerId = setTimeoutInterval(() => {
  console.log('1');
}, 1000);

const timerId2 = setTimeoutInterval(() => {
  console.log('2');
}, 2000);

const timerId3 = setTimeoutInterval(() => {
  console.log('3');
}, 3000);
```

上面调用了三个`setTimeoutInterval`，但库内部只会递归执行一个每隔 1000ms 的 `setTimeout`, 然后分别在 1000ms，2000ms, 3000ms 后执行注册的回调函数。
