import { Hash } from "lucide-react"

interface ChatWelcomeProps {
	name: string
	type: "channel" | "conversation"
}
/**
 *  用于显示频道或成员聊天欢迎内容
 *
 * @param param0 传入名称和类型
 * @returns 返回欢迎内容
 */
export const ChatWelcome = ({ name, type }: ChatWelcomeProps) => {
	return (
		<div className='space-y-2 px-4 mb-4'>
			{type === "channel" && (
				<div className='h-[75px] w-[75px] rounded-full bg-zinc-500 dark:bg-zinc-700 flex items-center justify-center'>
					<Hash className='h-12 w-12 text-white' />
				</div>
			)}
			<p className='text-xl md:text-3xl font-bold'>
				{type === "channel" ? "Welcome to #" : ""}
				{name}
			</p>
			<p className='text-zinc-600 dark:text-zinc-400 text-sm'>
				{type === "channel"
					? `This is the start of the #${name} channel.`
					: `This is the start of your conversation with ${name}`}
			</p>
		</div>
	)
}
