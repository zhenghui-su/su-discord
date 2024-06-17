"use client"

import { Plus } from "lucide-react"

import { ActionTooltip } from "@/components/action-tooltip"
import { useModalStore } from "@/hooks/use-modal-store"
/**
 *
 * @returns 侧边栏顶部-添加按钮
 */
export const NavigationAction = () => {
	const { onOpen } = useModalStore()

	return (
		<div>
			<ActionTooltip label='Add a server' side='right' align='center'>
				<button
					onClick={() => onOpen("createServer")}
					className='group flex items-center'
				>
					<div
						className='flex mx-3 h-[48px] w-[48px] rounded-[24px]
          group-hover:rounded-[16px] transition-all overflow-hidden items-center
          justify-center bg-background dark:bg-neutral-700 group-hover:bg-emerald-500'
					>
						<Plus
							className=' group-hover:text-white transition text-emerald-500'
							size={25}
						/>
					</div>
				</button>
			</ActionTooltip>
		</div>
	)
}
