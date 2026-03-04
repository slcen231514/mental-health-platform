import { useState } from 'react'
import { Card, Row, Col, Avatar, Tag, Button, Rate, Modal, DatePicker, TimePicker, message } from 'antd'
import { UserOutlined, CheckCircleOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

const counselors = [
  {
    id: 1,
    name: '张医生',
    title: '主任心理咨询师',
    specialties: ['抑郁症', '焦虑症', '情绪管理'],
    rating: 4.9,
    consultations: 1280,
    price: 300,
    introduction: '从业15年，擅长认知行为疗法，帮助数千名来访者走出心理困境。',
    online: true,
  },
  {
    id: 2,
    name: '李医生',
    title: '资深心理咨询师',
    specialties: ['人际关系', '职场压力', '自我成长'],
    rating: 4.8,
    consultations: 856,
    price: 250,
    introduction: '专注于职场心理健康，帮助来访者建立健康的人际关系和职业发展。',
    online: true,
  },
  {
    id: 3,
    name: '王医生',
    title: '心理咨询师',
    specialties: ['青少年心理', '家庭关系', '学业压力'],
    rating: 4.7,
    consultations: 520,
    price: 200,
    introduction: '专注青少年心理健康，帮助青少年和家庭建立良好的沟通模式。',
    online: false,
  },
]

export default function Counselor() {
  const [selectedCounselor, setSelectedCounselor] = useState<typeof counselors[0] | null>(null)
  const [bookingModal, setBookingModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null)
  const [selectedTime, setSelectedTime] = useState<dayjs.Dayjs | null>(null)

  const handleBook = (counselor: typeof counselors[0]) => {
    setSelectedCounselor(counselor)
    setBookingModal(true)
  }

  const handleConfirmBooking = () => {
    if (!selectedDate || !selectedTime) {
      message.warning('请选择预约日期和时间')
      return
    }
    message.success(`预约成功！您已预约${selectedCounselor?.name}的咨询服务`)
    setBookingModal(false)
    setSelectedDate(null)
    setSelectedTime(null)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">专业咨询师</h1>
      <p className="text-gray-500 mb-6">预约专业心理咨询师，获得一对一咨询服务</p>

      <Row gutter={[16, 16]}>
        {counselors.map((counselor) => (
          <Col xs={24} lg={12} key={counselor.id}>
            <Card className="card-hover transition-all duration-300">
              <div className="flex">
                <Avatar size={80} icon={<UserOutlined />} className="bg-primary" />
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-semibold">{counselor.name}</span>
                      <Tag color={counselor.online ? 'success' : 'default'} className="ml-2">
                        {counselor.online ? '在线' : '离线'}
                      </Tag>
                    </div>
                    <span className="text-xl font-bold text-primary">¥{counselor.price}/次</span>
                  </div>
                  <div className="text-gray-500 text-sm">{counselor.title}</div>
                  <div className="flex items-center mt-1">
                    <Rate disabled defaultValue={counselor.rating} allowHalf className="text-sm" />
                    <span className="ml-2 text-gray-500">{counselor.rating}</span>
                    <span className="ml-4 text-gray-400">咨询 {counselor.consultations} 次</span>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  {counselor.specialties.map((s) => (
                    <Tag key={s} color="blue">{s}</Tag>
                  ))}
                </div>
                <p className="text-gray-500 text-sm mb-4">{counselor.introduction}</p>
                <Button type="primary" block onClick={() => handleBook(counselor)}>
                  立即预约
                </Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title={`预约 ${selectedCounselor?.name}`}
        open={bookingModal}
        onCancel={() => setBookingModal(false)}
        onOk={handleConfirmBooking}
        okText="确认预约"
      >
        {selectedCounselor && (
          <div>
            <div className="flex items-center mb-4 p-4 bg-gray-50 rounded">
              <Avatar size={48} icon={<UserOutlined />} className="bg-primary" />
              <div className="ml-3">
                <div className="font-semibold">{selectedCounselor.name}</div>
                <div className="text-gray-500 text-sm">{selectedCounselor.title}</div>
              </div>
              <div className="ml-auto text-xl font-bold text-primary">
                ¥{selectedCounselor.price}
              </div>
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-medium">选择日期</label>
              <DatePicker
                className="w-full"
                value={selectedDate}
                onChange={setSelectedDate}
                disabledDate={(current) => current && current < dayjs().startOf('day')}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-medium">选择时间</label>
              <TimePicker
                className="w-full"
                value={selectedTime}
                onChange={setSelectedTime}
                format="HH:mm"
                minuteStep={30}
              />
            </div>
            <div className="p-3 bg-blue-50 rounded text-sm">
              <CheckCircleOutlined className="text-primary mr-2" />
              预约成功后，咨询师将在预约时间通过视频与您进行咨询
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
