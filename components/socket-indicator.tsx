"use client"

import { useSocket } from "@/components/providers/socket-provider"
import { Badge } from "@/components/ui/badge"

/**
 * WebSocket连接显示组件
 * - 在聊天界面右上角位置
 * - 用于显示socket服务是否连接
 */
export const SocketIndicator = () => {
	const { isConnected } = useSocket()

	if (!isConnected) {
		return (
			<Badge variant='outline' className='bg-yellow-600 text-white border-none'>
				Fallback: Polling every 1s
			</Badge>
		)
	}
	return (
		<Badge variant='outline' className='bg-emerald-600 text-white border-none'>
			Live: Real-time updates
		</Badge>
	)
}
