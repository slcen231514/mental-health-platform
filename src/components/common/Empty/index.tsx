import React from 'react'
import { Empty as AntEmpty, Button } from 'antd'
import type { EmptyProps as AntEmptyProps } from 'antd'

/**
 * Empty 组件属性
 */
export interface EmptyProps extends AntEmptyProps {
  /**
   * 空状态标题
   */
  title?: string
  /**
   * 空状态描述
   */
  description?: string
  /**
   * 操作按钮文字
   */
  actionText?: string
  /**
   * 操作按钮点击事件
   */
  onAction?: () => void
  /**
   * 是否显示操作按钮
   */
  showAction?: boolean
  /**
   * 自定义类名
   */
  className?: string
}

/**
 * Empty 空状态组件
 * 用于显示空数据状态，支持自定义描述和操作按钮
 */
const Empty: React.FC<EmptyProps> = ({
  title,
  description = '暂无数据',
  actionText = '刷新',
  onAction,
  showAction = false,
  className = '',
  image = AntEmpty.PRESENTED_IMAGE_SIMPLE,
  ...restProps
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <AntEmpty
        image={image}
        description={
          <div className="text-center">
            {title && <div className="text-base font-medium mb-1">{title}</div>}
            <div className="text-gray-500">{description}</div>
          </div>
        }
        {...restProps}
      >
        {showAction && onAction && (
          <Button type="primary" onClick={onAction}>
            {actionText}
          </Button>
        )}
      </AntEmpty>
    </div>
  )
}

/**
 * 预定义的空状态类型
 */
export const EmptyTypes = {
  /**
   * 无数据
   */
  NoData: (props?: Partial<EmptyProps>) => (
    <Empty description="暂无数据" {...props} />
  ),

  /**
   * 无搜索结果
   */
  NoSearchResult: (props?: Partial<EmptyProps>) => (
    <Empty
      description="未找到相关内容"
      title="无搜索结果"
      showAction
      actionText="清空搜索"
      {...props}
    />
  ),

  /**
   * 无通知
   */
  NoNotification: (props?: Partial<EmptyProps>) => (
    <Empty description="暂无新通知" title="通知列表为空" {...props} />
  ),

  /**
   * 无评估记录
   */
  NoAssessment: (props?: Partial<EmptyProps>) => (
    <Empty
      description="您还没有完成任何评估"
      title="暂无评估记录"
      showAction
      actionText="开始评估"
      {...props}
    />
  ),

  /**
   * 无对话记录
   */
  NoDialogue: (props?: Partial<EmptyProps>) => (
    <Empty
      description="开始与AI对话，获得心理支持"
      title="暂无对话记录"
      showAction
      actionText="开始对话"
      {...props}
    />
  ),

  /**
   * 无预约记录
   */
  NoAppointment: (props?: Partial<EmptyProps>) => (
    <Empty
      description="您还没有预约咨询师"
      title="暂无预约记录"
      showAction
      actionText="预约咨询"
      {...props}
    />
  ),

  /**
   * 网络错误
   */
  NetworkError: (props?: Partial<EmptyProps>) => (
    <Empty
      description="网络连接失败，请检查网络设置"
      title="网络错误"
      showAction
      actionText="重试"
      image={AntEmpty.PRESENTED_IMAGE_DEFAULT}
      {...props}
    />
  ),

  /**
   * 加载失败
   */
  LoadError: (props?: Partial<EmptyProps>) => (
    <Empty
      description="数据加载失败，请稍后重试"
      title="加载失败"
      showAction
      actionText="重新加载"
      image={AntEmpty.PRESENTED_IMAGE_DEFAULT}
      {...props}
    />
  ),
}

export default Empty
