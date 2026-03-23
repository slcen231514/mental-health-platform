import React, { useState, useEffect, useCallback, useRef } from 'react'
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai'
import { v4 as uuidv4 } from 'uuid'
import Header from '../components/serenitymind/components/Header.tsx'
import ChatHistory from '../components/serenitymind/components/ChatHistory.tsx'
import AudioVisualizer from '../components/serenitymind/components/AudioVisualizer.tsx'
import DailyMindfulness from '../components/serenitymind/components/DailyMindfulness.tsx'
import EmotionPulse from '../components/serenitymind/components/EmotionPulse.tsx'
import {
  SessionStatus,
  Message,
  ChatMode,
  UserProfile,
  GroundingSource,
  EmotionState,
} from '../types/serenity.ts'
import { encode, decode, decodeAudioData } from '../utils/audioUtils.ts'

// Removed the explicit aistudio interface and Window declaration as it conflicts
// with the existing environment definitions. We rely on the global aistudio
// object being pre-configured.

const App: React.FC = () => {
  const [mode, setMode] = useState<ChatMode>(ChatMode.TEXT)
  const [status, setStatus] = useState<SessionStatus>(
    SessionStatus.DISCONNECTED
  )
  const [messages, setMessages] = useState<Message[]>([])
  const [currentInput, setCurrentInput] = useState('')
  const [currentOutput, setCurrentOutput] = useState('')
  const [textInputValue, setTextInputValue] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showMemoryPreview, setShowMemoryPreview] = useState(false)

  // 每日正念状态
  const [dailyMindfulness, setDailyMindfulness] = useState<string>('')
  const [isMindfulnessVisible, setIsMindfulnessVisible] = useState(false)

  // 情绪状态
  const [emotions, setEmotions] = useState<EmotionState>({
    user: {
      label: '待探索',
      color: 'border-slate-100 text-slate-400',
      icon: '🍃',
      type: 'calm',
    },
    ai: {
      label: '静候中',
      color: 'border-slate-100 text-slate-400',
      icon: '🕊️',
      type: 'listening',
    },
  })

  // Persistence & Memory
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('serenity_mind_profile')
    return saved
      ? JSON.parse(saved)
      : {
          keyConcerns: [],
          emotionalBaseline: '待观察',
          journeyNarrative: '新旅程的开始。',
          userPreferences: [],
          lastUpdated: new Date().toISOString(),
        }
  })

  // Audio Contexts Refs
  const inputAudioContextRef = useRef<AudioContext | null>(null)
  const outputAudioContextRef = useRef<AudioContext | null>(null)
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null)
  const nextStartTimeRef = useRef<number>(0)
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set())
  const sessionPromiseRef = useRef<Promise<any> | null>(null)

  // Refs for transcriptions
  const inputTranscriptionRef = useRef('')
  const outputTranscriptionRef = useRef('')

  // 统一错误处理逻辑
  const handleApiError = useCallback(async (err: any) => {
    const errorMsg = err?.message || String(err)
    console.error('API Error:', err)

    if (errorMsg.includes('Requested entity was not found.')) {
      setErrorMessage(
        '模型未找到或 API Key 权限不足。请重新选择有效的 API Key。'
      )
      // Accessing aistudio from window safely
      const win = window as any
      if (win.aistudio && typeof win.aistudio.openSelectKey === 'function') {
        await win.aistudio.openSelectKey()
      }
    } else {
      setErrorMessage(errorMsg || '发生未知错误，请重试。')
    }
  }, [])

  // 初始化今日正念内容
  useEffect(() => {
    const fetchDailyMindfulness = async () => {
      const today = new Date().toISOString().split('T')[0]
      const savedMindfulness = localStorage.getItem(
        'serenity_daily_mindfulness'
      )
      const savedDate = localStorage.getItem('serenity_mindfulness_date')

      if (savedMindfulness && savedDate === today) {
        setDailyMindfulness(savedMindfulness)
      } else {
        try {
          // Initialize AI with API_KEY from process.env
          const ai = new GoogleGenAI({
            apiKey: import.meta.env.VITE_GEMINI_API_KEY,
          })
          const prompt =
            '请为我生成一段简短、温馨且充满力量的今日正念引导语或积极肯定语（不超过40字）。它应该帮助用户开启平静的一天。'
          const result = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
          })
          const content =
            result.text?.trim().replace(/^"|"$/g, '') ||
            '深呼吸，感受当下的宁静，你是被爱着的。'
          setDailyMindfulness(content)
          localStorage.setItem('serenity_daily_mindfulness', content)
          localStorage.setItem('serenity_mindfulness_date', today)
        } catch (e) {
          console.warn('Failed to fetch daily mindfulness', e)
        }
      }
    }

    fetchDailyMindfulness()
  }, [])

  const getCurrentLocation = (): Promise<{
    latitude: number
    longitude: number
  } | null> => {
    return new Promise(resolve => {
      if (!navigator.geolocation) return resolve(null)
      navigator.geolocation.getCurrentPosition(
        pos =>
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }),
        () => resolve(null),
        { timeout: 5000 }
      )
    })
  }

  const getSystemInstruction = useCallback(() => {
    const memoryContext =
      userProfile.keyConcerns.length > 0
        ? `\n[深层上下文与长期记忆]:
      - 用户核心关注点: ${userProfile.keyConcerns.join('、')}。
      - 情感基调: ${userProfile.emotionalBaseline}。
      - 旅程回顾: ${userProfile.journeyNarrative}
      - 沟通偏好: ${userProfile.userPreferences.join('、')}。
      
      请利用上述信息在对话中体现连贯性。例如：“我记得你之前提到过...，现在感觉好些了吗？” 或 “基于我们之前的交流，我发现...” 
      这种回溯应该自然而微妙，不要机械化。`
        : '\n这是一个新用户的开始。请通过倾听建立初始信任。'

    return `你是“心语”(SerenityMind)，一个深度共情、专业且多语言的心理支持伴侣。
你的目标是提供一个安全、非评判性的空间。
- **工具**: 利用 Google Search 获取资讯，Google Maps 寻找解忧地点。
- **响应模式**: 始终通过微妙的语言细节体现共情。
- **记忆与连续性**: ${memoryContext}
- **安全**: 若涉及自残风险，请温和提示寻求专业热线。`
  }, [userProfile])

  const analyzeEmotion = useCallback(
    async (userText: string, aiText: string) => {
      try {
        // Initialize AI with API_KEY from process.env
        const ai = new GoogleGenAI({
          apiKey: import.meta.env.VITE_GEMINI_API_KEY,
        })
        const prompt = `分析以下对话片段，识别用户和 AI 的状态。
      返回 JSON: {"user": {"label": "...", "type": "..."}, "ai": {"label": "...", "type": "..."}}
      用户: ${userText}
      AI: ${aiText}`

        const result = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        })

        const data = JSON.parse(result.text || '{}')

        const userMaps: Record<string, any> = {
          sad: { color: 'border-blue-200 text-blue-600', icon: '🌧️' },
          anxious: { color: 'border-purple-200 text-purple-600', icon: '🌪️' },
          happy: { color: 'border-yellow-200 text-yellow-600', icon: '☀️' },
          calm: { color: 'border-green-200 text-green-600', icon: '🌿' },
          frustrated: { color: 'border-rose-200 text-rose-600', icon: '🔥' },
          grateful: { color: 'border-pink-200 text-pink-600', icon: '💖' },
        }

        const aiMaps: Record<string, any> = {
          empathy: { color: 'border-indigo-200 text-indigo-600', icon: '🤝' },
          guiding: { color: 'border-emerald-200 text-emerald-600', icon: '🧭' },
          warm: { color: 'border-orange-200 text-orange-600', icon: '🍵' },
          listening: { color: 'border-slate-200 text-slate-600', icon: '👂' },
        }

        setEmotions({
          user: {
            label: data.user?.label || '平静',
            type: data.user?.type || 'calm',
            ...(userMaps[data.user?.type] || userMaps.calm),
          },
          ai: {
            label: data.ai?.label || '倾听',
            type: data.ai?.type || 'listening',
            ...(aiMaps[data.ai?.type] || aiMaps.listening),
          },
        })
      } catch (e) {
        handleApiError(e)
      }
    },
    [handleApiError]
  )

  const updateMemory = useCallback(
    async (newMessages: Message[]) => {
      if (newMessages.length % 2 !== 0) return

      try {
        // Initialize AI with API_KEY from process.env
        const ai = new GoogleGenAI({
          apiKey: import.meta.env.VITE_GEMINI_API_KEY,
        })
        const analysisPrompt = `作为心理健康助手，请根据对话历史提炼用户的“灵魂画像”更新。
      
      输出 JSON 格式: 
      {
        "keyConcerns": ["关注点A", "关注点B"], 
        "emotionalBaseline": "一词描述用户长期的情绪底色",
        "journeyNarrative": "用一段话描述我们的交流进展及用户的心路历程变化",
        "userPreferences": ["用户喜欢的沟通风格，如：温柔肯定、专业引导"]
      }
      
      对话记录(最近6轮): ${newMessages
        .slice(-12)
        .map(m => `${m.role}: ${m.text}`)
        .join('\n')}`

        const result = await ai.models.generateContent({
          model: 'gemini-3-pro-preview',
          contents: analysisPrompt,
          config: { responseMimeType: 'application/json' },
        })

        const updatedData = JSON.parse(result.text || '{}')
        const newProfile = {
          keyConcerns: Array.from(
            new Set([
              ...userProfile.keyConcerns,
              ...(updatedData.keyConcerns || []),
            ])
          ).slice(-5),
          emotionalBaseline:
            updatedData.emotionalBaseline || userProfile.emotionalBaseline,
          journeyNarrative:
            updatedData.journeyNarrative || userProfile.journeyNarrative,
          userPreferences: Array.from(
            new Set([
              ...userProfile.userPreferences,
              ...(updatedData.userPreferences || []),
            ])
          ).slice(-3),
          lastUpdated: new Date().toISOString(),
        }

        setUserProfile(newProfile)
        localStorage.setItem(
          'serenity_mind_profile',
          JSON.stringify(newProfile)
        )
      } catch (e) {
        handleApiError(e)
      }
    },
    [userProfile, handleApiError]
  )

  const cleanupSession = useCallback(() => {
    if (scriptProcessorRef.current) {
      try {
        scriptProcessorRef.current.disconnect()
      } catch (e) {
        /* ignore */
      }
    }
    if (
      inputAudioContextRef.current &&
      inputAudioContextRef.current.state !== 'closed'
    ) {
      inputAudioContextRef.current.close().catch(() => {
        /* ignore */
      })
    }
    if (
      outputAudioContextRef.current &&
      outputAudioContextRef.current.state !== 'closed'
    ) {
      outputAudioContextRef.current.close().catch(() => {
        /* ignore */
      })
    }
    sourcesRef.current.forEach(s => {
      try {
        s.stop()
      } catch (e) {
        /* ignore */
      }
    })
    sourcesRef.current.clear()
    nextStartTimeRef.current = 0
    setStatus(SessionStatus.DISCONNECTED)
  }, [])

  const handleSendText = async () => {
    if (!textInputValue.trim() || isSending) return

    const userMsg = textInputValue.trim()
    setTextInputValue('')
    setIsSending(true)

    const newUserMessage: Message = {
      id: uuidv4(),
      role: 'user',
      text: userMsg,
      timestamp: new Date(),
    }
    const updatedMessages = [...messages, newUserMessage]
    setMessages(updatedMessages)

    try {
      // Initialize AI with API_KEY from process.env
      const ai = new GoogleGenAI({
        apiKey: import.meta.env.VITE_GEMINI_API_KEY,
      })
      const location = await getCurrentLocation()

      // CRITICAL: Must use gemini-2.5-flash to support googleMaps tool.
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: updatedMessages.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }],
        })),
        config: {
          systemInstruction: getSystemInstruction(),
          temperature: 0.8,
          tools: [{ googleSearch: {} }, { googleMaps: {} }],
          toolConfig: location
            ? {
                retrievalConfig: {
                  latLng: {
                    latitude: location.latitude,
                    longitude: location.longitude,
                  },
                },
              }
            : undefined,
        },
      })

      const groundingSources: GroundingSource[] = []
      const chunks =
        response.candidates?.[0]?.groundingMetadata?.groundingChunks
      if (chunks) {
        chunks.forEach((chunk: any) => {
          if (chunk.web)
            groundingSources.push({
              title: chunk.web.title,
              uri: chunk.web.uri,
            })
          else if (chunk.maps)
            groundingSources.push({
              title: chunk.maps.title || '地图地点',
              uri: chunk.maps.uri,
            })
        })
      }

      const fullResponseText = response.text || '对不起，我暂时无法回应。'
      const aiMsg: Message = {
        id: uuidv4(),
        role: 'model',
        text: fullResponseText,
        timestamp: new Date(),
        groundingSources:
          groundingSources.length > 0 ? groundingSources : undefined,
      }

      setMessages(prev => [...prev, aiMsg])
      analyzeEmotion(userMsg, fullResponseText)
      updateMemory([...updatedMessages, aiMsg])
    } catch (err: any) {
      handleApiError(err)
    } finally {
      setIsSending(false)
    }
  }

  const startVoiceSession = async () => {
    try {
      setErrorMessage(null)
      setStatus(SessionStatus.CONNECTING)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // Create new GoogleGenAI instance right before the call
      const ai = new GoogleGenAI({
        apiKey: import.meta.env.VITE_GEMINI_API_KEY,
      })

      const inputCtx = new (
        window.AudioContext || (window as any).webkitAudioContext
      )({ sampleRate: 16000 })
      const outputCtx = new (
        window.AudioContext || (window as any).webkitAudioContext
      )({ sampleRate: 24000 })
      inputAudioContextRef.current = inputCtx
      outputAudioContextRef.current = outputCtx

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus(SessionStatus.CONNECTED)
            const source = inputCtx.createMediaStreamSource(stream)
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1)
            scriptProcessorRef.current = scriptProcessor
            scriptProcessor.onaudioprocess = event => {
              const inputData = event.inputBuffer.getChannelData(0)
              const int16 = new Int16Array(inputData.length)
              for (let i = 0; i < inputData.length; i++)
                int16[i] = inputData[i] * 32768
              // Ensure data is sent only after the session promise resolves
              sessionPromise
                .then(session => {
                  session.sendRealtimeInput({
                    media: {
                      data: encode(new Uint8Array(int16.buffer)),
                      mimeType: 'audio/pcm;rate=16000',
                    },
                  })
                })
                .catch(() => {
                  /* ignore */
                })
            }
            source.connect(scriptProcessor)
            scriptProcessor.connect(inputCtx.destination)
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              outputTranscriptionRef.current +=
                message.serverContent.outputTranscription.text
              setCurrentOutput(outputTranscriptionRef.current)
            } else if (message.serverContent?.inputTranscription) {
              inputTranscriptionRef.current +=
                message.serverContent.inputTranscription.text
              setCurrentInput(inputTranscriptionRef.current)
            }

            if (message.serverContent?.turnComplete) {
              const fullIn = inputTranscriptionRef.current
              const fullOut = outputTranscriptionRef.current
              if (fullIn || fullOut) {
                const newMsgs: Message[] = [
                  ...(fullIn
                    ? [
                        {
                          id: uuidv4(),
                          role: 'user' as const,
                          text: fullIn,
                          timestamp: new Date(),
                        },
                      ]
                    : []),
                  ...(fullOut
                    ? [
                        {
                          id: uuidv4(),
                          role: 'model' as const,
                          text: fullOut,
                          timestamp: new Date(),
                        },
                      ]
                    : []),
                ]
                setMessages(prev => {
                  const updated = [...prev, ...newMsgs]
                  updateMemory(updated)
                  analyzeEmotion(fullIn, fullOut)
                  return updated
                })
              }
              inputTranscriptionRef.current = ''
              outputTranscriptionRef.current = ''
              setCurrentInput('')
              setCurrentOutput('')
            }

            const base64Audio =
              message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data
            if (base64Audio && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current
              nextStartTimeRef.current = Math.max(
                nextStartTimeRef.current,
                ctx.currentTime
              )
              const audioBuffer = await decodeAudioData(
                decode(base64Audio),
                ctx,
                24000,
                1
              )
              const source = ctx.createBufferSource()
              source.buffer = audioBuffer
              source.connect(ctx.destination)
              source.addEventListener('ended', () =>
                sourcesRef.current.delete(source)
              )
              source.start(nextStartTimeRef.current)
              nextStartTimeRef.current += audioBuffer.duration
              sourcesRef.current.add(source)
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => {
                try {
                  s.stop()
                } catch (e) {
                  /* ignore */
                }
              })
              sourcesRef.current.clear()
              nextStartTimeRef.current = 0
            }
          },
          onerror: e => {
            handleApiError(e)
            setStatus(SessionStatus.ERROR)
            cleanupSession()
          },
          onclose: () => {
            setStatus(SessionStatus.DISCONNECTED)
            cleanupSession()
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: getSystemInstruction(),
        },
      })
      sessionPromiseRef.current = sessionPromise
    } catch (err: any) {
      setStatus(SessionStatus.ERROR)
      handleApiError(err)
    }
  }

  const stopVoiceSession = () => {
    sessionPromiseRef.current?.then(s => {
      try {
        s.close()
      } catch (e) {
        /* ignore */
      }
    })
    cleanupSession()
  }

  const clearMemory = () => {
    localStorage.removeItem('serenity_mind_profile')
    setUserProfile({
      keyConcerns: [],
      emotionalBaseline: '待观察',
      journeyNarrative: '新旅程的开始。',
      userPreferences: [],
      lastUpdated: new Date().toISOString(),
    })
    setEmotions({
      user: {
        label: '待探索',
        color: 'border-slate-100 text-slate-400',
        icon: '🍃',
        type: 'calm',
      },
      ai: {
        label: '静候中',
        color: 'border-slate-100 text-slate-400',
        icon: '🕊️',
        type: 'listening',
      },
    })
    setMessages([])
  }

  useEffect(() => {
    if (mode === ChatMode.TEXT && status === SessionStatus.CONNECTED) {
      stopVoiceSession()
    }
  }, [mode, status, stopVoiceSession])

  const getBackgroundClass = () => {
    const type = emotions.ai.type || 'listening'
    return `bg-${type}`
  }

  return (
    <div
      className={`flex flex-col h-full max-w-7xl mx-auto shadow-2xl relative overflow-hidden transition-all duration-[3000ms] ${getBackgroundClass()}`}
    >
      <div
        className="absolute inset-0 -z-10 transition-all duration-[3000ms]"
        style={{ backgroundColor: 'var(--bg-color-1, #f0f4ff)' }}
      >
        <div
          className="absolute w-[400px] h-[400px] -top-20 -left-20 rounded-full blur-[80px] opacity-40 transition-all duration-[5000ms] animate-breathe"
          style={{ backgroundColor: 'var(--blob-1, #e0f2fe)' }}
        ></div>
        <div
          className="absolute w-[300px] h-[300px] bottom-0 -right-10 rounded-full blur-[80px] opacity-40 transition-all duration-[5000ms] animate-breathe"
          style={{
            backgroundColor: 'var(--blob-2, #bae6fd)',
            animationDelay: '2s',
          }}
        ></div>
      </div>

      <div className="flex-shrink-0">
        <Header />
      </div>

      {isMindfulnessVisible && (
        <DailyMindfulness
          content={dailyMindfulness}
          isVisible={isMindfulnessVisible}
          onClose={() => setIsMindfulnessVisible(false)}
        />
      )}

      <div className="flex-shrink-0 px-4 md:px-6 py-1 bg-white/40 backdrop-blur-sm flex items-center justify-between border-b border-white/20">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowMemoryPreview(!showMemoryPreview)}
            className="flex items-center space-x-2 group"
          >
            <div
              className={`w-2 h-2 rounded-full ${userProfile.keyConcerns.length > 0 ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}
            ></div>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-tighter group-hover:text-indigo-600 transition-colors">
              {userProfile.keyConcerns.length > 0
                ? '深度记忆已激活'
                : '新会话模式'}
            </span>
            <svg
              className={`w-3 h-3 text-slate-400 transition-transform ${showMemoryPreview ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
        {userProfile.keyConcerns.length > 0 && (
          <button
            onClick={clearMemory}
            className="text-[10px] text-slate-400 hover:text-rose-500 underline underline-offset-2 transition-colors"
          >
            清除所有记忆
          </button>
        )}
      </div>

      {showMemoryPreview && (
        <div className="flex-shrink-0 mx-6 mt-2 mb-1 p-3 bg-white/90 backdrop-blur-xl rounded-2xl border border-indigo-100 shadow-xl z-[60] animate-in fade-in slide-in-from-top-4">
          <h4 className="text-[11px] font-black text-indigo-500 uppercase tracking-widest mb-1.5 flex items-center">
            <svg
              className="w-3 h-3 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            我们的心灵旅程
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed mb-3 italic">
            “{userProfile.journeyNarrative}”
          </p>
          <div className="flex flex-wrap gap-1.5">
            {userProfile.keyConcerns.map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] rounded-md font-medium border border-indigo-100"
              >
                #{tag}
              </span>
            ))}
          </div>
          <button
            onClick={() => setShowMemoryPreview(false)}
            className="w-full mt-3 py-1.5 text-[10px] text-slate-400 hover:text-slate-600 font-bold uppercase tracking-tighter transition-colors"
          >
            点击收起
          </button>
        </div>
      )}

      <div className="flex-shrink-0">
        <EmotionPulse emotions={emotions} />
      </div>

      <div className="px-6 pt-1.5 pb-1.5 flex-shrink-0">
        <div className="bg-white/40 backdrop-blur-sm p-1 rounded-xl flex items-center shadow-inner">
          <button
            onClick={() => setMode(ChatMode.TEXT)}
            className={`flex-1 py-1.5 rounded-lg text-sm font-semibold transition-all duration-300 ${mode === ChatMode.TEXT ? 'bg-white shadow-md text-indigo-600 scale-[1.02]' : 'text-slate-500 hover:text-slate-700'}`}
          >
            文字对话
          </button>
          <button
            onClick={() => setMode(ChatMode.VOICE)}
            className={`flex-1 py-1.5 rounded-lg text-sm font-semibold transition-all duration-300 ${mode === ChatMode.VOICE ? 'bg-white shadow-md text-indigo-600 scale-[1.02]' : 'text-slate-500 hover:text-slate-700'}`}
          >
            语音通话
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <ChatHistory
          messages={messages}
          currentInput={currentInput}
          currentOutput={currentOutput}
          isStreaming={isSending}
        />
      </div>

      {errorMessage && (
        <div className="mx-4 md:mx-6 mb-1.5 px-3 py-2 bg-rose-50/80 backdrop-blur-md text-rose-700 text-sm font-medium flex items-center justify-between rounded-xl border border-rose-100 shadow-sm animate-in fade-in slide-in-from-top-2 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <svg
              className="h-4 w-4 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="truncate">{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="hover:bg-rose-100 rounded-full p-1 transition-colors flex-shrink-0 ml-2"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      <div className="flex-shrink-0 px-4 md:px-6 py-2 bg-white/40 backdrop-blur-2xl border-t border-white/20 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
        {mode === ChatMode.VOICE ? (
          <div className="flex flex-col items-center space-y-3">
            <AudioVisualizer
              isActive={status === SessionStatus.CONNECTED}
              isConnecting={status === SessionStatus.CONNECTING}
            />
            {status === SessionStatus.CONNECTED ? (
              <button
                onClick={stopVoiceSession}
                className="w-full py-3 bg-rose-50/80 hover:bg-rose-100 text-rose-600 font-bold rounded-2xl border border-rose-200 transition-all flex items-center justify-center space-x-2 active:scale-95"
              >
                <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
                <span>挂断通话</span>
              </button>
            ) : (
              <button
                onClick={startVoiceSession}
                disabled={status === SessionStatus.CONNECTING}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 transition-all flex items-center justify-center space-x-3 active:scale-[0.98]"
              >
                {status === SessionStatus.CONNECTING ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 005.93 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" />
                  </svg>
                )}
                <span>
                  {status === SessionStatus.CONNECTING
                    ? '正在建立加密连接...'
                    : '启动语音共情对话'}
                </span>
              </button>
            )}
          </div>
        ) : (
          <div className="relative group">
            <textarea
              value={textInputValue}
              onChange={e => setTextInputValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendText()
                }
              }}
              placeholder="在这里分享你的心情..."
              rows={1}
              className="w-full pl-5 pr-14 py-3 bg-white/50 border border-white/40 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all resize-none max-h-32 text-slate-800 placeholder-slate-400 font-medium"
            />
            <button
              onClick={handleSendText}
              disabled={!textInputValue.trim() || isSending}
              className="absolute right-2.5 bottom-2.5 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all shadow-lg active:scale-90"
            >
              {isSending ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              )}
            </button>
          </div>
        )}
      </div>

      {isDisclaimerOpen && (
        <div className="absolute inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-10 max-w-sm shadow-[0_20px_50px_rgba(0,0,0,0.2)] animate-in fade-in zoom-in duration-500 text-center">
            <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center mb-6 mx-auto text-indigo-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">
              安全与隐私提示
            </h2>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium">
              “心语”是一个基于先进 AI
              的情感伴侣。您的对话会本地加密存储以提供连贯体验。我们不是医疗机构，如果您正面临生命安全危机，请务必联系专业热线。
            </p>
            <button
              onClick={() => setIsDisclaimerOpen(false)}
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95"
            >
              进入安全空间
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
