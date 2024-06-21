import { useEffect, useState } from "react"

/**
 * 用于判断用户的操作系统
 *
 * @returns 返回当前用户的操作系统
 */
export const useOS = (): string => {
	const [os, setOS] = useState<string>("Other")

	useEffect(() => {
		const userAgent = window.navigator.userAgent
		if (userAgent.indexOf("Mac") !== -1) {
			setOS("Mac")
		} else if (userAgent.indexOf("Windows") !== -1) {
			setOS("Windows")
		}
	}, [])

	return os
}
