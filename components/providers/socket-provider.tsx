"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { io as ClientIO } from "socket.io-client"

// 定义 SocketContext 的类型，包括 socket 和 isConnected
type SocketContextType = {
	socket: any | null
	isConnected: boolean
}

// 创建 SocketContext，初始值为 null 和 false
const SocketContext = createContext<SocketContextType>({
	socket: null,
	isConnected: false,
})

/**
 * 自定义 Hook，用于使用 SocketContext
 * @returns {SocketContextType} 当前 SocketContext 的值
 */
export const useSocket = () => {
	return useContext(SocketContext)
}

/**
 * SocketProvider 组件，用于提供 Socket.IO 连接上下文
 * @param {React.ReactNode} children - 需要包裹在提供器中的子组件
 * @returns {JSX.Element} 包裹子组件的 SocketContext 提供器
 */
export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
	// 定义 state，用于存储 socket 实例和连接状态
	const [socket, setSocket] = useState(null)
	const [isConnected, setIsConnected] = useState(false)

	useEffect(() => {
		// 创建一个新的 Socket.IO 客户端实例
		const socketInstance = new (ClientIO as any)(
			process.env.NEXT_PUBLIC_SITE_URL!,
			{
				path: "/api/socket/io",
				addTrailingSlash: false,
			}
		)

		// 当连接成功时，更新连接状态
		socketInstance.on("connect", () => {
			setIsConnected(true)
		})

		// 当断开连接时，更新连接状态
		socketInstance.on("disconnect", () => {
			setIsConnected(false)
		})

		// 将 socket 实例存储在 state 中
		setSocket(socketInstance)

		// 组件卸载时，断开 socket 连接
		return () => {
			socketInstance.disconnect()
		}
	}, [])

	return (
		// 提供 socket 和连接状态给子组件
		<SocketContext.Provider value={{ socket, isConnected }}>
			{children}
		</SocketContext.Provider>
	)
}
