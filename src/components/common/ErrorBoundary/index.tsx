import { Component, ErrorInfo, ReactNode } from 'react'
import { Button, Result } from 'antd'

/**
 * ErrorBoundary 组件属性
 */
interface ErrorBoundaryProps {
  /**
   * 子组件
   */
  children: ReactNode
  /**
   * 自定义错误回调
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  /**
   * 自定义错误展示组件
   */
  fallback?: ReactNode
}

/**
 * ErrorBoundary 组件状态
 */
interface ErrorBoundaryState {
  /**
   * 是否发生错误
   */
  hasError: boolean
  /**
   * 错误对象
   */
  error: Error | null
  /**
   * 错误信息
   */
  errorInfo: ErrorInfo | null
}

/**
 * ErrorBoundary 错误边界组件
 * 用于捕获子组件树中的 JavaScript 错误，记录错误并显示备用 UI
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  /**
   * 当子组件抛出错误时调用
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  /**
   * 捕获错误信息
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // 记录错误信息
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // 更新状态
    this.setState({
      error,
      errorInfo,
    })

    // 调用自定义错误回调
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // 可以在这里上报错误到监控系统
    // reportErrorToService(error, errorInfo)
  }

  /**
   * 重置错误状态
   */
  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  /**
   * 刷新页面
   */
  handleReload = (): void => {
    window.location.reload()
  }

  render(): ReactNode {
    const { hasError, error } = this.state
    const { children, fallback } = this.props

    if (hasError) {
      // 如果提供了自定义错误展示组件，使用它
      if (fallback) {
        return fallback
      }

      // 默认错误展示
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <Result
            status="error"
            title="页面出错了"
            subTitle={
              process.env.NODE_ENV === 'development'
                ? error?.message
                : '抱歉，页面遇到了一些问题，请稍后再试。'
            }
            extra={[
              <Button type="primary" key="reset" onClick={this.handleReset}>
                返回上一页
              </Button>,
              <Button key="reload" onClick={this.handleReload}>
                刷新页面
              </Button>,
            ]}
          />
        </div>
      )
    }

    return children
  }
}

export default ErrorBoundary
