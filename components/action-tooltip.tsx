"use client"

import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip"

interface ActionTooltipProps {
	children: React.ReactNode
	label: string
	side?: "top" | "right" | "bottom" | "left"
	align?: "start" | "center" | "end"
}

/**
 *
 * @param param0
 * @returns 鼠标悬浮提示组件
 */
export const ActionTooltip = ({
	children,
	label,
	side,
	align,
}: ActionTooltipProps) => {
	return (
		<TooltipProvider>
			<Tooltip delayDuration={50}>
				<TooltipTrigger asChild>{children}</TooltipTrigger>
				<TooltipContent side={side} align={align}>
					<p className='font-semibold text-sm capitalize'>
						{label.toLowerCase()}
					</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	)
}