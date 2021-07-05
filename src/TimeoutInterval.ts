import { TimerCallBack, TimerCallBackMeta } from './types'
import { baseSetTimeoutInterval } from './baseSetTimeoutInterval'

export class TimeoutInterval {
  cbs: TimerCallBackMeta[] = []

  private timerId: any
  static instanceId = 0
  now = 0

  constructor(public delay = 0) { }

  private start() {
    this.now = Date.now()
    baseSetTimeoutInterval(
      () => {
        for (let i = 0; i < this.cbs.length; i++) {
          this.now = Date.now()
          this.cbs[i].cb()
        }
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

  add(cb: TimerCallBack) {
    const id = ++TimeoutInterval.instanceId
    this.cbs.push({ cb, id })

    if (!this.timerId) this.start()

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
