import React from 'react'
import { Card, Tag, Rate, Button, Avatar } from 'antd'
import { UserOutlined, TeamOutlined } from '@ant-design/icons'
import { CounselorDTO } from '@/api/counselor'
import { useNavigate } from 'react-router-dom'

interface CounselorCardProps {
  counselor: CounselorDTO
}

const CounselorCard: React.FC<CounselorCardProps> = ({ counselor }) => {
  const navigate = useNavigate()

  const handleViewDetail = () => {
    navigate(`/counselor/${counselor.id}`)
  }

  return (
    <Card
      hoverable
      className="counselor-card"
      cover={
        <div className="flex justify-center items-center h-48 bg-gradient-to-br from-blue-50 to-indigo-50">
          <Avatar
            size={120}
            src={counselor.avatar}
            icon={<UserOutlined />}
            className="border-4 border-white shadow-lg"
          />
        </div>
      }
      actions={[
        <Button type="primary" onClick={handleViewDetail} key="detail">
          查看详情
        </Button>,
      ]}
    >
      <div className="space-y-3">
        {/* 姓名和在线状态 */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold m-0">{counselor.name}</h3>
          {counselor.isOnline && <Tag color="green">在线</Tag>}
        </div>

        {/* 资质 */}
        <div className="text-sm text-gray-600">{counselor.qualification}</div>

        {/* 评分和咨询次数 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Rate disabled value={counselor.rating} allowHalf />
            <span className="text-sm text-gray-600">
              {counselor.rating.toFixed(1)}
            </span>
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <TeamOutlined />
            <span>{counselor.consultationCount}次咨询</span>
          </div>
        </div>

        {/* 专长领域 */}
        <div className="flex flex-wrap gap-1">
          {counselor.specialties.slice(0, 3).map((specialty, index) => (
            <Tag key={index} color="blue">
              {specialty}
            </Tag>
          ))}
          {counselor.specialties.length > 3 && (
            <Tag>+{counselor.specialties.length - 3}</Tag>
          )}
        </div>

        {/* 简介 */}
        <div className="text-sm text-gray-600 line-clamp-2">
          {counselor.introduction}
        </div>

        {/* 价格 */}
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm text-gray-600">咨询费用</span>
          <span className="text-lg font-semibold text-primary">
            ¥{counselor.price}
            <span className="text-sm text-gray-600 font-normal">/小时</span>
          </span>
        </div>
      </div>
    </Card>
  )
}

export default CounselorCard
