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

  add(cb: TimerCallBack, interval = 1000): number {

    // 找到对应的任务列表
    const tasks = this.tasksMap.get(interval) || []

    // 列表中，比较 now
    const now = Date.now()
    const sortTasks = tasks.filter(task => now - task.now < this.offset).sort((a, b) => (now - a.now) - (now - b.now))

    if (sortTasks.length) {
      // const miniOffset = now - tasks[0].now
      // // 可以接受最小偏移量，则直接添加任务
      // if (miniOffset < this.offset) {
      //   return tasks[0].add(cb)
      // }

      for (let i = 0; i < tasks.length; i++) {
        const offset = now - tasks[i].now
        if (offset <= this.offset) return tasks[i].add(cb)

        // TODO: 分组

      }
    }

    const instance = new TimeoutInterval(interval)

    this.tasksMap.set(interval, (this.tasksMap.get(interval) || []).concat(instance))

    return instance.add(cb)
  }

  remove(id: number) {
    const timeoutInstancesLength = this.timeoutInstances.length
    for (let i = 0; i < timeoutInstancesLength; i++) {
      const instance = this.timeoutInstances[i]
      if (instance.remove(id)) {
        // 如果这个实例中没有了任务，则需要从 tasksMap 中将其删掉
        if (!instance.cbs.length) {
          const tasks = this.tasksMap.get(instance.delay) || []
          const idx = tasks.findIndex(task => task === instance)
          if (idx !== -1) {
            tasks.splice(idx, 1)
          }
        }
        break
      }
    }
  }

  removeAll() {
    const timeoutInstancesLength = this.timeoutInstances.length
    for (let i = 0; i < timeoutInstancesLength; i++) {
      this.timeoutInstances[i].removeAll()
      this.tasksMap.clear()
    }
  }
}

export const timeoutInterval = new TimeoutController()

export const setTimeoutInterval = timeoutInterval.add.bind(timeoutInterval)

export const clearTimeoutInterval = timeoutInterval.remove.bind(timeoutInterval)

export { baseSetTimeoutInterval } from './baseSetTimeoutInterval'
