import { TimerCallBack, TimerCallBackMeta } from './types'
import { baseSetTimeoutInterval } from './baseSetTimeoutInterval'

export class TimeoutInterval {
  cbs: TimerCallBackMeta[] = []

  private timerId: any
  private count = 0
  private instanceId = 0
  private delay = 0

  private initDelay() {
    /**
     * 由于使用了 `setTimeout` 递归，当第一个注册的 cb interval 比后面注册的 interval 大时，会造成后面执行的时间有误差。
     * 这里做了取舍，队列中注册的时间大于 1000ms，会默认使用 1000ms 进行递归
     */
    this.delay = this.cbs.reduce((min, cur) => cur.interval < min ? cur.interval : min, 1000)
  }

  private start() {
    baseSetTimeoutInterval(
      () => {
        for (let i = 0; i < this.cbs.length; i++) {
          const { cb, interval } = this.cbs[i]
          if (!(this.count * this.delay % interval)) {
            cb()
          }
        }
        this.count++
      },
      this.delay,
      (timerId) => {
        this.timerId = timerId
      }
    )
  }

  private stop() {
    clearTimeout(this.timerId)
    this.timerId = null
  }

  add(cb: TimerCallBack, interval = 1000) {
    const id = ++this.instanceId
    this.cbs.push({ cb, interval, id })

    this.initDelay()

    if (!this.timerId) this.start()

    return id
  }

  remove(id: number) {
    const idx = this.cbs.findIndex(item => item.id === id)

    if (idx !== -1) {
      this.cbs.splice(idx, 1)

      if (!this.cbs.length) {
        this.stop()
      }
    }
  }

  removeAll() {
    this.cbs = []
    this.stop()
  }
}

export const timeoutInterval = new TimeoutInterval()

export const setTimeoutInterval = timeoutInterval.add.bind(timeoutInterval)

export const clearTimeoutInterval = timeoutInterval.remove.bind(timeoutInterval)
