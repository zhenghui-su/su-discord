"use client"

import { ServerWithMembersWithProfiles } from "@/types"
import { MemberRole } from "@prisma/client"
import {
	ChevronDown,
	LogOut,
	PlusCircle,
	Settings,
	Trash,
	UserPlus,
	Users,
} from "lucide-react"

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useModalStore } from "@/hooks/use-modal-store"

// 如果不用这个扩展的类型, 只使用Server会发现找不到server.members
interface ServerHeaderProps {
	server: ServerWithMembersWithProfiles
	role?: MemberRole
}
export const ServerHeader = ({ server, role }: ServerHeaderProps) => {
	const { onOpen } = useModalStore()

	// 是否是管理员
	const isAdmin = role === MemberRole.ADMIN
	// 是否是主持人 管理员也同时可以是主持人
	const isModerator = isAdmin || role === MemberRole.MODERATOR

	return (
		<DropdownMenu>
			<DropdownMenuTrigger className='focus:outline-none' asChild>
				<button
					className='w-full text-md font-semibold px-3 flex
          items-center h-12 border-neutral-200
        dark:border-neutral-800 border-b-2 hover:bg-zinc-700/10
        dark:hover:bg-zinc-700/50 transition'
				>
					{server.name}
					<ChevronDown className='h-5 w-5 ml-auto' />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className='w-56 text-xs font-medium text-black
      dark:text-neutral-400 space-y-[2px]'
			>
				{/* 邀请成员 */}
				{isModerator && (
					<DropdownMenuItem
						onClick={() => onOpen("invite", { server })}
						className='text-indigo-600 dark:text-indigo-400
            px-3 py-2 text-sm cursor-pointer'
					>
						Invite People
						<UserPlus className='w-4 h-4 ml-auto' />
					</DropdownMenuItem>
				)}
				{/* 服务器管理 */}
				{isAdmin && (
					<DropdownMenuItem
						onClick={() => onOpen("editServer", { server })}
						className='px-3 py-2 text-sm cursor-pointer'
					>
						Server Settings
						<Settings className='w-4 h-4 ml-auto' />
					</DropdownMenuItem>
				)}
				{/* 成员管理 */}
				{isAdmin && (
					<DropdownMenuItem
						onClick={() => onOpen("members", { server })}
						className='px-3 py-2 text-sm cursor-pointer'
					>
						Manage Members
						<Users className='w-4 h-4 ml-auto' />
					</DropdownMenuItem>
				)}
				{/* 创建聊天通道 */}
				{isModerator && (
					<DropdownMenuItem
						onClick={() => onOpen("createChannel")}
						className='px-3 py-2 text-sm cursor-pointer'
					>
						Create Channel
						<PlusCircle className='w-4 h-4 ml-auto' />
					</DropdownMenuItem>
				)}
				{/* 分割线 */}
				{isModerator && <DropdownMenuSeparator />}
				{/* 删除服务器 */}
				{isAdmin && (
					<DropdownMenuItem className='text-rose-500 px-3 py-2 text-sm cursor-pointer'>
						Delete Server
						<Trash className='w-4 h-4 ml-auto' />
					</DropdownMenuItem>
				)}
				{/* 退出服务器 */}
				{!isAdmin && (
					<DropdownMenuItem
						onClick={() => onOpen("leaveServer", { server })}
						className='text-rose-500 px-3 py-2 text-sm cursor-pointer'
					>
						Leave Server
						<LogOut className='w-4 h-4 ml-auto' />
					</DropdownMenuItem>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
