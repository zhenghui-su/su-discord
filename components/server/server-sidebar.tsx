import { Hash, Mic, ShieldAlert, ShieldCheck, Video } from "lucide-react"
import { ChannelType, MemberRole } from "@prisma/client"
import { redirect } from "next/navigation"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db"

import { ServerHeader } from "./server-header"
import { ServerSearch } from "./server-search"
import { ServerSection } from "./server-section"
import { ServerChannel } from "./server-channel"
import { ServerMember } from "./server-member"

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
				{/* 分割线 */}
				<Separator className='bg-zinc-200 dark:bg-zinc-700 rounded-md my-2' />
				{/* 服务器侧边栏-文本频道列表栏 */}
				{!!textChannels?.length && (
					<div className='mb-2'>
						{/* 只有版主和管理员会显示图标 */}
						<ServerSection
							label='Text Channels'
							role={role}
							sectionType='channels'
							channelType={ChannelType.TEXT}
						/>
						<div className='space-y-[2px]'>
							{/* 普通成员显示频道列表 */}
							{textChannels.map((channel) => (
								<ServerChannel
									key={channel.id}
									channel={channel}
									server={server}
									role={role}
								/>
							))}
						</div>
					</div>
				)}
				{/* 服务器侧边栏-语音频道列表栏 */}
				{!!audioChannels?.length && (
					<div className='mb-2'>
						{/* 只有版主和管理员会显示图标 */}
						<ServerSection
							label='Voice Channels'
							role={role}
							sectionType='channels'
							channelType={ChannelType.AUDIO}
						/>
						<div className='space-y-[2px]'>
							{/* 普通成员显示频道列表 */}
							{audioChannels.map((channel) => (
								<ServerChannel
									key={channel.id}
									channel={channel}
									server={server}
									role={role}
								/>
							))}
						</div>
					</div>
				)}
				{/* 服务器侧边栏-视频频道列表栏 */}
				{!!videoChannels?.length && (
					<div className='mb-2'>
						{/* 只有版主和管理员会显示图标 */}
						<ServerSection
							label='Video Channels'
							role={role}
							sectionType='channels'
							channelType={ChannelType.VIDEO}
						/>
						<div className='space-y-[2px]'>
							{/* 普通成员显示频道列表 */}
							{videoChannels.map((channel) => (
								<ServerChannel
									key={channel.id}
									channel={channel}
									server={server}
									role={role}
								/>
							))}
						</div>
					</div>
				)}
				{/* 服务器侧边栏-服务器成员列表栏 */}
				{!!members?.length && (
					<div className='mb-2'>
						{/* 只有版主和管理员会显示图标 */}
						<ServerSection
							label='Members'
							role={role}
							sectionType='members'
							server={server}
						/>
						{/* 普通成员显示频道列表 */}
						{members.map((member) => (
							<ServerMember key={member.id} member={member} server={server} />
						))}
					</div>
				)}
			</ScrollArea>
		</div>
	)
}
