"use client"

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

/**
 *	用于服务器创建者删除服务器的对话框
 *
 * @returns 删除服务器对话框
 */
export const DeleteServerModal = () => {
	const { isOpen, onClose, type, data } = useModalStore()
	const router = useRouter()

	/**
	 * 对话框是否打开
	 */
	const isModalOpen = isOpen && type === "deleteServer"
	// 当前服务的数据
	const { server } = data

	const [isLoading, setIsLoading] = useState(false)

	const onClick = async () => {
		try {
			setIsLoading(true)

			await axios.delete(`/api/servers/${server?.id}`)

			onClose()
			router.refresh()
			router.push("/")
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
						Delete Server
					</DialogTitle>
					<DialogDescription className='text-center text-zinc-500'>
						Are you sure you want to do this ? <br />
						<span className='text-indigo-500 font-semibold'>
							{server?.name}
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
