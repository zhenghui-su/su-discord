"use client"

import { Fragment } from "react"
import { format } from "date-fns"
import { Loader2, ServerCrash } from "lucide-react"
import { Member, Message, Profile } from "@prisma/client"

import { ChatWelcome } from "./chat-welcome"
import { useChatQuery } from "@/hooks/use-chat-query"
import { ChatItem } from "./chat-item"

/**
 * 日期格式化模板
 */
const DATE_FORMAT = "d MMM yyyy, HH:mm"

/**
 * 联合类型
 * 聊天消息包含发送成员及其个人资料类型
 */
type MessageWithMemberWithProfile = Message & {
	member: Member & {
		profile: Profile
	}
}

interface ChatMessagesProps {
	name: string
	member: Member
	chatId: string
	apiUrl: string
	socketUrl: string
	socketQuery: Record<string, string>
	paramKey: "channelId" | "conversationId"
	paramValue: string
	type: "channel" | "conversation"
}

/**
 * @returns 聊天界面-消息内容区域
 */
export const ChatMessages = ({
	name,
	member,
	chatId,
	apiUrl,
	socketUrl,
	socketQuery,
	paramKey,
	paramValue,
	type,
}: ChatMessagesProps) => {
	const queryKey = `chat:${chatId}`

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
		useChatQuery({
			queryKey,
			apiUrl,
			paramKey,
			paramValue,
		})

	if (status === "loading") {
		return (
			<div className='flex flex-col flex-1 justify-center items-center'>
				<Loader2 className='h-7 w-7 text-zinc-500 animate-spin my-4' />
				<p className='text-xs text-zinc-500 dark:text-zinc-400'>
					Loading messages...
				</p>
			</div>
		)
	}

	if (status === "error") {
		return (
			<div className='flex flex-col flex-1 justify-center items-center'>
				<ServerCrash className='h-7 w-7 text-zinc-500 my-4' />
				<p className='text-xs text-zinc-500 dark:text-zinc-400'>
					Something went wrong!
				</p>
			</div>
		)
	}

	return (
		<div className='flex-1 flex flex-col py-4 overflow-y-auto'>
			<div className='flex-1' />
			{/* 欢迎内容 */}
			<ChatWelcome type={type} name={name} />
			<div className='flex flex-col-reverse mt-auto'>
				{/* 消息列表 */}
				{data?.pages?.map((group, i) => (
					<Fragment key={i}>
						{group.items.map((message: MessageWithMemberWithProfile) => (
							<ChatItem
								key={message.id}
								id={message.id}
								currentMember={member}
								member={message.member}
								content={message.content}
								fileUrl={message.fileUrl}
								deleted={message.deleted}
								timestamp={format(new Date(message.createdAt), DATE_FORMAT)}
								isUpdated={message.updatedAt !== message.createdAt}
								socketUrl={socketUrl}
								socketQuery={socketQuery}
							/>
						))}
					</Fragment>
				))}
			</div>
		</div>
	)
}
