import { useState } from 'react'
import { Card, Row, Col, Button, Modal, Steps, Input, Rate, message } from 'antd'
import {
  BulbOutlined,
  AudioOutlined,
  EditOutlined,
  FieldTimeOutlined,
} from '@ant-design/icons'

const tools = [
  {
    key: 'cbt',
    title: 'CBT认知重构',
    description: '通过认知行为疗法技术，识别和改变消极思维模式',
    icon: <BulbOutlined className="text-4xl text-yellow-500" />,
  },
  {
    key: 'meditation',
    title: '正念冥想',
    description: '引导式冥想练习，帮助放松身心，减轻压力',
    icon: <AudioOutlined className="text-4xl text-green-500" />,
  },
  {
    key: 'diary',
    title: '情绪日记',
    description: '记录每日情绪变化，追踪情绪模式',
    icon: <EditOutlined className="text-4xl text-blue-500" />,
  },
  {
    key: 'sleep',
    title: '睡眠管理',
    description: '记录睡眠数据，获取改善建议',
    icon: <FieldTimeOutlined className="text-4xl text-purple-500" />,
  },
]

const cbtSteps = [
  { title: '识别情境', description: '描述引发负面情绪的情境' },
  { title: '识别自动化思维', description: '当时脑海中出现了什么想法？' },
  { title: '识别情绪', description: '这些想法让你产生了什么情绪？' },
  { title: '评估证据', description: '支持和反对这个想法的证据是什么？' },
  { title: '替代思维', description: '有没有更平衡、更现实的看法？' },
]

export default function Intervention() {
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [cbtStep, setCbtStep] = useState(0)
  const [diaryContent, setDiaryContent] = useState('')
  const [emotionLevel, setEmotionLevel] = useState(3)

  const handleCbtNext = () => {
    if (cbtStep < cbtSteps.length - 1) {
      setCbtStep(cbtStep + 1)
    } else {
      message.success('CBT练习完成！')
      setActiveModal(null)
      setCbtStep(0)
    }
  }

  const handleSaveDiary = () => {
    if (!diaryContent.trim()) {
      message.warning('请输入日记内容')
      return
    }
    message.success('日记保存成功！')
    setActiveModal(null)
    setDiaryContent('')
    setEmotionLevel(3)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">干预工具</h1>
      <p className="text-gray-500 mb-6">使用循证疗法工具进行自我调节</p>

      <Row gutter={[16, 16]}>
        {tools.map((tool) => (
          <Col xs={24} sm={12} lg={6} key={tool.key}>
            <Card
              className="h-full text-center card-hover transition-all duration-300 cursor-pointer"
              onClick={() => setActiveModal(tool.key)}
            >
              <div className="mb-4">{tool.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{tool.title}</h3>
              <p className="text-gray-500 text-sm">{tool.description}</p>
              <Button type="primary" className="mt-4">
                开始练习
              </Button>
            </Card>
          </Col>
        ))}
      </Row>

      {/* CBT Modal */}
      <Modal
        title="CBT认知重构练习"
        open={activeModal === 'cbt'}
        onCancel={() => { setActiveModal(null); setCbtStep(0) }}
        footer={null}
        width={600}
      >
        <Steps current={cbtStep} items={cbtSteps} className="mb-6" size="small" />
        <Card className="mb-4">
          <h4 className="font-semibold mb-2">{cbtSteps[cbtStep].title}</h4>
          <p className="text-gray-500 mb-4">{cbtSteps[cbtStep].description}</p>
          <Input.TextArea rows={4} placeholder="请在这里写下你的想法..." />
        </Card>
        <div className="flex justify-between">
          <Button onClick={() => setCbtStep(Math.max(0, cbtStep - 1))} disabled={cbtStep === 0}>
            上一步
          </Button>
          <Button type="primary" onClick={handleCbtNext}>
            {cbtStep === cbtSteps.length - 1 ? '完成' : '下一步'}
          </Button>
        </div>
      </Modal>

      {/* Meditation Modal */}
      <Modal
        title="正念冥想"
        open={activeModal === 'meditation'}
        onCancel={() => setActiveModal(null)}
        footer={null}
      >
        <div className="text-center py-8">
          <AudioOutlined className="text-6xl text-green-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">5分钟呼吸冥想</h3>
          <p className="text-gray-500 mb-6">找一个安静的地方，跟随引导进行呼吸练习</p>
          <Button type="primary" size="large">
            开始冥想
          </Button>
        </div>
      </Modal>

      {/* Diary Modal */}
      <Modal
        title="情绪日记"
        open={activeModal === 'diary'}
        onCancel={() => setActiveModal(null)}
        onOk={handleSaveDiary}
        okText="保存"
      >
        <div className="mb-4">
          <label className="block mb-2 font-medium">今天的情绪如何？</label>
          <Rate value={emotionLevel} onChange={setEmotionLevel} />
          <span className="ml-2 text-gray-500">
            {['很差', '较差', '一般', '较好', '很好'][emotionLevel - 1]}
          </span>
        </div>
        <div>
          <label className="block mb-2 font-medium">记录今天的心情</label>
          <Input.TextArea
            rows={6}
            value={diaryContent}
            onChange={(e) => setDiaryContent(e.target.value)}
            placeholder="今天发生了什么？你的感受是什么？"
          />
        </div>
      </Modal>

      {/* Sleep Modal */}
      <Modal
        title="睡眠管理"
        open={activeModal === 'sleep'}
        onCancel={() => setActiveModal(null)}
        footer={null}
      >
        <div className="text-center py-4">
          <FieldTimeOutlined className="text-6xl text-purple-500 mb-4" />
          <p className="text-gray-500 mb-4">记录你的睡眠数据，获取个性化改善建议</p>
          <Row gutter={16}>
            <Col span={12}>
              <Card size="small">
                <div className="text-2xl font-bold text-primary">7.5h</div>
                <div className="text-gray-500">平均睡眠时长</div>
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small">
                <div className="text-2xl font-bold text-green-500">85%</div>
                <div className="text-gray-500">睡眠质量</div>
              </Card>
            </Col>
          </Row>
          <Button type="primary" className="mt-4">
            记录今日睡眠
          </Button>
        </div>
      </Modal>
    </div>
  )
}
