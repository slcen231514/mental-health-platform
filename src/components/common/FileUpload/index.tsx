import React, { useState } from 'react'
import { Upload, message, Progress } from 'antd'
import { InboxOutlined, FileOutlined } from '@ant-design/icons'
import type { UploadProps, UploadFile } from 'antd'

const { Dragger } = Upload

/**
 * 文件上传组件属性
 */
export interface FileUploadProps {
  /**
   * 允许的文件格式
   */
  accept?: string
  /**
   * 最大文件大小（MB）
   */
  maxSize?: number
  /**
   * 是否支持多文件上传
   */
  multiple?: boolean
  /**
   * 上传接口地址
   */
  action: string
  /**
   * 上传成功回调
   */
  onSuccess?: (file: UploadFile, response: Record<string, unknown>) => void
  /**
   * 上传失败回调
   */
  onError?: (file: UploadFile, error: Error) => void
  /**
   * 文件列表变化回调
   */
  onChange?: (fileList: UploadFile[]) => void
  /**
   * 自定义请求头
   */
  headers?: Record<string, string>
  /**
   * 额外的上传参数
   */
  data?: Record<string, unknown>
}

/**
 * 文件上传组件
 * 支持拖拽上传和点击上传
 * 显示上传进度和文件预览
 */
const FileUpload: React.FC<FileUploadProps> = ({
  accept = '.pdf,.jpg,.jpeg,.png',
  maxSize = 10,
  multiple = false,
  action,
  onSuccess,
  onError,
  onChange,
  headers,
  data,
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [uploading, setUploading] = useState(false)

  /**
   * 上传前的文件验证
   */
  const beforeUpload: UploadProps['beforeUpload'] = file => {
    // 验证文件格式
    const acceptedFormats = accept.split(',').map(f => f.trim().toLowerCase())
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`

    if (!acceptedFormats.includes(fileExtension)) {
      message.error(`不支持的文件格式！仅支持 ${accept} 格式的文件`)
      return Upload.LIST_IGNORE
    }

    // 验证文件大小
    const isLtMaxSize = file.size / 1024 / 1024 < maxSize
    if (!isLtMaxSize) {
      message.error(`文件大小不能超过 ${maxSize}MB！`)
      return Upload.LIST_IGNORE
    }

    return true
  }

  /**
   * 文件列表变化处理
   */
  const handleChange: UploadProps['onChange'] = info => {
    let newFileList = [...info.fileList]

    // 限制文件列表长度
    if (!multiple) {
      newFileList = newFileList.slice(-1)
    }

    setFileList(newFileList)
    onChange?.(newFileList)

    const { status } = info.file

    if (status === 'uploading') {
      setUploading(true)
    }

    if (status === 'done') {
      setUploading(false)
      message.success(`${info.file.name} 上传成功`)
      onSuccess?.(info.file, info.file.response)
    } else if (status === 'error') {
      setUploading(false)
      message.error(`${info.file.name} 上传失败`)
      onError?.(info.file, new Error('上传失败'))
    }
  }

  /**
   * 自定义文件预览
   */
  const handlePreview = async (file: UploadFile) => {
    // 如果是图片，显示预览
    if (file.type?.startsWith('image/')) {
      const url = file.url || file.thumbUrl
      if (url) {
        window.open(url, '_blank')
      }
    } else {
      // 其他文件类型，下载
      if (file.url) {
        window.open(file.url, '_blank')
      }
    }
  }

  /**
   * 自定义文件图标
   */
  const itemRender: UploadProps['itemRender'] = (_originNode, file) => {
    const isImage = file.type?.startsWith('image/')

    return (
      <div className="ant-upload-list-item">
        <div className="ant-upload-list-item-info">
          <span className="ant-upload-list-item-thumbnail">
            {isImage && file.thumbUrl ? (
              <img src={file.thumbUrl} alt={file.name} />
            ) : (
              <FileOutlined />
            )}
          </span>
          <span className="ant-upload-list-item-name">{file.name}</span>
        </div>
        {file.status === 'uploading' && (
          <Progress
            percent={file.percent}
            size="small"
            status="active"
            showInfo={false}
          />
        )}
        <span className="ant-upload-list-item-actions">
          <button
            type="button"
            onClick={() => handlePreview(file)}
            className="ant-upload-list-item-action"
          >
            预览
          </button>
        </span>
      </div>
    )
  }

  const uploadProps: UploadProps = {
    name: 'file',
    multiple,
    action,
    headers,
    data,
    fileList,
    beforeUpload,
    onChange: handleChange,
    onPreview: handlePreview,
    itemRender,
    accept,
  }

  return (
    <Dragger {...uploadProps} disabled={uploading}>
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
      <p className="ant-upload-hint">
        支持 {accept} 格式，单个文件不超过 {maxSize}MB
        {multiple && '，支持批量上传'}
      </p>
    </Dragger>
  )
}

export default FileUpload
