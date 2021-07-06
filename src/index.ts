import { TimeoutInterval } from './TimeoutInterval'
import { TimerCallBack } from './types'

export class TimeoutController {
  private tasksMap = new Map<number, TimeoutInterval[]>()

  constructor(private offset = 500) { }

  get tasks() {
    return Array.from(this.tasksMap)
  }

  get timeoutInstances() {
    return this.tasks.reduce((t, [_, list]) => t = t.concat(list), [] as TimeoutInterval[])
  }

  private initTaskMap(interval: number) {
    const init = new Array(Math.ceil(interval / this.offset)).fill(null).map(() => new TimeoutInterval(interval))
    this.tasksMap.set(interval, init)
    return init
  }

  add(cb: TimerCallBack, interval = 1000): number {

    // 找到对应的任务列表
    const tasks = this.tasksMap.get(interval) || this.initTaskMap(interval)

    // 列表中，比较 now
    const now = Date.now()
    const taskLength = tasks.length

    const sortTasks = tasks.sort((a, b) => (now - a.now) - (now - b.now))
    for (let i = 0; i < taskLength; i++) {
      const taskNow = sortTasks[i].now
      const offset = now - taskNow
      if (offset > this.offset * i && offset < (this.offset * (i + 1))) return sortTasks[i].add(cb)
    }

    // 找到第一个 now 为 0 的
    const target = tasks.find(task => !task.now)

    return target!.add(cb)
  }

  remove(id: number) {
    const timeoutInstancesLength = this.timeoutInstances.length
    for (let i = 0; i < timeoutInstancesLength; i++) {
      const instance = this.timeoutInstances[i]
      if (instance.remove(id)) {
        break
      }
    }
  }

  removeAll() {
    const timeoutInstancesLength = this.timeoutInstances.length
    for (let i = 0; i < timeoutInstancesLength; i++) {
      this.timeoutInstances[i].removeAll()
    }
    this.tasksMap.clear()
  }
}

export const timeoutInterval = new TimeoutController()

export const setTimeoutInterval = timeoutInterval.add.bind(timeoutInterval)

export const clearTimeoutInterval = timeoutInterval.remove.bind(timeoutInterval)

export { baseSetTimeoutInterval } from './baseSetTimeoutInterval'
