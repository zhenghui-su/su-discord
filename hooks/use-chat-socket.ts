import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Member, Message, Profile } from "@prisma/client"

import { useSocket } from "@/components/providers/socket-provider"

type ChatSocketProps = {
	addKey: string
	updateKey: string
	queryKey: string
}

type MessageWithMemberWithProfile = Message & {
	member: Member & {
		profile: Profile
	}
}

/**
 * 自定义hook，使用socket连接处理实时聊天更新。
 *
 * @param {ChatSocketProps} props - 聊天socket hook的属性。
 * @param {string} props.addKey - 添加新消息的socket事件键。
 * @param {string} props.updateKey - 更新现有消息的socket事件键。
 * @param {string} props.queryKey - react-query使用的查询键，用于聊天消息。
 * @returns {void}
 */
export const useChatSocket = ({
	addKey,
	updateKey,
	queryKey,
}: ChatSocketProps) => {
	const { socket } = useSocket()
	const queryClient = useQueryClient()

	useEffect(() => {
		if (!socket) {
			return
		}

		/**
		 * 更新消息的事件监听器。
		 *
		 * @param {MessageWithMemberWithProfile} message - 更新后的消息数据。
		 */
		socket.on(updateKey, (message: MessageWithMemberWithProfile) => {
			queryClient.setQueryData([queryKey], (oldData: any) => {
				if (!oldData || !oldData.pages || oldData.pages.length === 0) {
					return oldData
				}

				const newData = oldData.pages.map((page: any) => {
					return {
						...page,
						items: page.items.map((item: MessageWithMemberWithProfile) => {
							if (item.id === message.id) {
								return message
							}
							return item
						}),
					}
				})

				return {
					...oldData,
					pages: newData,
				}
			})
		})

		/**
		 * 添加新消息的事件监听器。
		 *
		 * @param {MessageWithMemberWithProfile} message - 新的消息数据。
		 */
		socket.on(addKey, (message: MessageWithMemberWithProfile) => {
			queryClient.setQueryData([queryKey], (oldData: any) => {
				if (!oldData || !oldData.pages || oldData.pages.length === 0) {
					return {
						pages: [
							{
								items: [message],
							},
						],
					}
				}

				const newData = [...oldData.pages]

				newData[0] = {
					...newData[0],
					items: [message, ...newData[0].items],
				}

				return {
					...oldData,
					pages: newData,
				}
			})
		})

		return () => {
			socket.off(addKey)
			socket.off(updateKey)
		}
	}, [queryClient, addKey, queryKey, socket, updateKey])
}
