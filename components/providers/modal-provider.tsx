"use client"
import { useEffect, useState } from "react"

import { CreateServerModal } from "@/components/modals/create-server-modal"
import { InviteModal } from "@/components/modals/invite-modal"
import { EditServerModal } from "@/components/modals/edit-server-modal"

/**
 * 所有对话框的提供者-将所有对话框集中处理水合作用
 *
 * @returns
 */
export const ModalProvider = () => {
	// 防止服务器端渲染与客户端渲染不匹配：
	// 在使用服务器端渲染（SSR）或静态生成（SSG）时，组件在服务器上渲染的 HTML 会直接发送到客户端。客户端接收到 HTML 后，React 会在现有的 DOM 上进行水合作用。
	// 某些情况下，服务器端渲染的内容与客户端渲染的内容可能会不一致，导致水合作用失败或警告。这种模式可以确保组件内容只在客户端渲染时显示，从而避免不一致的问题。
	// 避免在初次渲染时依赖客户端特定的功能：
	// 某些操作或功能（如访问 window 或 document 对象）只能在客户端环境中运行。确保组件挂载完成后再执行这些操作可以避免错误。
	// 性能优化：
	// 在初次渲染时延迟显示某些内容或执行某些操作，可以减少首次渲染的时间，提高页面加载速度。
	const [isMounted, setIsMounted] = useState(false)

	useEffect(() => {
		setIsMounted(true)
	}, [])

	if (!isMounted) {
		return null
	}

	return (
		<>
			<CreateServerModal />
			<InviteModal />
			<EditServerModal />
		</>
	)
}
