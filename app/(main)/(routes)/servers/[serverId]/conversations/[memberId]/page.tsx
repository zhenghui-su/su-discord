import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db"
import { getOrCreateConversation } from "@/lib/conversation"
import { ChatHeader } from "@/components/chat/chat-header"

interface MemberIdPageProps {
	params: {
		serverId: string
		memberId: string
	}
}
/**
 * 用于成员之间聊天的界面
 *
 * @param param0 传入服务器id和成员id
 * @returns 返回聊天界面
 */
const MemberIdPage = async ({ params }: MemberIdPageProps) => {
	const profle = await currentProfile()

	if (!profle) {
		return auth().redirectToSignIn()
	}

	/**
	 * 找到自己的成员信息
	 */
	const currentMember = await db.member.findFirst({
		where: {
			serverId: params.serverId,
			profileId: profle.id,
		},
		include: {
			profile: true,
		},
	})

	if (!currentMember) {
		return redirect("/")
	}

	/**
	 * 创建或找到对应的聊天对话
	 */
	const conversation = await getOrCreateConversation(
		currentMember.profileId,
		params.memberId
	)

	if (!conversation) {
		return redirect(`/servers/${params.serverId}`)
	}
	// 从聊天对话从获取两个成员
	const { memberOne, memberTwo } = conversation
	/**
	 * 找到另一个成员-即你所点击需要聊天的对方
	 */
	const otherMember = memberOne.profileId === profle.id ? memberTwo : memberOne

	return (
		<div className='bg-white dark:bg-[#313338] flex flex-col h-full'>
			{/* 成员聊天头部 */}
			<ChatHeader
				name={otherMember.profile.name}
				serverId={params.serverId}
				imageUrl={otherMember.profile.imageUrl}
				type='conversation'
			/>
		</div>
	)
}

export default MemberIdPage
