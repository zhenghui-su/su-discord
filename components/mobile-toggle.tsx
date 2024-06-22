import { Menu } from "lucide-react"

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { NavigationSidebar } from "@/components/navigation/navigation-sidebar"
import { ServerSidebar } from "@/components/server/server-sidebar"

/**
 * 用于移动设备-如果视口过小就显示菜单组件,点击后显示侧边栏先相关
 *
 * @returns 菜单公共组件
 */
export const MobileToggle = ({ serverId }: { serverId: string }) => {
	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant='ghost' className='md:hidden'>
					<Menu />
				</Button>
			</SheetTrigger>
			<SheetContent side='left' className='p-0 flex gap-0'>
				<div className='w-[72px]'>
					<NavigationSidebar />
				</div>
				<ServerSidebar serverId={serverId} />
			</SheetContent>
		</Sheet>
	)
}
