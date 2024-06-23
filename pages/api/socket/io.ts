import { Server as NetServer } from "http"
import { NextApiRequest } from "next"
import { Server as ServerIO } from "socket.io"

import { NextApiResponseServerIo } from "@/types"

// 配置 API，禁用 bodyParser
// 在 Next.js 中，API 路由默认启用了 bodyParser
// 关闭后 Next.js 不会尝试解析请求体
export const config = {
	api: {
		bodyParser: false,
	},
}

// 服务端的websocket
const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {
	if (!res.socket.server.io) {
		// 检查是否已经存在 io 实例
		const path = "/api/socket/io" // 定义 Socket.IO 的路径
		const httpServer: NetServer = res.socket.server as any
		const io = new ServerIO(httpServer, {
			// 创建一个新的 Socket.IO 服务器实例
			path: path,
			// 保证路径没有尾部斜杠, 即不会出现 /api/socket/io/
			//@ts-ignore
			addTrailingSlash: false,
		})
		res.socket.server.io = io // 将 io 实例附加到 res.socket.server
	}
	res.end() // 结束响应
}

export default ioHandler
