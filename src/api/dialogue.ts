import request from './request'

export interface Message {
  id: number
  conversationId: number
  role: 'USER' | 'ASSISTANT'
  content: string
  emotion?: string
  emotionScore?: number
  createdAt: string
}

export interface Conversation {
  id: number
  userId: number
  status: string
  createdAt: string
  updatedAt: string
}

export interface UserProfile {
  keyConcerns: string[]
  emotionalBaseline: string
  lastUpdated: string
}

export interface StreamMessage {
  id: string
  role: 'user' | 'model'
  text: string
  timestamp: Date
}

export const dialogueApi = {
  createConversation: () =>
    request.post<any, { data: Conversation }>('/dialogues/conversations'),
  
  sendMessage: (conversationId: number, content: string) =>
    request.post<any, { data: Message }>(`/dialogues/conversations/${conversationId}/messages`, { content }),
  
  getConversationHistory: (conversationId: number) =>
    request.get<any, { data: Message[] }>(`/dialogues/conversations/${conversationId}/messages`),
  
  getMyConversations: () =>
    request.get<any, { data: Conversation[] }>('/dialogues/conversations'),
  
  endConversation: (conversationId: number) =>
    request.post<any, { data: any }>(`/dialogues/conversations/${conversationId}/end`),
}

// SerenityMind API functions
export async function getUserProfile(): Promise<UserProfile> {
  const response: any = await request.get('/dialogue/profile')
  return response as UserProfile
}

export async function updateUserProfile(profile: UserProfile): Promise<void> {
  await request.put('/dialogue/profile', profile)
}

export async function getOrCreateActiveConversation(): Promise<number> {
  const response: any = await request.get('/dialogue/conversation/active')
  return response.id as number
}

export async function sendMessageStream(
  message: string,
  conversationId?: number
): Promise<ReadableStream<string>> {
  const response = await fetch('/api/dialogue/message/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': '1', // TODO: 从认证状态获取真实用户ID
    },
    body: JSON.stringify({
      message,
      mode: 'TEXT',
      conversationId
    })
  })

  if (!response.ok) {
    throw new Error(`获取AI响应失败: ${response.status}`)
  }

  if (!response.body) {
    throw new Error('响应体为空')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  return new ReadableStream({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data:')) {
              const data = line.slice(5).trim()
              if (data && data !== '[DONE]') {
                controller.enqueue(data)
              }
            }
          }
        }
        controller.close()
      } catch (error) {
        controller.error(error)
      }
    }
  })
}
