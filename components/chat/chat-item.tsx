"use client"

import * as z from "zod"
import axios from "axios"
import qs from "query-string"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Member, MemberRole, Profile } from "@prisma/client"
import { Edit, FileIcon, ShieldAlert, ShieldCheck, Trash } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"

import { UserAvatar } from "@/components/user-avatar"
import { ActionTooltip } from "@/components/action-tooltip"
import { cn } from "@/lib/utils"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useModalStore } from "@/hooks/use-modal-store"

interface ChatItemProps {
	id: string
	content: string
	member: Member & {
		profile: Profile
	}
	timestamp: string
	fileUrl: string | null
	deleted: boolean
	currentMember: Member
	isUpdated: boolean
	socketUrl: string
	socketQuery: Record<string, string>
}
/**
 * 成员所属角色图标映射Map
 */
const roleIconMap = {
	GUEST: null,
	MODERATOR: <ShieldCheck className='h-4 w-4 ml-2 text-indigo-500' />,
	ADMIN: <ShieldAlert className='h-4 w-4 ml-2 text-rose-500' />,
}
/**
 * 表单校验模板
 */
const formSchema = z.object({
	content: z.string().min(1),
})
/**
 * 消息列表-单条消息组件
 *
 * @param param0
 * @returns
 */
export const ChatItem = ({
	id,
	content,
	member,
	timestamp,
	fileUrl,
	deleted,
	currentMember,
	isUpdated,
	socketUrl,
	socketQuery,
}: ChatItemProps) => {
	const { onOpen } = useModalStore()
	const [isEditing, setIsEditing] = useState(false)
	const params = useParams()
	const router = useRouter()

	// 按下回车键,取消编辑状态
	useEffect(() => {
		const handleKeyDown = (event: any) => {
			if (event.key === "Escape" || event.keyCode === 27) {
				setIsEditing(false)
			}
		}

		window.addEventListener("keydown", handleKeyDown)

		return () => window.removeEventListener("keyDown", handleKeyDown)
	}, [])

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			content: content,
		},
	})

	const isLoading = form.formState.isSubmitting
	/**
	 * 编辑消息的提交函数
	 *
	 * @param values
	 */
	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		try {
			const url = qs.stringifyUrl({
				url: `${socketUrl}/${id}`,
				query: socketQuery,
			})

			await axios.patch(url, values)

			form.reset()
			setIsEditing(false)
		} catch (error) {
			console.log(error)
		}
	}
	// 消息变化重新设置
	useEffect(() => {
		form.reset({
			content: content,
		})
	}, [form, content])

	/**
	 * 点击消息中的名字或头像跳转至两个人的聊天页面
	 */
	const onMemberClick = () => {
		// 自己与自己不能聊天
		if (member.id === currentMember.id) {
			return
		}

		router.push(`/servers/${params?.serverId}/conversations/${member.id}`)
	}

	/**
	 * 文件的类型
	 */
	const fileType = fileUrl?.split(".").pop()

	/**
	 * 是否是管理员
	 */
	const isAdmin = currentMember.role === MemberRole.ADMIN
	/**
	 * 是否是版主
	 */
	const isModerator = currentMember.role === MemberRole.MODERATOR
	/**
	 * 是否是消息发布者
	 */
	const isOwner = currentMember.id === member.id
	/**
	 * 是否可以删除消息
	 */
	const canDeleteMessage = !deleted && (isAdmin || isModerator || isOwner)
	/**
	 * 是否可以编辑消息
	 */
	const canEditMessage = !deleted && isOwner && !fileUrl
	/**
	 * 消息是否是pdf文件
	 */
	const isPDF = fileType === "pdf" && fileUrl
	/**
	 * 消息是否是图片文件
	 */
	const isImage = !isPDF && fileType

	return (
		<div
			className='relative group flex items-center
    hover:bg-black/5 p-4 transition w-full'
		>
			<div className='group flex items-start gap-x-2 w-full'>
				<div
					onClick={onMemberClick}
					className='cursor-pointer hover:drop-shadow-md transition'
				>
					{/* 头像 */}
					<UserAvatar src={member.profile.imageUrl} />
				</div>
				<div className='flex flex-col w-full'>
					<div className='flex items-center gap-x-2'>
						<div className='flex items-center'>
							{/* 成员名字 */}
							<p
								onClick={onMemberClick}
								className='font-semibold text-sm hover:underline cursor-pointer'
							>
								{member.profile.name}
							</p>
							{/* 成员角色 */}
							<ActionTooltip label={member.role}>
								{roleIconMap[member.role]}
							</ActionTooltip>
						</div>
						{/* 发言时间 */}
						<span className='text-xs text-zinc-500 dark:text-zinc-400'>
							{timestamp}
						</span>
					</div>
					{/* 成员所发的图片消息 */}
					{isImage && (
						<a
							//@ts-ignore
							href={fileUrl}
							target='_blank'
							rel='noopener noreferrer'
							className='relative aspect-square rounded-md mt-2 overflow-hidden border flex items-center bg-secondary h-48 w-48'
						>
							<Image
								//@ts-ignore
								src={fileUrl}
								alt={content}
								fill
								className='object-cover'
							/>
						</a>
					)}
					{/* 成员所发的pdf文件消息 */}
					{isPDF && (
						<div className='relative flex items-center p-2 mt-2 rounded-md bg-background/10'>
							<FileIcon className='h-10 w-10 fill-indigo-200 stroke-indigo-400' />
							<a
								href={fileUrl}
								target='_blank'
								rel='noopener noreferrer'
								className='ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline'
							>
								PDF File
							</a>
						</div>
					)}
					{/* 成员所发的普通消息-且当前用户不能编辑的显示消息内容 */}
					{!fileUrl && !isEditing && (
						<p
							className={cn(
								"text-sm text-zinc-600 dark:text-zinc-300",
								deleted &&
									"italic text-zinc-500 dark:text-zinc-400 text-xs mt-1"
							)}
						>
							{content}
							{isUpdated && !deleted && (
								<span className='text-[10px] mx-2 text-zinc-500 dark:text-zinc-400'>
									(edited)
								</span>
							)}
						</p>
					)}
					{/* 成员所发的普通消息-且当前用户可以编辑的显示消息内容 */}
					{!fileUrl && isEditing && (
						<Form {...form}>
							<form
								className='flex items-center w-full gap-x-2 pt-2'
								onSubmit={form.handleSubmit(onSubmit)}
							>
								<FormField
									control={form.control}
									name='content'
									render={({ field }) => (
										<FormItem className='flex-1'>
											<FormControl>
												<div className='relative w-full'>
													<Input
														disabled={isLoading}
														className='p-2 bg-zinc-200/90 dark:bg-zinc-700/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200'
														placeholder='Edited message'
														{...field}
													/>
												</div>
											</FormControl>
										</FormItem>
									)}
								/>
								<Button disabled={isLoading} size='sm' variant='primary'>
									Save
								</Button>
							</form>
							<span className='text-[10px] mt-1 text-zinc-400'>
								Press escape to cancel, enter to save
							</span>
						</Form>
					)}
				</div>
			</div>
			{/* 成员所发的消息-且当前用户可以删除的显示内容 */}
			{canDeleteMessage && (
				<div className='hidden group-hover:flex items-center gap-x-2 absolute p-1 -top-2 right-5 bg-white dark:bg-zinc-800 border rounded-sm'>
					{canEditMessage && (
						<ActionTooltip label='Edit'>
							<Edit
								onClick={() => setIsEditing(true)}
								className='cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition'
							/>
						</ActionTooltip>
					)}
					<ActionTooltip label='Delete'>
						<Trash
							onClick={() =>
								onOpen("deleteMessage", {
									apiUrl: `${socketUrl}/${id}`,
									query: socketQuery,
								})
							}
							className='cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition'
						/>
					</ActionTooltip>
				</div>
			)}
		</div>
	)
}
