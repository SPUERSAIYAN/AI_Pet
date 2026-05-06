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

export interface ChatCompletionStreamResponse {
  choices: Array<{
    delta: {
      role?: string
      content?: string
    }
    finish_reason?: string
  }>
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

export async function callQwenAPI(
  baseUrl: string,
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  maxWords: number = 30,
  timeout: number = 10000
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
        max_tokens: 80,
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

// 流式输出版本
export async function callQwenAPIStream(
  baseUrl: string,
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  maxWords: number = 30,
  onChunk: (chunk: string) => void,
  abortSignal?: AbortSignal
): Promise<void> {
  const url = `${baseUrl}/chat/completions`

  // 添加系统提示，限制输出字数
  const messagesWithSystem: ChatMessage[] = [
    {
      role: 'system',
      content: `请用简洁的语言回答，限制在${maxWords}字以内。`,
    },
    ...messages
  ]

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
      max_tokens: 80,
      stream: true,
    } as ChatCompletionRequest),
    signal: abortSignal,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`API 请求失败：${response.status} - ${error}`)
  }

  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error('无法获取响应流')
  }

  const decoder = new TextDecoder()
  let fullContent = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n').filter(line => line.trim())

      for (const line of lines) {
        if (line.includes('[DONE]')) return

        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6)) as ChatCompletionStreamResponse
            const content = data.choices[0]?.delta?.content || ''
            if (content) {
              fullContent += content
              onChunk(content)
            }
          } catch (e) {
            // 跳过解析失败的行
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }

  return fullContent
}

// 日程提醒润色 API
export async function callQwenAPIForReminder(
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
