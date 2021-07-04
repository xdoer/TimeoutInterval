import { TimeoutInterval } from './TimeoutInterval'
import { TimerCallBack } from './types'

export { baseSetTimeoutInterval } from './baseSetTimeoutInterval'

export class TimeoutController {
  private tasksMap = new Map<number, TimeoutInterval[]>()

  get tasks() {
    return Array.from(this.tasksMap)
  }

  get timeoutInstances() {
    return this.tasks.reduce((t, [_, list]) => t = t.concat(list), [] as TimeoutInterval[])
  }

  static offset = 500

  add(cb: TimerCallBack, interval = 1000): number {

    /**
     * 1、查找 interval 能整除的任务，能整除说明要加的 cb 都可以添加进去
     * 2、将能整除的的计时器提取出来
     * 3、找出最小的偏移量
     */
    let now = Date.now()
    const mayCanInsert = this.tasks.filter(([id]) => !(interval % id))
    const tasks = mayCanInsert.reduce((t, [_, list]) => t = t.concat(list), [] as TimeoutInterval[]).sort((a, b) => (now - a.now) - (now - b.now))

    if (tasks.length) {
      const miniOffset = now - tasks[0].now
      // 最小偏移量可以接受，则直接添加任务
      if (miniOffset < TimeoutController.offset) {
        return tasks[0].add(cb, interval)
      }
    }

    const instance = new TimeoutInterval()

    /**
     * 先尝试查到能整除的队列中
     * 不能整除，再新建
     */
    this.tasksMap.set(mayCanInsert[0]?.[0] ?? interval, (this.tasksMap.get(interval) || []).concat(instance))

    return instance.add(cb, interval)
  }

  remove(id: number) {
    const timeoutInstancesLength = this.timeoutInstances.length
    for (let i = 0; i < timeoutInstancesLength; i++) {
      if (this.timeoutInstances[i].remove(id)) {
        break
      }
    }
  }

  removeAll() {
    const timeoutInstancesLength = this.timeoutInstances.length
    for (let i = 0; i < timeoutInstancesLength; i++) {
      this.timeoutInstances[i].removeAll()
    }
  }
}

const timeoutInterval = new TimeoutController()

export const setTimeoutInterval = timeoutInterval.add.bind(timeoutInterval)

export const clearTimeoutInterval = timeoutInterval.remove.bind(timeoutInterval)
