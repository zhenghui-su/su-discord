import { db } from "@/lib/db"

/**
 * 用于获取或创建两个成员之间的聊天内容
 *
 * @param memberOneId 第一个成员的id
 * @param memberTwoId 第二个成员的id
 * @returns 返回获取的聊天内容或返回新创建的聊天内容
 */
export const getOrCreateConversation = async (
	memberOneId: string,
	memberTwoId: string
) => {
	// 先寻找两个成员有没有聊天内容
	let conversation =
		(await findConversation(memberOneId, memberTwoId)) ||
		(await findConversation(memberTwoId, memberOneId))

	// 如果没有聊天内容,则需要创建新聊天
	if (!conversation) {
		conversation = await createNewConversation(memberOneId, memberTwoId)
	}
	return conversation
}

/**
 * 用于寻找两个成员之间聊天内容的函数
 *
 * @param memberOneId 第一个成员的id
 * @param memberTwoId 第二个成员的id
 * @returns 返回他们之间的聊天内容相关
 */
const findConversation = async (memberOneId: string, memberTwoId: string) => {
	try {
		return await db.conversation.findFirst({
			where: {
				AND: [{ memberOneId: memberOneId }, { memberTwoId: memberTwoId }],
			},
			include: {
				memberOne: {
					include: {
						profile: true,
					},
				},
				memberTwo: {
					include: {
						profile: true,
					},
				},
			},
		})
	} catch {
		return null
	}
}

/**
 * 用于两个成员之间创建新聊天
 *
 * @param memberOneId 第一个成员的id
 * @param memberTwoId 第二个成员的id
 * @returns 返回新创建的聊天内容相关
 */
const createNewConversation = async (
	memberOneId: string,
	memberTwoId: string
) => {
	try {
		return await db.conversation.create({
			data: {
				memberOneId,
				memberTwoId,
			},
			include: {
				memberOne: {
					include: {
						profile: true,
					},
				},
				memberTwo: {
					include: {
						profile: true,
					},
				},
			},
		})
	} catch {
		return null
	}
}
