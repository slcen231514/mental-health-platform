import { useState, useEffect, useRef } from 'react'
import {
  Card,
  Button,
  Space,
  Typography,
  Radio,
  Progress,
  message,
  Statistic,
  Row,
  Col,
} from 'antd'
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  RedoOutlined,
  ClockCircleOutlined,
  SoundOutlined,
} from '@ant-design/icons'
import { interventionApi } from '@/api/intervention'
import { useNavigate } from 'react-router-dom'

const { Title, Text, Paragraph } = Typography

type MeditationType =
  | 'BREATHING'
  | 'BODY_SCAN'
  | 'MINDFULNESS'
  | 'LOVING_KINDNESS'

interface MeditationOption {
  type: MeditationType
  label: string
  description: string
  duration: number[]
}

export default function Meditation() {
  const [selectedType, setSelectedType] = useState<MeditationType>('BREATHING')
  const [selectedDuration, setSelectedDuration] = useState(5)
  const [isPlaying, setIsPlaying] = useState(false)
  const [remainingTime, setRemainingTime] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const navigate = useNavigate()

  // 冥想类型选项
  const meditationOptions: MeditationOption[] = [
    {
      type: 'BREATHING',
      label: '呼吸冥想',
      description: '专注于呼吸，让思绪平静下来',
      duration: [3, 5, 10, 15],
    },
    {
      type: 'BODY_SCAN',
      label: '身体扫描',
      description: '从头到脚感受身体的每个部位',
      duration: [5, 10, 15, 20],
    },
    {
      type: 'MINDFULNESS',
      label: '正念冥想',
      description: '觉察当下，不评判地观察思绪',
      duration: [5, 10, 15, 20],
    },
    {
      type: 'LOVING_KINDNESS',
      label: '慈心冥想',
      description: '培养对自己和他人的慈悲心',
      duration: [5, 10, 15, 20],
    },
  ]

  const currentOption = meditationOptions.find(
    opt => opt.type === selectedType
  )!

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const handleStart = () => {
    setIsPlaying(true)
    setRemainingTime(selectedDuration * 60) // 转换为秒
    setIsCompleted(false)
  }

  const handlePause = () => {
    setIsPlaying(false)
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
  }

  const handleReset = () => {
    setIsPlaying(false)
    setRemainingTime(0)
    setIsCompleted(false)
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
  }

  useEffect(() => {
    if (isPlaying && remainingTime > 0) {
      timerRef.current = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            handleComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isPlaying, remainingTime])

  const handleComplete = async () => {
    setIsPlaying(false)
    setIsCompleted(true)

    try {
      await interventionApi.recordMeditation({
        type: selectedType,
        duration: selectedDuration,
      })
      message.success('冥想记录已保存！')
    } catch (error) {
      console.error('保存冥想记录失败:', error)
      message.error('保存失败，请重试')
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getProgress = () => {
    const totalSeconds = selectedDuration * 60
    return totalSeconds > 0
      ? ((totalSeconds - remainingTime) / totalSeconds) * 100
      : 0
  }

  const getGuidanceText = () => {
    switch (selectedType) {
      case 'BREATHING':
        return '找一个舒适的姿势坐下，闭上眼睛。将注意力集中在呼吸上，感受空气进出鼻腔的感觉。当思绪飘走时，温柔地将注意力带回到呼吸上。'
      case 'BODY_SCAN':
        return '舒适地躺下或坐下，闭上眼睛。从头顶开始，慢慢将注意力移动到身体的每个部位，感受每个部位的感觉，不做评判。'
      case 'MINDFULNESS':
        return '以舒适的姿势坐下，保持警觉但放松。观察当下的一切——呼吸、身体感觉、声音、想法。不评判，只是观察。'
      case 'LOVING_KINDNESS':
        return '舒适地坐下，闭上眼睛。首先对自己说："愿我平安、愿我快乐、愿我健康。"然后将这份祝福扩展到他人。'
      default:
        return ''
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Title level={2} className="mb-2">
        <SoundOutlined className="mr-2" />
        冥想练习
      </Title>
      <Paragraph type="secondary" className="mb-6">
        通过冥想练习，培养专注力，减轻压力，提升心理健康
      </Paragraph>

      <Row gutter={[24, 24]}>
        {/* 左侧：选择区域 */}
        <Col xs={24} lg={12}>
          <Card title="选择冥想类型">
            <Space direction="vertical" size="large" className="w-full">
              <Radio.Group
                value={selectedType}
                onChange={e => setSelectedType(e.target.value)}
                className="w-full"
              >
                <Space direction="vertical" size="middle" className="w-full">
                  {meditationOptions.map(option => (
                    <Card
                      key={option.type}
                      size="small"
                      className={`cursor-pointer transition-all ${
                        selectedType === option.type
                          ? 'border-blue-500 bg-blue-50'
                          : 'hover:border-blue-300'
                      }`}
                      onClick={() => setSelectedType(option.type)}
                    >
                      <Radio value={option.type}>
                        <div>
                          <Text strong>{option.label}</Text>
                          <br />
                          <Text type="secondary" className="text-sm">
                            {option.description}
                          </Text>
                        </div>
                      </Radio>
                    </Card>
                  ))}
                </Space>
              </Radio.Group>

              <div>
                <Text strong className="block mb-2">
                  选择时长（分钟）
                </Text>
                <Radio.Group
                  value={selectedDuration}
                  onChange={e => setSelectedDuration(e.target.value)}
                  buttonStyle="solid"
                >
                  {currentOption.duration.map(duration => (
                    <Radio.Button key={duration} value={duration}>
                      {duration} 分钟
                    </Radio.Button>
                  ))}
                </Radio.Group>
              </div>
            </Space>
          </Card>
        </Col>

        {/* 右侧：冥想区域 */}
        <Col xs={24} lg={12}>
          <Card>
            <Space
              direction="vertical"
              size="large"
              className="w-full text-center"
            >
              {/* 计时器显示 */}
              <div className="py-8">
                {remainingTime > 0 ? (
                  <div>
                    <Progress
                      type="circle"
                      percent={getProgress()}
                      format={() => (
                        <div>
                          <div className="text-4xl font-bold text-blue-500">
                            {formatTime(remainingTime)}
                          </div>
                          <Text type="secondary" className="text-sm">
                            剩余时间
                          </Text>
                        </div>
                      )}
                      width={200}
                      strokeColor={{
                        '0%': '#108ee9',
                        '100%': '#87d068',
                      }}
                    />
                  </div>
                ) : (
                  <div>
                    <ClockCircleOutlined className="text-6xl text-blue-500 mb-4" />
                    <div className="text-3xl font-bold text-gray-700">
                      {selectedDuration} 分钟
                    </div>
                    <Text type="secondary">准备开始冥想</Text>
                  </div>
                )}
              </div>

              {/* 指导文字 */}
              {!isCompleted && (
                <Card size="small" className="bg-blue-50 border-blue-200">
                  <Paragraph className="!mb-0 text-left">
                    {getGuidanceText()}
                  </Paragraph>
                </Card>
              )}

              {/* 完成提示 */}
              {isCompleted && (
                <Card size="small" className="bg-green-50 border-green-200">
                  <Space direction="vertical" size="small">
                    <Text strong className="text-green-600 text-lg">
                      🎉 冥想完成！
                    </Text>
                    <Text type="secondary">
                      您已完成 {selectedDuration} 分钟的{currentOption.label}
                    </Text>
                    <Button
                      type="link"
                      onClick={() => navigate('/meditation/history')}
                    >
                      查看冥想历史
                    </Button>
                  </Space>
                </Card>
              )}

              {/* 控制按钮 */}
              <Space size="large">
                {!isPlaying && remainingTime === 0 && (
                  <Button
                    type="primary"
                    size="large"
                    icon={<PlayCircleOutlined />}
                    onClick={handleStart}
                  >
                    开始冥想
                  </Button>
                )}
                {isPlaying && (
                  <Button
                    size="large"
                    icon={<PauseCircleOutlined />}
                    onClick={handlePause}
                  >
                    暂停
                  </Button>
                )}
                {!isPlaying && remainingTime > 0 && (
                  <Button
                    type="primary"
                    size="large"
                    icon={<PlayCircleOutlined />}
                    onClick={() => setIsPlaying(true)}
                  >
                    继续
                  </Button>
                )}
                {remainingTime > 0 && (
                  <Button
                    size="large"
                    icon={<RedoOutlined />}
                    onClick={handleReset}
                  >
                    重置
                  </Button>
                )}
              </Space>
            </Space>
          </Card>

          {/* 统计信息 */}
          <Card className="mt-4">
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="本次时长"
                  value={selectedDuration}
                  suffix="分钟"
                  prefix={<ClockCircleOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="冥想类型"
                  value={currentOption.label}
                  valueStyle={{ fontSize: '16px' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
