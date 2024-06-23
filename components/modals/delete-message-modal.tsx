"use client"

import qs from "query-string"
import axios from "axios"
import { useState } from "react"

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

/**
 *	用于删除聊天消息的对话框
 *
 * @returns 删除聊天消息对话框
 */
export const DeleteMessageModal = () => {
	const { isOpen, onClose, type, data } = useModalStore()

	/**
	 * 对话框是否打开
	 */
	const isModalOpen = isOpen && type === "deleteMessage"

	const { apiUrl, query } = data

	const [isLoading, setIsLoading] = useState(false)

	const onClick = async () => {
		try {
			setIsLoading(true)

			const url = qs.stringifyUrl({
				url: apiUrl || "",
				query,
			})

			await axios.delete(url)

			onClose()
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
						Delete Message
					</DialogTitle>
					<DialogDescription className='text-center text-zinc-500'>
						Are you sure you want to do this ? <br />
						The message will be permanently deleted.
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
