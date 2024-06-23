import { useEffect, useState } from "react"

type ChatScrollProps = {
	chatRef: React.RefObject<HTMLDivElement>
	bottomRef: React.RefObject<HTMLDivElement>
	shouldLoadMore: boolean
	loadMore: () => void
	count: number
}

/**
 * 自定义hook，用于处理聊天窗口的滚动行为，每次只显示count条消息。
 *
 * @param {React.RefObject<HTMLDivElement>} props.chatRef - 聊天窗口的引用。
 * @param {React.RefObject<HTMLDivElement>} props.bottomRef - 聊天窗口底部的引用。
 * @param {boolean} props.shouldLoadMore - 是否需要加载更多消息的标志。
 * @param {() => void} props.loadMore - 加载更多消息的函数。
 * @param {number} props.count - 当前消息的数量。
 * @returns {void}
 */
export const useChatScroll = ({
	chatRef,
	bottomRef,
	shouldLoadMore,
	loadMore,
	count,
}: ChatScrollProps) => {
	const [hasInitialized, setHasInitialized] = useState(false)

	useEffect(() => {
		const topDiv = chatRef?.current

		/**
		 * 滚动事件处理函数。
		 */
		const handleScroll = () => {
			const scrollTop = topDiv?.scrollTop

			// 如果滚动到顶部且需要加载更多消息，则调用加载更多消息的函数
			if (scrollTop === 0 && shouldLoadMore) {
				loadMore()
			}
		}

		topDiv?.addEventListener("scroll", handleScroll)

		// 清除滚动事件监听器
		return () => {
			topDiv?.removeEventListener("scroll", handleScroll)
		}
	}, [chatRef, loadMore, shouldLoadMore])

	useEffect(() => {
		const bottomDiv = bottomRef?.current
		const topDiv = chatRef?.current

		/**
		 * 判断是否需要自动滚动到最新消息-即最底部
		 *
		 * @returns {boolean} - 是否需要自动滚动。
		 */
		const shouldAutoScroll = () => {
			// 初次渲染时，设置hasInitialized为true，并自动滚动到最新消息
			if (!hasInitialized && bottomDiv) {
				setHasInitialized(true)
				return true
			}

			// 如果聊天窗口未定义，返回false
			if (!topDiv) {
				return false
			}

			// 计算距离底部的距离
			const distanceFromBottom =
				topDiv.scrollHeight - topDiv.scrollTop - topDiv.clientHeight
			// 如果距离底部小于等于100px，返回true
			return distanceFromBottom <= 100
		}

		// 如果需要自动滚动，滚动到最新消息-即最底部
		if (shouldAutoScroll()) {
			setTimeout(() => {
				bottomRef?.current?.scrollIntoView({
					behavior: "smooth",
				})
			}, 100)
		}
	}, [bottomRef, chatRef, count, hasInitialized])
}
