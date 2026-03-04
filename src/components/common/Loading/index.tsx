import React from 'react'
import { Spin } from 'antd'
import type { SpinProps } from 'antd'

/**
 * Loading 组件属性
 */
export interface LoadingProps extends SpinProps {
  /**
   * 是否显示加载状态
   */
  spinning?: boolean
  /**
   * 加载提示文字
   */
  tip?: string
  /**
   * 子组件
   */
  children?: React.ReactNode
  /**
   * 是否全屏显示
   */
  fullscreen?: boolean
  /**
   * 自定义类名
   */
  className?: string
}

/**
 * Loading 加载组件
 * 用于显示加载状态，支持全屏和局部加载
 */
const Loading: React.FC<LoadingProps> = ({
  spinning = true,
  tip = '加载中...',
  children,
  fullscreen = false,
  className = '',
  ...restProps
}) => {
  if (fullscreen) {
    return (
      <div
        className={`fixed inset-0 flex flex-col items-center justify-center bg-white bg-opacity-80 z-50 ${className}`}
      >
        <Spin spinning={spinning} size="large" {...restProps} />
        {tip && <div className="mt-4 text-gray-600">{tip}</div>}
      </div>
    )
  }

  if (children) {
    return (
      <Spin spinning={spinning} tip={tip} className={className} {...restProps}>
        {children}
      </Spin>
    )
  }

  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <Spin spinning={spinning} tip={tip} {...restProps} />
    </div>
  )
}

export default Loading
