import { createModel } from '@rematch/core'
import { RootModel } from './'
import { callQwenAPIForReminder } from '../utils/qwenApi'
import { callDoubaoAPIForReminder } from '../utils/doubaoApi'

// 提醒类型：once-单次触发，repeat-重复提醒
export type ReminderType = 'once' | 'repeat'

export interface ScheduleItem {
  id: string
  title: string
  time: string
  enabled: boolean
  notified: boolean
  type: ReminderType // 提醒类型
  interval?: number // 重复间隔（分钟），仅 repeat 类型有效
  duration?: number // 自律时长（分钟），仅 repeat 类型有效
  notifyCount?: number // 已通知次数，仅 repeat 类型有效
  maxNotify?: number // 最大通知次数（上限 3），仅 repeat 类型有效
  lastNotifiedTime?: string // 上次通知时间，用于计算间隔
}

// 全局回调函数类型
export type ScheduleNotificationCallback = (title: string, polishedTitle?: string) => void

// 存储回调函数
let notificationCallback: ScheduleNotificationCallback | null = null

// 设置回调的函数
export const setScheduleNotificationCallback = (
  callback: ScheduleNotificationCallback
) => {
  notificationCallback = callback
}

export const schedule = createModel<RootModel>()({
  state: {
    items: [],
    showSchedulePanel: false,
  } as { items: ScheduleItem[]; showSchedulePanel: boolean },
  reducers: {
    setItems(state, items: ScheduleItem[]) {
      return { ...state, items }
    },
    addItem(state, item: ScheduleItem) {
      return { ...state, items: [...state.items, item] }
    },
    updateItem(state, item: ScheduleItem) {
      return {
        ...state,
        items: state.items.map((i) => (i.id === item.id ? { ...i, ...item } : i)),
      }
    },
    deleteItem(state, id: string) {
      return {
        ...state,
        items: state.items.filter((i) => i.id !== id),
      }
    },
    setShowSchedulePanel(state, show: boolean) {
      return { ...state, showSchedulePanel: show }
    },
    resetNotified(state) {
      return {
        ...state,
        items: state.items.map((i) => ({ ...i, notified: false, notifyCount: 0, lastNotifiedTime: undefined })),
      }
    },
    resetDaily(state) {
      // 每日重置：将单次任务的 notified 重置，重复任务的计数保留
      return {
        ...state,
        items: state.items.map((i) => {
          if (i.type === 'once') {
            return { ...i, notified: false }
          }
          return i
        }),
      }
    },
  },
  effects: (dispatch) => ({
    async checkReminders(_payload: void, rootState: any) {
      const now = new Date()
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      const currentTimeMinutes = now.getHours() * 60 + now.getMinutes()
      console.log('[Schedule] Current time:', currentTime)

      const items = rootState.schedule?.items || []
      console.log('[Schedule] Items count:', items.length)

      const aiConfig = rootState.ai?.config

      for (const item of items) {
        // 兼容旧数据：如果没有 type 字段，默认为 once
        const itemType = item.type || 'once'
        console.log('[Schedule] Checking item:', item.title, 'at', item.time, 'type:', itemType, 'enabled:', item.enabled)

        if (!item.enabled) {
          continue
        }

        // 单次触发任务
        if (itemType === 'once') {
          if (!item.notified && item.time === currentTime) {
            await triggerNotification(item, aiConfig, notificationCallback)
            dispatch.schedule.updateItem({ ...item, notified: true })
          }
          continue
        }

        // 重复提醒任务
        if (itemType === 'repeat') {
          const maxNotify = item.maxNotify || 3
          const notifyCount = item.notifyCount || 0

          // 已达到最大通知次数
          if (notifyCount >= maxNotify) {
            continue
          }

          // 检查是否到达开始时间
          if (item.time !== currentTime && !item.lastNotifiedTime) {
            continue
          }

          // 第一次触发
          if (!item.lastNotifiedTime) {
            await triggerNotification(item, aiConfig, notificationCallback)
            dispatch.schedule.updateItem({
              ...item,
              notified: true,
              notifyCount: notifyCount + 1,
              lastNotifiedTime: currentTime,
            })
            continue
          }

          // 检查是否还在自律时长内
          if (item.duration && item.lastNotifiedTime) {
            const lastTime = parseTimeString(item.lastNotifiedTime)
            if (lastTime) {
              const elapsed = currentTimeMinutes - lastTime

              // 超过自律时长，重置
              if (elapsed >= (item.duration * 60)) {
                dispatch.schedule.updateItem({
                  ...item,
                  notified: false,
                  notifyCount: 0,
                  lastNotifiedTime: undefined,
                })
                continue
              }

              // 还在自律时长内，检查间隔
              const interval = item.interval || 10
              if (elapsed < interval) {
                continue
              }

              // 触发下一次提醒
              await triggerNotification(item, aiConfig, notificationCallback)
              dispatch.schedule.updateItem({
                ...item,
                notified: true,
                notifyCount: notifyCount + 1,
                lastNotifiedTime: currentTime,
              })
            }
          }
        }
      }
    },
  }),
})

// 触发通知的辅助函数
async function triggerNotification(
  item: ScheduleItem,
  aiConfig: any,
  notificationCallback: ((title: string, polishedTitle?: string) => void) | null
) {
  console.log('[Schedule] Triggering notification for:', item.title)

  // 检查是否启用 AI 润色
  if (aiConfig?.enabled && aiConfig?.apiKey) {
    try {
      console.log('[Schedule] Polishing reminder with AI...')

      // 根据提供商调用不同的 API
      let polishedTitle: string
      if (aiConfig.provider === 'doubao') {
        // 豆包 API
        polishedTitle = await callDoubaoAPIForReminder(
          aiConfig.baseUrl,
          aiConfig.apiKey,
          aiConfig.model,
          item.title,
          50
        )
      } else {
        // 通义千问 API
        polishedTitle = await callQwenAPIForReminder(
          aiConfig.baseUrl,
          aiConfig.apiKey,
          aiConfig.model,
          item.title,
          50
        )
      }

      console.log('[Schedule] Polished reminder:', polishedTitle)

      if (notificationCallback) {
        notificationCallback(item.title, polishedTitle)
      }
    } catch (error) {
      console.error('[Schedule] AI 润色失败:', error)
      if (notificationCallback) {
        notificationCallback(item.title)
      }
    }
  } else {
    if (notificationCallback) {
      notificationCallback(item.title)
    }
  }
}

// 解析时间字符串为分钟数
function parseTimeString(time: string): number | null {
  const match = time.match(/(\d{2}):(\d{2})/)
  if (match) {
    return parseInt(match[1]) * 60 + parseInt(match[2])
  }
  return null
}
