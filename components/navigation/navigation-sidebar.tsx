import { redirect } from "next/navigation"

import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ModeToggle } from "@/components/mode-toggle"
import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db"

import { NavigationAction } from "./navigation-action"
import { NavigationItem } from "./navigation-item"
import { UserButton } from "@clerk/nextjs"

/**
 *
 * @returns 侧边栏
 */
export const NavigationSidebar = async () => {
	const profile = await currentProfile()

	if (!profile) {
		return redirect("/")
	}

	const servers = await db.server.findMany({
		where: {
			members: {
				some: {
					profileId: profile.id,
				},
			},
		},
	})

	return (
		<div
			className='space-y-4 flex flex-col items-center
    	h-full text-primary w-full dark:bg-[#1E1F22]  bg-[#E3E5E8] py-3'
		>
			{/* 头部添加按钮 */}
			<NavigationAction />
			{/* 分割线 */}
			<Separator
				className='h-[2px] bg-zinc-300 dark:bg-zinc-700
				rounded-md w-10 mx-auto'
			/>
			{/* 服务器列表 */}
			<ScrollArea className='flex-1 w-full'>
				{servers.map((server) => (
					<div key={server.id} className='mb-4'>
						<NavigationItem
							id={server.id}
							imageUrl={server.imageUrl}
							name={server.name}
						/>
					</div>
				))}
			</ScrollArea>
			<div className='pb-3 mt-auto flex items-center flex-col gap-y-4'>
				<ModeToggle />
				<UserButton
					afterSignOutUrl='/'
					appearance={{
						elements: {
							avatarBox: "h-[40px] w-[40px]",
						},
					}}
				/>
			</div>
		</div>
	)
}
