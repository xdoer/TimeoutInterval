export type TimerCallBack = () => any

export interface TimerCallBackMeta {
  cb: TimerCallBack
  id: number
}
