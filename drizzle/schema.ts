import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const posts = sqliteTable("posts", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	title: text("title"),
	content: text("content"),
})

export const comments = sqliteTable("comments", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	postId: integer("postId"),
	content: text("content"),
})

export const postRelations = relations(posts, ({ many }) => ({
	comments: many(comments)
}))

export const commentRelations = relations(comments, ({ one }) => ({
	post: one(posts, {
		fields: [comments.postId],
		references: [posts.id]
	})
}))