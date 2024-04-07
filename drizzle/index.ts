import { drizzle } from 'drizzle-orm/d1'
import { AutoRouter, type IRequest, error } from 'itty-router'
import * as schema from "./schema"
import { posts, comments } from "./schema"
import { eq } from 'drizzle-orm'

type CFArgs = [Env, ExecutionContext]

export const router = AutoRouter<IRequest, CFArgs>()

router
	.get("/posts", async (req, env) => {
		const db = drizzle(env.DB, { schema })

		const data = await db.query.posts.findMany({
			with: {
				comments: true
			}
		})
		return data
	})
	.get("/post/:id", async (req, env) => {
		const db = drizzle(env.DB, { schema })
		const postId = Number(req.params.id)
		if (Number.isNaN(postId))
			return error(400, { message: "invalid post ID" })

		const data = await db.query.posts.findFirst({
			where: eq(posts.id, postId)
		})
		return data
	})
	.delete("/post/:id", async (req, env) => {
		const db = drizzle(env.DB, { schema })
		const postId = Number(req.params.id)
		if (Number.isNaN(postId))
			return error(400, { message: "invalid post ID" })

		const data = await db.query.posts.findFirst({
			where: eq(posts.id, postId)
		})
		if (!data) return error(404, { message: "post not found" })
		await db.delete(posts).where(eq(posts.id, postId))
		return { status: "ok" }
	})

export default { ...router }