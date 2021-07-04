import { TimeoutInterval } from './TimeoutInterval'
import { TimerCallBack } from './types'

export class TimeoutController {
  private tasksMap = new Map<number, TimeoutInterval[]>()

  get tasks() {
    return Array.from(this.tasksMap)
  }

  static offset = 500

  add(cb: TimerCallBack, interval = 1000): number {

    /**
     * 1、查找 interval 能整除的任务，能整除说明要加的 cb 都可以添加进去
     * 2、将能整除的的计时器提取出来
     * 3、找出最小的偏移量
     */
    let now = Date.now()
    const tasks = this.tasks.filter(([id]) => !(interval % id)).reduce((t, [_, list]) => t = t.concat(list), [] as TimeoutInterval[]).sort((a, b) => (now - a.now) - (now - b.now))

    if (tasks.length) {
      const miniOffset = now - tasks[0].now
      // 最小偏移量可以接受，则直接添加任务
      if (miniOffset < TimeoutController.offset) {
        return tasks[0].add(cb, interval)
      }
    }

    const instance = new TimeoutInterval()
    const cache = this.tasksMap.get(interval) || []
    cache.push(instance)
    this.tasksMap.set(interval, cache)

    return instance.add(cb, interval)
  }

  remove(id: number) {
    for (const instances of this.tasksMap.values()) {
      for (let i = 0; i < instances.length; i++) {
        const instance = instances[i]
        if (instance.remove(id)) {
          return
        }
      }
    }
  }

  removeAll() {
    for (const instances of this.tasksMap.values()) {
      for (let i = 0; i < instances.length; i++) {
        const instance = instances[i]
        instance.removeAll()
      }
    }
  }
}

const timeoutInterval = new TimeoutController()

timeoutInterval.add(() => { }, 1000)
