import { ChannelType } from "@prisma/client"
import { redirect } from "next/navigation"

import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db"

import { ServerHeader } from "./server-header"

interface ServerSidebarProps {
	serverId: string
}
/**
 *
 * @param param0 服务器的id
 * @returns 服务器列表侧边栏
 */
export const ServerSidebar = async ({ serverId }: ServerSidebarProps) => {
	const profile = await currentProfile()

	if (!profile) {
		redirect("/")
	}

	// 找寻对应服务器, 并加载各个通道如文本通道, 音频通道, 同时加载成员资料
	const server = await db.server.findUnique({
		where: {
			id: serverId,
		},
		include: {
			channels: {
				orderBy: {
					createdAt: "asc",
				},
			},
			members: {
				include: {
					profile: true,
				},
				orderBy: {
					role: "asc",
				},
			},
		},
	})

	// 确保 server 不为 null 或 undefined
	if (!server) {
		return redirect("/")
	}
	/**
	 * 文本通道
	 */
	const textChannels = server.channels?.filter(
		(channel) => channel.type === ChannelType.TEXT
	)
	/**
	 * 音频通道
	 */
	const audioChannels = server.channels?.filter(
		(channel) => channel.type === ChannelType.AUDIO
	)
	/**
	 * 视频通道
	 */
	const videoChannels = server.channels?.filter(
		(channel) => channel.type === ChannelType.VIDEO
	)
	/**
	 * 除自己外的成员
	 */
	const members = server.members?.filter(
		(member) => member.profileId !== profile.id
	)
	/**
	 * 自己在该服务器的角色
	 */
	const role = server.members?.find(
		(member) => member.profileId === profile.id
	)?.role

	return (
		<div
			className='flex flex-col h-full text-primary w-full 
      dark:bg-[#2B2D31] bg-[#F2F3F5]'
		>
			<ServerHeader server={server} role={role} />
		</div>
	)
}
