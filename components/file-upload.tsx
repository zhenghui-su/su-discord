"use client"

import { X } from "lucide-react"
import Image from "next/image"

import { UploadDropzone } from "@/lib/uploadthing"

import "@uploadthing/react/styles.css"

interface FileUploadProps {
	endpoint: "messageFile" | "serverImage"
	value: string
	onChange: (url?: string) => void
}
/**
 *
 * @param param0
 * @returns 上传图片组件
 */
const FileUpload = ({ endpoint, value, onChange }: FileUploadProps) => {
	const fileType = value?.split(".").pop()

	// 如果上传了图片，则预览上传的图片
	if (value && fileType !== "pdf") {
		return (
			<div className='relative h-20 w-20'>
				<Image fill src={value} alt='Upload' className='rounded-full' />
				<button
					onClick={() => onChange("")}
					className='bg-rose-500 text-white p-1 rounded-full
          absolute top-0 right-0 shadow-sm'
					type='button'
				>
					<X className='h-4 w-4' />
				</button>
			</div>
		)
	}

	return (
		// 上传图片
		<UploadDropzone
			endpoint={endpoint}
			onClientUploadComplete={(res) => {
				onChange(res?.[0].url)
			}}
			onUploadError={(error: Error) => {
				console.log("文件上传失败或文件大于4MB", error)
			}}
		/>
	)
}

export default FileUpload
