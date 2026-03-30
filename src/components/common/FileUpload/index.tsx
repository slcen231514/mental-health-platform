import React, { useState } from 'react'
import { Upload, message } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
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
  headers?: Record<string, string> | (() => Record<string, string>)
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
   * 自定义上传请求
   */
  const customRequest = async (options: any) => {
    const {
      file,
      onProgress,
      onSuccess: onSuccessCallback,
      onError: onErrorCallback,
    } = options

    const formData = new FormData()
    // 确保使用原始文件对象
    formData.append('file', file as File)

    // 添加额外的数据
    if (data) {
      Object.keys(data).forEach(key => {
        formData.append(key, String(data[key]))
      })
    }

    try {
      // 获取最新的 headers
      const requestHeaders =
        typeof headers === 'function' ? headers() : headers || {}

      const xhr = new XMLHttpRequest()

      // 监听上传进度
      xhr.upload.addEventListener('progress', e => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100)
          onProgress({ percent })
        }
      })

      // 监听完成
      xhr.addEventListener('load', () => {
        if (xhr.status === 200 || xhr.status === 201) {
          try {
            const response = JSON.parse(xhr.responseText)
            onSuccessCallback(response, file)
          } catch (e) {
            onSuccessCallback(xhr.responseText, file)
          }
        } else {
          onErrorCallback(new Error(`上传失败: ${xhr.status}`))
        }
      })

      // 监听错误
      xhr.addEventListener('error', () => {
        onErrorCallback(new Error('上传失败'))
      })

      // 监听中止
      xhr.addEventListener('abort', () => {
        onErrorCallback(new Error('上传已取消'))
      })

      // 发送请求
      xhr.open('POST', action)

      // 设置请求头（不要设置 Content-Type，让浏览器自动设置 multipart/form-data 的 boundary）
      Object.keys(requestHeaders).forEach(key => {
        // 跳过 content-type，让浏览器自动处理
        if (key.toLowerCase() !== 'content-type') {
          xhr.setRequestHeader(key, requestHeaders[key])
        }
      })

      xhr.send(formData)
    } catch (error) {
      onErrorCallback(error)
    }
  }

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

    // 为文件生成新的 uid，避免重复上传同一文件时的冲突
    // @ts-expect-error antd UploadFile mutates uid on incoming file objects
    file.uid = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`

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
   * 删除文件
   */
  const handleRemove = (file: UploadFile) => {
    const newFileList = fileList.filter(item => item.uid !== file.uid)
    setFileList(newFileList)
    onChange?.(newFileList)
    message.info(`已移除 ${file.name}`)
    return true // 返回 true 表示允许删除
  }

  /**
   * 自定义文件预览
   */
  const handlePreview = async (file: UploadFile) => {
    // 如果有 URL，直接打开
    if (file.url) {
      window.open(file.url, '_blank')
      return
    }

    // 如果是图片且有 thumbUrl，显示预览
    if (file.type?.startsWith('image/') && file.thumbUrl) {
      window.open(file.thumbUrl, '_blank')
      return
    }

    // PDF 文件，尝试从 response 中获取 URL
    if (file.response?.data?.fileUrl) {
      window.open(file.response.data.fileUrl, '_blank')
      return
    }

    message.info('文件预览功能开发中')
  }

  const uploadProps: UploadProps = {
    name: 'file',
    multiple,
    customRequest,
    fileList,
    beforeUpload,
    onChange: handleChange,
    onRemove: handleRemove,
    onPreview: handlePreview,
    accept,
    showUploadList: {
      showPreviewIcon: true,
      showRemoveIcon: true,
      showDownloadIcon: false,
    },
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
