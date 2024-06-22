import { Server as NetServer, Socket } from "net"
import { NextApiResponse } from "next"
import { Server as SocketIOServer } from "socket.io"
import { Server, Member, Profile } from "@prisma/client"

/**
 * 用一个"members"属性扩展"Server"类型
 * 该属性是一个带有"profile"属性的"Member"对象数组，该属性为"profile"对象。
 *
 * 用于表示服务器及其成员的类型。
 */
export type ServerWithMembersWithProfiles = Server & {
	members: (Member & { profile: Profile })[]
}

/**
 * 用一个"socket"属性扩展"NextApiResponse"类型
 * 该属性是一个带有"server"属性的"Socket"对象
 * Socket对象同时扩展了"server"属性，该属性是一个带有"io"属性的"NetServer"对象。
 * NetServer对象同时扩展了"io"属性，该属性是一个"SocketIOServer"对象。
 *
 * 用于表示WebSocket服务器res的类型
 */
export type NextApiResponseServerIo = NextApiResponse & {
	socket: Socket & {
		server: NetServer & {
			io: SocketIOServer
		}
	}
}
