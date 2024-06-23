import { auth } from "@clerk/nextjs"

import { db } from "@/lib/db"
/**
 *
 * @returns 返回当前用户信息
 */
export const currentProfile = async () => {
	const { userId } = auth()

	if (!userId) {
		return null
	}

	const profile = await db.profile.findUnique({
		where: {
			userId,
		},
	})
	return profile // 返回用户信息
}
