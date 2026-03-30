import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Typography, Space, Tag, Button, Divider, message } from 'antd'
import {
  ArrowLeftOutlined,
  EyeOutlined,
  LikeOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Loading } from '@/components'
import request from '@/api/request'

const { Title, Paragraph, Text } = Typography

interface ArticleDetail {
  id: number
  title: string
  description: string
  contentType: string
  contentUrl?: string
  coverImageUrl?: string
  author?: string
  tags?: string
  viewCount: number
  likeCount: number
  createdAt: string
}

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [article, setArticle] = useState<ArticleDetail | null>(null)

  useEffect(() => {
    if (id) {
      fetchArticleDetail()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchArticleDetail = async () => {
    try {
      setLoading(true)
      const response = await request.get(`/dashboard/recommendations/${id}`)
      setArticle(response.data)
    } catch (error) {
      console.error('获取文章详情失败:', error)
      message.error('获取文章详情失败')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loading fullscreen tip="加载中..." />
  }

  if (!article) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Text type="secondary">文章不存在</Text>
          <div style={{ marginTop: 16 }}>
            <Button onClick={() => navigate('/')}>返回首页</Button>
          </div>
        </div>
      </Card>
    )
  }

  const tags = article.tags ? article.tags.split(',').map(t => t.trim()) : []

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/')}
        style={{ marginBottom: 16 }}
      >
        返回
      </Button>

      <Card>
        {article.coverImageUrl && (
          <img
            src={article.coverImageUrl}
            alt={article.title}
            style={{
              width: '100%',
              maxHeight: 400,
              objectFit: 'cover',
              borderRadius: 8,
              marginBottom: 24,
            }}
          />
        )}

        <Title level={2}>{article.title}</Title>

        <Space size="large" style={{ marginBottom: 24 }}>
          {article.author && (
            <Space>
              <UserOutlined />
              <Text type="secondary">{article.author}</Text>
            </Space>
          )}
          <Space>
            <EyeOutlined />
            <Text type="secondary">{article.viewCount} 浏览</Text>
          </Space>
          <Space>
            <LikeOutlined />
            <Text type="secondary">{article.likeCount} 点赞</Text>
          </Space>
        </Space>

        {tags.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            {tags.map((tag, index) => (
              <Tag key={index} color="blue">
                {tag}
              </Tag>
            ))}
          </div>
        )}

        <Divider />

        <div style={{ fontSize: 16, lineHeight: 1.8 }}>
          {article.description.split('\n').map((paragraph, index) => (
            <Paragraph
              key={index}
              style={{ marginBottom: paragraph.trim() ? 16 : 8 }}
            >
              {paragraph.trim() || '\u00A0'}
            </Paragraph>
          ))}
        </div>

        {article.contentUrl && (
          <div style={{ marginTop: 32, textAlign: 'center' }}>
            <Button
              type="primary"
              size="large"
              onClick={() => window.open(article.contentUrl, '_blank')}
            >
              查看完整内容
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
