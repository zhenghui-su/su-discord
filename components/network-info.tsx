"use client";

import { Badge } from "@/components/ui/badge";
import { useState } from "react";

function getNetworkInfo() {
	let info;
	if ("connection" in window.navigator) {
		if (navigator.onLine) {
			info = {
				type: (navigator as any).connection.effectiveType,
				rtt: (navigator as any).connection.rtt,
				downlink: (navigator as any).connection.downlink
			};
		} else {
			info = {
				type: "offline"
			};
		}
		return info;
	} else {
		info = {
			type: "none"
		};
	}
}
/**
 * WebSocket连接显示组件
 * - 在聊天界面右上角位置
 * - 用于显示socket服务是否连接
 */
export const NetworkInfo = () => {
	const [networkInfo, setNetworkInfo] = useState<any>(getNetworkInfo());
	if (networkInfo.type === "none") {
		return null;
	}
	// @ts-ignore
	window.navigator.connection.addEventListener("change", () => {
		setNetworkInfo(getNetworkInfo());
	});

	if (networkInfo.type === "offline") {
		return (
			<Badge
				variant="outline"
				className="bg-yellow-600 text-white border-none mr-1"
			>
				OffLine: Not Network Available
			</Badge>
		);
	}

	return (
		<Badge
			variant="outline"
			className="bg-emerald-600 text-white border-none mr-1"
		>
			{networkInfo.type}: {networkInfo.rtt}ms
		</Badge>
	);
};
