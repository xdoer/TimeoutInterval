export type TimerCallBack = () => any

export interface TimerCallBackMeta {
  cb: TimerCallBack
  interval: number
  id: number
}
