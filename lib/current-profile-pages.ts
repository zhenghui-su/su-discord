import { getAuth } from "@clerk/nextjs/server"
import { NextApiRequest } from "next"

import { db } from "@/lib/db"

/**
 * 用于在 pages 页面工作
 *
 * @returns 返回当前用户信息
 */
export const currentProfilePages = async (req: NextApiRequest) => {
	const { userId } = getAuth(req)

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
