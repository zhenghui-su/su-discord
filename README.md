## Introduce

This project uses Nextjs 13, React，Socket.io，Prisma，Zustand，Tailwind，Shadcn-ui，MySQL，Clerk，Zod，ReactQuery，Uploadthing，LiveKit

After the git clone, create an `.env` file and add the following content:

> You need to add your own key and database connection address

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY= your-clerk-key
CLERK_SECRET_KEY= your-clerk-key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

UPLOADTHING_SECRET=your-uploadthing-secret
UPLOADTHING_APP_ID=your-uploadthing-app-id

LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret

DATABASE_URL="mysql://your-name:your-password@host-address:port/database"
```

## Getting Started

First, run the development server:

```bash
npx prisma generate
npx prisma db push
```

These two commands will create a table and push it to a remote database

Second, you need to download and run according to your package manager:

```bash
# npm
npm install
npm run dev
# yarn
yarn
yarn run dev
# pnpm
pnpm install
pnpm run dev
```

Now, you can view this project
