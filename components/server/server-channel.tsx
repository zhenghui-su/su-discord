"use client"

import { Edit, Hash, Lock, Mic, Trash, Video } from "lucide-react"

import { cn } from "@/lib/utils"
import { ActionTooltip } from "@/components/action-tooltip"
import { ModalType, useModalStore } from "@/hooks/use-modal-store"

import { Channel, ChannelType, MemberRole, Server } from "@prisma/client"
import { useParams, useRouter } from "next/navigation"

interface ServerChannelProps {
	channel: Channel
	server: Server
	role?: MemberRole
}

/**
 * 频道图标映射Map
 */
const iconMap = {
	[ChannelType.TEXT]: Hash,
	[ChannelType.AUDIO]: Mic,
	[ChannelType.VIDEO]: Video,
}

/**
 * 服务器侧边栏-频道列表栏组件
 */
export const ServerChannel = ({
	channel,
	server,
	role,
}: ServerChannelProps) => {
	const { onOpen } = useModalStore()
	const router = useRouter()
	const params = useParams()

	/**
	 * 当前频道栏的图标
	 */
	const Icon = iconMap[channel.type]
	/**
	 * 当前频道栏的点击事件
	 * 点击后进入对应的聊天页面
	 */
	const onClick = () => {
		router.push(`/servers/${params?.serverId}/channels/${channel.id}`)
	}

	/**
	 * 用于防止捕获和冒泡事件, 因为该组件是由一个button包裹的
	 * 该button也有一个事件, 在我们编辑和删除时, 该button事件会覆盖原本的事件, 所以需要处理
	 */
	const onAction = (e: React.MouseEvent, action: ModalType) => {
		e.stopPropagation()
		onOpen(action, { server, channel })
	}

	return (
		<button
			onClick={onClick}
			className={cn(
				`group px-2 py-2 rounded-md flex items-center gap-x-2 w-full
       hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition mb-1`,
				params?.channelId === channel.id && "bg-zinc-700/20 dark:bg-zinc-700"
			)}
		>
			<Icon className='flex-shrink-0 w-5 h-5 text-zinc-500 dark:text-zinc-400' />
			<p
				className={cn(
					`line-clamp-1 font-semibold text-sm text-zinc-500
         group-hover:text-zinc-600 dark:text-zinc-400
         dark:group-hover:text-zinc-300 transition`,
					params?.channelId === channel.id &&
						"text-primary dark:text-zinc-200 dark:group-hover:text-white"
				)}
			>
				{channel.name}
			</p>
			{/* 创建的频道操作图标-只有版主和管理员可以对频道进行更改和删除 */}
			{channel.name !== "general" && role !== MemberRole.GUEST && (
				<div className='ml-auto flex items-center gap-x-2'>
					<ActionTooltip label='Edit'>
						<Edit
							onClick={(e) => onAction(e, "editChannel")}
							className='hidden group-hover:block w-4 h-4
            text-zinc-500 hover:text-zinc-600 dark:text-zinc-400
            dark:hover:text-zinc-300 transition'
						/>
					</ActionTooltip>
					<ActionTooltip label='Delete'>
						<Trash
							onClick={(e) => onAction(e, "deleteChannel")}
							className='hidden group-hover:block w-4 h-4
            text-zinc-500 hover:text-zinc-600 dark:text-zinc-400
            dark:hover:text-zinc-300 transition'
						/>
					</ActionTooltip>
				</div>
			)}
			{/* 初始的general操作图标 */}
			{channel.name === "general" && (
				<Lock className='ml-auto w-4 h-4 text-zinc-500 dark:text-zinc-400' />
			)}
		</button>
	)
}
