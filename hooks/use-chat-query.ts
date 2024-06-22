import qs from "query-string"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useSocket } from "@/components/providers/socket-provider"

interface ChatQueryProps {
	queryKey: string
	apiUrl: string
	paramKey: "channelId" | "conversationId"
	paramValue: string
}

/**
 * 自定义 Hook，用于处理聊天消息的无限查询
 * @param {ChatQueryProps} props - 包含查询键、API URL、参数键和值的对象
 * @param {string} props.queryKey - 查询的键，用于缓存和标识查询
 * @param {string} props.apiUrl - 用于获取消息的 API URL
 * @param {"channelId" | "conversationId"} props.paramKey - 用于查询的参数键，可以是 "channelId" 或 "conversationId"
 * @param {string} props.paramValue - 对应 paramKey 的参数值
 * @returns {Object} - 返回一个对象，其中包含查询数据和一些控制查询状态的方法和属性
 * @returns {Array} data - 查询返回的数据
 * @returns {Function} fetchNextPage - 用于获取下一页数据的方法
 * @returns {boolean} hasNextPage - 是否有下一页数据的标识
 * @returns {boolean} isFetchingNextPage - 是否正在获取下一页数据的标识
 * @returns {string} status - 查询的状态
 */
export const useChatQuery = ({
	queryKey,
	apiUrl,
	paramKey,
	paramValue,
}: ChatQueryProps) => {
	const { isConnected } = useSocket()

	/**
	 * 异步函数，用于获取消息数据
	 * @param {Object} pageParam - 用于分页查询的参数
	 * @returns {Promise<Object>} - 返回包含消息数据的 Promise
	 */
	const fetchMessages = async ({ pageParam = undefined }) => {
		const url = qs.stringifyUrl(
			{
				url: apiUrl,
				query: {
					cursor: pageParam,
					[paramKey]: paramValue,
				},
			},
			{ skipNull: true }
		)

		const res = await fetch(url)
		return res.json()
	}

	// 使用 useInfiniteQuery 来处理无限滚动或加载更多数据的查询
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
		useInfiniteQuery({
			queryKey: [queryKey],
			queryFn: fetchMessages,
			getNextPageParam: (lastPage) => lastPage?.nextCursor,
			// 如果socket连接失败通过网络查询消息
			refetchInterval: isConnected ? false : 1000,
		})

	return {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		status,
	}
}
