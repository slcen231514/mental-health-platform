import { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  InputNumber,
  message,
  Popconfirm,
  Tag,
  Upload,
  Image,
  Typography,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import type { UploadFile, UploadProps } from 'antd'
import request from '@/api/request'

const { TextArea } = Input
const { Option } = Select
const { Text } = Typography

interface ContentRecommendation {
  id: number
  type: string
  title: string
  description: string
  thumbnail?: string
  url?: string
  author?: string
  tags?: string
  viewCount?: number
  likeCount?: number
}

export default function ContentManagement() {
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState<ContentRecommendation[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [uploading, setUploading] = useState(false)
  const [coverImageUrl, setCoverImageUrl] = useState<string>('')
  const [form] = Form.useForm()

  useEffect(() => {
    fetchData()
  }, [page, pageSize])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await request.get('/admin/content/recommendations', {
        params: { page: page - 1, size: pageSize },
      })

      if (response.data.content) {
        setDataSource(response.data.content)
        setTotal(response.data.totalElements)
      }
    } catch (error) {
      console.error('获取推荐内容失败:', error)
      message.error('获取推荐内容失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingId(null)
    setCoverImageUrl('')
    form.resetFields()
    form.setFieldsValue({
      contentType: 'ARTICLE',
      sortOrder: 0,
      isPublished: false,
    })
    setModalVisible(true)
  }

  const handleEdit = async (record: ContentRecommendation) => {
    try {
      const response = await request.get(
        `/admin/content/recommendations/${record.id}`
      )
      setEditingId(record.id)

      // 将前端的 type 转换回后端的 contentType
      const contentType = record.type === 'video' ? 'VIDEO' : 'ARTICLE'

      const imageUrl = response.data.thumbnail || record.thumbnail || ''
      setCoverImageUrl(imageUrl)

      form.setFieldsValue({
        title: response.data.title || record.title,
        description: response.data.description || record.description,
        contentType: contentType,
        contentUrl: response.data.url || record.url,
        coverImageUrl: imageUrl,
        author: response.data.author || record.author,
        tags: response.data.tags || record.tags,
        sortOrder: 0,
        isPublished: true,
      })
      setModalVisible(true)
    } catch (error) {
      console.error('获取推荐内容详情失败:', error)
      message.error('获取推荐内容详情失败')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await request.delete(`/admin/content/recommendations/${id}`)
      message.success('删除成功')
      fetchData()
    } catch (error) {
      console.error('删除失败:', error)
      message.error('删除失败')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      // 使用上传的图片URL
      if (coverImageUrl) {
        values.coverImageUrl = coverImageUrl
      }

      if (editingId) {
        await request.put(`/admin/content/recommendations/${editingId}`, values)
        message.success('更新成功')
      } else {
        await request.post('/admin/content/recommendations', values)
        message.success('创建成功')
      }

      setModalVisible(false)
      setCoverImageUrl('')
      fetchData()
    } catch (error) {
      console.error('提交失败:', error)
      message.error('提交失败')
    }
  }

  // 处理图片上传
  const handleUpload: UploadProps['customRequest'] = async options => {
    const { file, onSuccess, onError } = options

    console.log('开始上传文件:', file)

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file as File)

      console.log('发送上传请求到: /admin/content/upload/cover')

      // 使用recommendation服务的文件上传接口
      const response = await request.post(
        '/admin/content/upload/cover',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      console.log('上传响应:', response)

      if (response.data) {
        const url = response.data
        console.log('上传成功，URL:', url)
        setCoverImageUrl(url)
        form.setFieldsValue({ coverImageUrl: url })
        message.success('上传成功')
        onSuccess?.(response.data)
      }
    } catch (error) {
      console.error('上传失败:', error)
      message.error('上传失败: ' + (error as any)?.message || '未知错误')
      onError?.(error as Error)
    } finally {
      setUploading(false)
    }
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 200,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => {
        const typeMap: Record<string, { text: string; color: string }> = {
          article: { text: '文章', color: 'blue' },
          video: { text: '视频', color: 'green' },
          exercise: { text: '练习', color: 'orange' },
        }
        const config = typeMap[type] || { text: type, color: 'default' }
        return <Tag color={config.color}>{config.text}</Tag>
      },
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
      width: 120,
    },
    {
      title: '浏览/点赞',
      key: 'stats',
      width: 120,
      render: (_: any, record: ContentRecommendation) => (
        <span>
          <EyeOutlined /> {record.viewCount || 0} / {record.likeCount || 0}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_: any, record: ContentRecommendation) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className="content-management-container">
      <Card
        title="内容推荐管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加推荐内容
          </Button>
        }
      >
        <Table
          loading={loading}
          dataSource={dataSource}
          columns={columns}
          rowKey="id"
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showTotal: total => `共 ${total} 条`,
            onChange: (page, pageSize) => {
              setPage(page)
              setPageSize(pageSize)
            },
          }}
        />
      </Card>

      <Modal
        title={editingId ? '编辑推荐内容' : '添加推荐内容'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={800}
        okText="提交"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入标题" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
            rules={[{ required: true, message: '请输入描述' }]}
          >
            <TextArea rows={4} placeholder="请输入描述" />
          </Form.Item>

          <Form.Item
            name="contentType"
            label="内容类型"
            rules={[{ required: true, message: '请选择内容类型' }]}
          >
            <Select placeholder="请选择内容类型">
              <Option value="ARTICLE">文章</Option>
              <Option value="VIDEO">视频</Option>
              <Option value="IMAGE">图片</Option>
            </Select>
          </Form.Item>

          <Form.Item name="contentUrl" label="内容URL">
            <Input placeholder="请输入内容URL" />
          </Form.Item>

          <Form.Item name="coverImageUrl" label="封面图片URL">
            <Input placeholder="请输入封面图片URL或上传图片" />
          </Form.Item>

          <Form.Item label="上传封面图片">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Upload
                accept="image/*"
                maxCount={1}
                customRequest={handleUpload}
                showUploadList={true}
                disabled={uploading}
                listType="picture"
              >
                <Button icon={<UploadOutlined />} loading={uploading}>
                  {uploading ? '上传中...' : '选择图片'}
                </Button>
              </Upload>
              {coverImageUrl && (
                <div>
                  <Text type="secondary">当前封面：</Text>
                  <Image
                    src={coverImageUrl}
                    alt="封面预览"
                    style={{
                      maxWidth: '200px',
                      maxHeight: '200px',
                      marginTop: 8,
                    }}
                  />
                </div>
              )}
            </Space>
          </Form.Item>

          <Form.Item name="author" label="作者">
            <Input placeholder="请输入作者" />
          </Form.Item>

          <Form.Item name="tags" label="标签">
            <Input placeholder="请输入标签，多个标签用逗号分隔" />
          </Form.Item>

          <Form.Item name="sortOrder" label="排序权重">
            <InputNumber
              min={0}
              placeholder="数字越大越靠前"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="isPublished"
            label="是否发布"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
