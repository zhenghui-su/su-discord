"use client"

import { useOS } from "@/hooks/use-os"

import { Search } from "lucide-react"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command"

interface ServerSearchProps {
	data:
		| {
				label: string
				type: "channel" | "member"
				data:
					| {
							icon: React.ReactNode
							name: string
							id: string
					  }[]
					| undefined
		  }[]
}

/**
 * ServerSearch 搜索栏组件
 */
export const ServerSearch = ({ data }: ServerSearchProps) => {
	const os = useOS()
	const [open, setOpen] = useState(false)
	const router = useRouter()
	const params = useParams()

	// 监听键盘事件，按下 cmd + k | ctrl + k 打开搜索框
	useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault()
				setOpen((open) => !open)
			}
		}
		document.addEventListener("keydown", down)
		return () => document.removeEventListener("keydown", down)
	}, [])

	// 点击搜索结果跳转到对应页面
	const onClick = ({
		id,
		type,
	}: {
		id: string
		type: "channel" | "member"
	}) => {
		setOpen(false)

		if (type === "channel") {
			return router.push(`/servers/${params?.serverId}/channels/${id}`)
		}

		if (type === "member") {
			return router.push(`/servers/${params?.serverId}/conversations/${id}`)
		}
	}

	return (
		<>
			<button
				onClick={() => setOpen(true)}
				className='group px-2 py-2 rounded-md flex
        items-center gap-x-2 w-full hover:bg-zinc-700/10
      dark:hover:bg-zinc-700/50 transition'
			>
				<Search className='w-4 h-4 text-zinc-500 dark:text-zinc-400' />
				<p
					className='font-semibold text-sm
          text-zinc-500 dark:text-zinc-400
          group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition'
				>
					Serach
				</p>
				{/* 搜索快捷提示角标 */}
				<kbd
					className='pointer-events-none inline-flexh-5 select-none
          items-center gap-1 rounded border bg-muted px-1.5 font-mono
          text-[10px] font-medium text-muted-foreground ml-auto'
				>
					{/* 根据用户操作系统显示对应操作 */}
					<span className='text-xs'>{os === "Mac" ? "⌘" : "CTRL"} + K</span>
				</kbd>
			</button>
			{/* 搜索对话框 */}
			<CommandDialog open={open} onOpenChange={setOpen}>
				<CommandInput placeholder='Search all channels and members' />
				<CommandList>
					{/* 无结果的展示 */}
					<CommandEmpty>No Results found</CommandEmpty>
					{data.map(({ label, type, data }) => {
						if (!data?.length) return null

						return (
							<CommandGroup key={label} heading={label}>
								{data?.map(({ id, name, icon }) => {
									return (
										<CommandItem
											key={id}
											onSelect={() => onClick({ id, type })}
										>
											{icon}
											<span>{name}</span>
										</CommandItem>
									)
								})}
							</CommandGroup>
						)
					})}
				</CommandList>
			</CommandDialog>
		</>
	)
}
