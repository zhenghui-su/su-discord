"use client"

import { LiveKitRoom, VideoConference } from "@livekit/components-react"
import "@livekit/components-styles"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import axios from "axios"

interface MediaRoomProps {
	chatId: string
	video: boolean
	audio: boolean
}
/**
 * 音频视频聊天室
 * - 使用livekit
 *
 * @param param0
 * @returns
 */
export const MediaRoom = ({ chatId, video, audio }: MediaRoomProps) => {
	const { user } = useUser()
	const [token, setToken] = useState("")

	useEffect(() => {
		// 没有用户名就返回
		if (!user?.fullName) return

		async function getToken() {
			const resp = await axios.get(
				`/api/livekit?room=${chatId}&username=${user?.fullName}`
			)
			const data = resp.data
			console.log(data)
			// 设置token
			setToken(data.token)
		}

		getToken()
	}, [user?.fullName, chatId])
	// 没有就加载动画
	if (token === "") {
		return (
			<div className='flex flex-col flex-1 justify-center items-center'>
				<Loader2 className='h-7 w-7 text-zinc-500 animate-spin my-4' />
				<p className='text-xs text-zinc-500 dark:text-zinc-400'>Loading...</p>
			</div>
		)
	}

	return (
		<LiveKitRoom
			data-lk-theme='default'
			serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
			token={token}
			connect={true}
			video={video}
			audio={audio}
		>
			<VideoConference />
		</LiveKitRoom>
	)
}
