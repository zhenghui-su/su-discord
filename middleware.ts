import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
// 以前是 authMiddleware, 默认保护所有路线
// 现在是 clerkMiddleware, 默认不保护所有路线, 需要手动添加保护路线
// 下面是默认保护所有路线的代码
const isPublicRoute = createRouteMatcher([
	"/sign-in(.*)",
	"/sign-up(.*)",
	"/api/uploadthing",
])

export default clerkMiddleware((auth, request) => {
	if (!isPublicRoute(request)) {
		auth().protect()
	}
})

export const config = {
	matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}
