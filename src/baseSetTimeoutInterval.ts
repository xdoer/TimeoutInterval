export type CallBack = (timerId: NodeJS.Timeout) => any

export function baseSetTimeoutInterval(cb: CallBack, interval = 1000) {
  const now = Date.now()
  let count = 0
  let timerId: any = null

  function countdown() {
    const offset = Date.now() - (now + count * interval)
    const nextTime = interval - offset
    count++

    timerId = setTimeout(() => {
      countdown()
    }, nextTime)

    cb(timerId)
  }

  countdown()
}
