/*
 * @Author: 苏征辉 343196323@qq.com
 * @Date: 2024-06-17 22:18:51
 * @LastEditors: 苏征辉 343196323@qq.com
 * @Description: 对话框状态 Store
 */
import { create } from "zustand"

export type ModalType = "createServer"

interface ModalStore {
	type: ModalType | null
	isOpen: boolean
	onOpen: (type: ModalType) => void
	onClose: () => void
}
/**
 * 对话框状态 Store
 */
export const useModalStore = create<ModalStore>((set) => ({
	type: null,
	isOpen: false,
	onOpen: (type) => set(() => ({ type, isOpen: true })),
	onClose: () => set(() => ({ type: null, isOpen: false })),
}))
