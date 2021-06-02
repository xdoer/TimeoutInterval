export type CallBack = () => any
export type TimerIdCallBack = (timerId: any) => any

export function baseSetTimeoutInterval(cb: CallBack, interval = 1000, getTimerId: TimerIdCallBack) {
  const now = Date.now()
  let count = 0
  let timerId: any = null

  function countdown() {
    const offset = Date.now() - (now + count * interval)
    const nextTime = interval - offset
    count++

    timerId = setTimeout(() => {
      countdown()
      cb()
    }, nextTime)

    getTimerId(timerId)
  }

  countdown()
}
