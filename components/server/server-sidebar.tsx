import { Hash, Mic, ShieldAlert, ShieldCheck, Video } from "lucide-react"
import { ChannelType, MemberRole } from "@prisma/client"
import { redirect } from "next/navigation"

import { ScrollArea } from "@/components/ui/scroll-area"
import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db"

import { ServerHeader } from "./server-header"
import { ServerSearch } from "./server-search"

interface ServerSidebarProps {
	serverId: string
}
/**
 * 频道图标映射Map
 */
const iconMap = {
	[ChannelType.TEXT]: <Hash className='w-4 h-4 mr-2' />,
	[ChannelType.AUDIO]: <Mic className='w-4 h-4 mr-2' />,
	[ChannelType.VIDEO]: <Video className='w-4 h-4 mr-2' />,
}
/**
 * 成员所属角色图标映射Map
 */
const roleIconMap = {
	[MemberRole.GUEST]: null,
	[MemberRole.MODERATOR]: (
		<ShieldCheck className='w-4 h-4 mr-2 text-indigo-500' />
	),
	[MemberRole.ADMIN]: <ShieldAlert className='w-4 h-4 mr-2 text-rose-500' />,
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
			{/* 服务器侧边栏-头部 */}
			<ServerHeader server={server} role={role} />
			{/* 服务器侧边栏-搜索栏 */}
			<ScrollArea className='flex-1 px-3'>
				<div className='mt-2'>
					<ServerSearch
						data={[
							{
								label: "Text Channels",
								type: "channel",
								data: textChannels?.map((channel) => ({
									id: channel.id,
									name: channel.name,
									icon: iconMap[channel.type],
								})),
							},
							{
								label: "Audio Channels",
								type: "channel",
								data: audioChannels?.map((channel) => ({
									id: channel.id,
									name: channel.name,
									icon: iconMap[channel.type],
								})),
							},
							{
								label: "Video Channels",
								type: "channel",
								data: videoChannels?.map((channel) => ({
									id: channel.id,
									name: channel.name,
									icon: iconMap[channel.type],
								})),
							},
							{
								label: "Members",
								type: "member",
								data: members?.map((member) => ({
									id: member.id,
									name: member.profile.name,
									icon: roleIconMap[member.role],
								})),
							},
						]}
					/>
				</div>
			</ScrollArea>
		</div>
	)
}
