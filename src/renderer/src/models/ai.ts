import { createModel } from '@rematch/core'
import { RootModel } from './'
import { callQwenAPI, ChatMessage } from '../utils/qwenApi'
import { callDoubaoAPI } from '../utils/doubaoApi'

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
}

export type AIProvider = 'qwen' | 'doubao'

export interface AIConfig {
  apiKey: string
  baseUrl: string
  model: string
  enabled: boolean
  provider: AIProvider
}

const defaultConfig: AIConfig = {
  apiKey: '',
  baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  model: 'qwen3.5-plus',
  enabled: false,
  provider: 'qwen',
}

export const ai = createModel<RootModel>()({
  state: {
    messages: [],
    config: defaultConfig,
    isLoading: false,
    inputText: '',
  } as {
    messages: Message[]
    config: AIConfig
    isLoading: boolean
    inputText: string
  },
  reducers: {
    setMessages(state, messages: Message[]) {
      return { ...state, messages }
    },
    addMessage(state, message: Message) {
      return { ...state, messages: [...state.messages, message] }
    },
    setConfig(state, config: Partial<AIConfig>) {
      return { ...state, config: { ...state.config, ...config } }
    },
    setIsLoading(state, isLoading: boolean) {
      return { ...state, isLoading }
    },
    setInputText(state, text: string) {
      return { ...state, inputText: text }
    },
    clearMessages(state) {
      return { ...state, messages: [] }
    },
    resetLoading(state) {
      return { ...state, isLoading: false }
    },
  },
  effects: (dispatch) => ({
    async sendMessage(content: string, rootState) {
      const { config, messages } = rootState.ai

      if (!config.enabled || !config.apiKey) {
        throw new Error('AI 功能未启用或 API Key 未设置')
      }

      // 添加用户消息
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content,
        timestamp: Date.now(),
      }
      dispatch.ai.addMessage(userMessage)
      dispatch.ai.setIsLoading(true)

      try {
        // 转换为 API 格式
        const chatMessages: ChatMessage[] = messages.map((m) => ({
          role: m.role,
          content: m.content,
        }))
        chatMessages.push({ role: 'user', content })

        let fullContent = ''

        // 根据提供商调用不同的 API
        if (config.provider === 'doubao') {
          // 豆包 API
          fullContent = await callDoubaoAPI(
            config.baseUrl,
            config.apiKey,
            config.model,
            chatMessages,
            30,
            60000
          )
        } else {
          // 通义千问 API
          fullContent = await callQwenAPI(
            config.baseUrl,
            config.apiKey,
            config.model,
            chatMessages,
            30,
            60000
          )
        }

        // 添加 AI 回复
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: fullContent,
          timestamp: Date.now(),
        }
        dispatch.ai.addMessage(assistantMessage)
      } catch (error) {
        // 添加错误消息
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `抱歉，出错了：${error instanceof Error ? error.message : '未知错误'}`,
          timestamp: Date.now(),
        }
        dispatch.ai.addMessage(errorMessage)
      } finally {
        dispatch.ai.setIsLoading(false)
      }
    },
  }),
})
