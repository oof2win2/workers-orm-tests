import { drizzle } from "drizzle-orm/d1";
import { AutoRouter, type IRequest, error } from "itty-router";
import { eq } from "drizzle-orm";

import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const posts = sqliteTable("posts", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	title: text("title"),
	content: text("content"),
});

export const comments = sqliteTable("comments", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	postId: integer("postId"),
	content: text("content"),
});

export const postRelations = relations(posts, ({ many }) => ({
	comments: many(comments),
}));

export const commentRelations = relations(comments, ({ one }) => ({
	post: one(posts, {
		fields: [comments.postId],
		references: [posts.id],
	}),
}));

type CFArgs = [Env, ExecutionContext];

export const router = AutoRouter<IRequest, CFArgs>();

router
	.get("/posts", async (req, env) => {
		const db = drizzle(env.DB, {
			schema: { comments, posts, commentRelations, postRelations },
		});

		const data = await db.query.posts.findMany({
			with: {
				comments: true,
			},
		});
		return data;
	})
	.get("/post/:id", async (req, env) => {
		const db = drizzle(env.DB, {
			schema: { comments, posts, commentRelations, postRelations },
		});
		const postId = Number(req.params.id);
		if (Number.isNaN(postId)) return error(400, { message: "invalid post ID" });

		const data = await db.query.posts.findFirst({
			where: eq(posts.id, postId),
		});
		return data;
	})
	.delete("/post/:id", async (req, env) => {
		const db = drizzle(env.DB, {
			schema: { comments, posts, commentRelations, postRelations },
		});
		const postId = Number(req.params.id);
		if (Number.isNaN(postId)) return error(400, { message: "invalid post ID" });

		const data = await db.query.posts.findFirst({
			where: eq(posts.id, postId),
		});
		if (!data) return error(404, { message: "post not found" });
		await db.delete(posts).where(eq(posts.id, postId));
		return { status: "ok" };
	});

export default { ...router };
