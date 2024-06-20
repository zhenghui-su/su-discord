"use client"

import axios from "axios"
import qs from "query-string"
import {
	Check,
	Gavel,
	Loader2,
	MoreVertical,
	Shield,
	ShieldAlert,
	ShieldCheck,
	ShieldQuestion,
} from "lucide-react"
import { useState } from "react"
import { MemberRole } from "@prisma/client"

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"

import { useModalStore } from "@/hooks/use-modal-store"
import { ServerWithMembersWithProfiles } from "@/types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UserAvatar } from "@/components/user-avatar"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuPortal,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuTrigger,
	DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

/**
 * 角色图标映射Map
 */
const roleIconMap = {
	GUEST: null,
	MODERATOR: <ShieldCheck className='w-4 h-4 ml-2 text-indigo-500' />,
	ADMIN: <ShieldAlert className='w-4 h-4 text-rose-500' />,
}

/**
 *
 * @returns 成员管理对话框
 */
export const MembersModal = () => {
	const router = useRouter()
	const { onOpen, isOpen, onClose, type, data } = useModalStore()
	const [loadingId, setLoadingId] = useState("")

	const isModalOpen = isOpen && type === "members"
	// 当前服务的数据
	const { server } = data as { server: ServerWithMembersWithProfiles }

	/**
	 * 对成员所属角色的更改函数
	 *
	 * @param memberId 成员id
	 * @param role 要更改的角色
	 */
	const onRoleChange = async (memberId: string, role: MemberRole) => {
		try {
			setLoadingId(memberId)
			// query-string 能将传入的json形式转为url形式,如下示例
			// qs.stringify({name: 'jim', age: 22}); => 'age=22&name=jim'
			const url = qs.stringifyUrl({
				url: `/api/members/${memberId}`,
				query: {
					serverId: server?.id,
				},
			})

			const response = await axios.patch(url, { role })

			router.refresh()
			onOpen("members", { server: response.data })
		} catch (error) {
			console.log(error)
		} finally {
			setLoadingId("")
		}
	}
	/**
	 * 将成员踢走
	 */
	const onKick = async (memberId: string) => {
		try {
			setLoadingId(memberId)
			const url = qs.stringifyUrl({
				url: `/api/members/${memberId}`,
				query: {
					serverId: server?.id,
					memberId,
				},
			})

			const response = await axios.delete(url)

			router.refresh()
			onOpen("members", { server: response.data })
		} catch (error) {
			console.log(error)
		} finally {
			setLoadingId("")
		}
	}

	return (
		<Dialog open={isModalOpen} onOpenChange={onClose}>
			<DialogContent className='bg-white text-black overflow-hidden'>
				<DialogHeader className='pt-8 px-6'>
					<DialogTitle className='text-2xl text-center font-bold'>
						Manage Members
					</DialogTitle>
					<DialogDescription className='text-center text-zinc-500'>
						{server?.members?.length} Members
					</DialogDescription>
				</DialogHeader>
				<ScrollArea className='mt-8 max-h-[420px] pr-6'>
					{/* 成员列表 */}
					{server?.members?.map((member) => (
						<div key={member.id} className='flex items-center gap-x-2 mb-6'>
							{/* 头像 */}
							<UserAvatar src={member.profile.imageUrl} />
							<div className='flex flex-col gap-y-1'>
								<div className='text-xs font-semibold flex items-center gap-x-1'>
									{/* 名字 */}
									{member.profile.name}
									{/* 角色图标 */}
									{roleIconMap[member.role]}
								</div>
								{/* 邮箱 */}
								<p className='text-xs text-zinc-500'>{member.profile.email}</p>
							</div>
							{/* 对成员的操作 */}
							{server.profileId !== member.profileId &&
								loadingId !== member.id && (
									<div className='ml-auto'>
										<DropdownMenu>
											<DropdownMenuTrigger>
												<MoreVertical className='w-4 h-4 text-zinc-500' />
											</DropdownMenuTrigger>
											<DropdownMenuContent side='left'>
												<DropdownMenuSub>
													<DropdownMenuSubTrigger className='flex items-center'>
														<ShieldQuestion className='w-4 h-4 mr-2' />
														<span>Role</span>
													</DropdownMenuSubTrigger>
													<DropdownMenuPortal>
														<DropdownMenuSubContent>
															{/* 设置为普通成员 */}
															<DropdownMenuItem
																onClick={() => onRoleChange(member.id, "GUEST")}
															>
																<Shield className='w-4 h-4 mr-2' />
																Guest
																{member.role === "GUEST" && (
																	<Check className='w-4 h-4 ml-auto' />
																)}
															</DropdownMenuItem>
															{/* 设置为主持人 */}
															<DropdownMenuItem
																onClick={() =>
																	onRoleChange(member.id, "MODERATOR")
																}
															>
																<ShieldCheck className='w-4 h-4 mr-2' />
																Moderator
																{member.role === "MODERATOR" && (
																	<Check className='w-4 h-4 ml-auto' />
																)}
															</DropdownMenuItem>
														</DropdownMenuSubContent>
													</DropdownMenuPortal>
												</DropdownMenuSub>
												<DropdownMenuSeparator />
												{/* 踢走成员 */}
												<DropdownMenuItem onClick={() => onKick(member.id)}>
													<Gavel className='w-4 h-4 mr-2' />
													Kick
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								)}
							{/* 加载的旋转小动画 */}
							{loadingId === member.id && (
								<Loader2 className='animate-spin w-4 h-4 text-zinc-500 ml-auto' />
							)}
						</div>
					))}
				</ScrollArea>
			</DialogContent>
		</Dialog>
	)
}
