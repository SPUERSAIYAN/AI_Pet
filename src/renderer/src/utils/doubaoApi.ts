// 豆包兼容模式 API，与通义千问格式完全一致
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatCompletionRequest {
  model: string
  messages: ChatMessage[]
  temperature?: number
  max_tokens?: number
  stream?: boolean
}

// 非流式 API 响应
export interface ChatCompletionResponse {
  choices: Array<{
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

/**
 * 调用豆包大模型 API（兼容模式，与通义千问格式一致）
 * @param baseUrl API 基础地址
 * @param apiKey 豆包 API Key
 * @param model 模型名称，如 "volcengine/doubao-seed-1-8-251228"
 * @param messages 对话消息列表
 * @param maxWords 最大输出字数
 * @param timeout 超时时间（毫秒）
 */
export async function callDoubaoAPI(
  baseUrl: string,
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  maxWords: number = 30,
  timeout: number = 60000
): Promise<string> {
  const url = `${baseUrl}/chat/completions`

  // 添加系统提示，限制输出字数
  const messagesWithSystem: ChatMessage[] = [
    {
      role: 'system',
      content: `请用简洁的语言回答，限制在${maxWords}字以内。`,
    },
    ...messages
  ]

  // 创建 AbortController 用于超时控制
  const controller = new AbortController()
  const timeoutId = setTimeout(() => {
    controller.abort()
  }, timeout)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: messagesWithSystem,
        temperature: 0.7,
        max_tokens: 150,
        stream: false,
      } as ChatCompletionRequest),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`API 请求失败：${response.status} - ${error}`)
    }

    const data = await response.json() as ChatCompletionResponse
    return data.choices[0]?.message?.content || ''
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('请求超时，请检查网络连接')
    }
    throw error
  }
}

/**
 * 豆包日程提醒润色 API（兼容模式，与通义千问格式一致）
 * @param baseUrl API 基础地址
 * @param apiKey 豆包 API Key
 * @param model 模型名称
 * @param reminderTitle 提醒标题
 * @param maxWords 最大输出字数
 */
export async function callDoubaoAPIForReminder(
  baseUrl: string,
  apiKey: string,
  model: string,
  reminderTitle: string,
  maxWords: number = 50
): Promise<string> {
  const url = `${baseUrl}/chat/completions`

  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `你是一个贴心的日程提醒助手。请将用户的日程提醒内容润色成温暖、人性化的提醒语，让用户感到被关心。要求：
- 语气亲切自然
- 简洁明了
- 限制在${maxWords}字以内
- 不要添加额外解释，直接输出润色后的提醒内容`,
    },
    {
      role: 'user',
      content: `请帮我润色这个日程提醒：${reminderTitle}`,
    },
  ]

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.8,
      max_tokens: 100,
      stream: false,
    } as ChatCompletionRequest),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`API 请求失败：${response.status} - ${error}`)
  }

  const data = await response.json() as ChatCompletionResponse
  return data.choices[0]?.message?.content || reminderTitle
}
