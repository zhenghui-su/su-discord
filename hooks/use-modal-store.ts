/*
 * @Author: 苏征辉 343196323@qq.com
 * @Date: 2024-06-17 22:18:51
 * @LastEditors: 苏征辉 343196323@qq.com
 * @Description: 对话框状态 Store
 */
import { Server } from "@prisma/client"
import { create } from "zustand"

export type ModalType = "createServer" | "invite" | "editServer" | "members"

interface ModalData {
	server?: Server
}

interface ModalStore {
	type: ModalType | null
	data: ModalData
	isOpen: boolean
	onOpen: (type: ModalType, data?: ModalData) => void
	onClose: () => void
}
/**
 * 对话框状态 Store
 */
export const useModalStore = create<ModalStore>((set) => ({
	type: null,
	data: {},
	isOpen: false,
	onOpen: (type, data = {}) => set(() => ({ type, isOpen: true, data })),
	onClose: () => set(() => ({ type: null, isOpen: false })),
}))
