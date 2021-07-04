import { TimerCallBack, TimerCallBackMeta } from './types'
import { baseSetTimeoutInterval } from './baseSetTimeoutInterval'

export class TimeoutInterval {
  cbs: TimerCallBackMeta[] = []

  private timerId: any
  private count = 0
  static instanceId = 0
  delay = 0
  now = 0

  private start() {
    this.now = Date.now()
    baseSetTimeoutInterval(
      () => {
        for (let i = 0; i < this.cbs.length; i++) {
          const { cb, interval } = this.cbs[i]
          if (!(this.count * this.delay % interval)) {
            this.now = Date.now()
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
    const id = ++TimeoutInterval.instanceId
    this.cbs.push({ cb, interval, id })

    if (!this.timerId) {
      this.delay = interval
      this.start()
    }

    return id
  }

  remove(id: number) {
    const idx = this.cbs.findIndex(item => item.id === id)

    if (idx === -1) return false

    this.cbs.splice(idx, 1)

    if (!this.cbs.length) {
      this.stop()
    }

    return true
  }

  removeAll() {
    this.cbs = []
    this.stop()
  }
}
