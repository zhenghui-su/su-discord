"use client"

import qs from "query-string"
import axios from "axios"
import { useState } from "react"
import { useRouter } from "next/navigation"

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"

import { useModalStore } from "@/hooks/use-modal-store"
import { Button } from "@/components/ui/button"
import { url } from "inspector"

/**
 *	用于管理员和版主删除频道的对话框
 *
 * @returns 删除频道对话框
 */
export const DeleteChannelModal = () => {
	const { isOpen, onClose, type, data } = useModalStore()
	const router = useRouter()

	/**
	 * 对话框是否打开
	 */
	const isModalOpen = isOpen && type === "deleteChannel"
	// 当前的服务器和频道
	const { server, channel } = data

	const [isLoading, setIsLoading] = useState(false)

	const onClick = async () => {
		try {
			setIsLoading(true)

			const url = qs.stringifyUrl({
				url: `/api/channels/${channel?.id}`,
				query: {
					serverId: server?.id,
				},
			})

			await axios.delete(url)

			onClose()
			router.refresh()
			router.push(`/servers/${server?.id}`)
		} catch (error) {
			console.error(error)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<Dialog open={isModalOpen} onOpenChange={onClose}>
			<DialogContent className='bg-white text-black p-0 overflow-hidden'>
				<DialogHeader className='pt-8 px-6'>
					<DialogTitle className='text-2xl text-center font-bold'>
						Delete Channel
					</DialogTitle>
					<DialogDescription className='text-center text-zinc-500'>
						Are you sure you want to do this ? <br />
						<span className='text-indigo-500 font-semibold'>
							#{channel?.name}
						</span>{" "}
						will be permanently deleted.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className='bg-gray-100 px-6 py-4'>
					<div className='flex items-center justify-between w-full'>
						<Button disabled={isLoading} onClick={onClose} variant='ghost'>
							Cancel
						</Button>
						<Button disabled={isLoading} onClick={onClick} variant='primary'>
							Confirm
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}