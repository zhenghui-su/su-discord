module.exports = {
	apps: [
		{
			name: "su-discord",
			script: "npm",
			args: "start",
			instances: "max",
			autorestart: true,
			watch: true,
			max_memory_restart: "1G",
			env: {
				NODE_ENV: "production",
				NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
					process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
				CLERK_SECRET_KEY: sk_test_mvEIKtt4B3o0oWaKOI3farDK0PDI6uOu44d5Vnp5Z9,
				NEXT_PUBLIC_CLERK_SIGN_IN_URL:
					process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
				NEXT_PUBLIC_CLERK_SIGN_UP_URL:
					process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
				NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL:
					process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
				NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL:
					process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL,

				UPLOADTHING_SECRET: process.env.UPLOADTHING_SECRET,
				UPLOADTHING_APP_ID: process.env.UPLOADTHING_APP_ID,

				DATABASE_URL: process.env.DATABASE_URL,
			},
		},
	],
}
