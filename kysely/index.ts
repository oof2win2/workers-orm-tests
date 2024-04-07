import { AutoRouter, type IRequest, error } from "itty-router";
import { type Database } from "./schema";
import { Kysely, ParseJSONResultsPlugin } from "kysely";
import { D1Dialect } from "kysely-d1";
import { jsonArrayFrom } from "kysely/helpers/sqlite";

type CFArgs = [Env, ExecutionContext];

export const router = AutoRouter<IRequest, CFArgs>();

router
	.get("/posts", async (req, env) => {
		const db = new Kysely<Database>({
			dialect: new D1Dialect({ database: env.DB }),
			plugins: [new ParseJSONResultsPlugin()],
		});

		const data = await db
			.selectFrom("posts")
			.selectAll()
			.select((eb) => [
				jsonArrayFrom(eb
					.selectFrom("comments")
					.whereRef("comments.postId", "=", "posts.id")
					.select(["comments.id", "comments.content"]))
					.as("comments"),
			])
			.execute();
		return data;
	})
	.get("/post/:id", async (req, env) => {
		const db = new Kysely<Database>({
			dialect: new D1Dialect({ database: env.DB }),
			plugins: [new ParseJSONResultsPlugin()],
		});

		const postId = Number(req.params.id);
		if (Number.isNaN(postId)) return error(400, { message: "invalid post ID" });


		const data = await db
			.selectFrom("posts")
			.selectAll("posts")
			.select((eb) => [
				jsonArrayFrom(eb
					.selectFrom("comments")
					.whereRef("comments.postId", "=", "posts.id")
					.select(["comments.id", "comments.content"]))
					.as("comments"),
			])
			.where("posts.id", "=", postId)
			.limit(1)
			.executeTakeFirst();

		return data;
	})
	.delete("/post/:id", async (req, env) => {
		const db = new Kysely<Database>({
			dialect: new D1Dialect({ database: env.DB }),
			plugins: [new ParseJSONResultsPlugin()],
		});

		const postId = Number(req.params.id)
		if (Number.isNaN(postId))
			return error(400, { message: "invalid post ID" })

		const data = await db
			.selectFrom("posts")
			.selectAll("posts")
			.where("posts.id", "=", postId)
			.limit(1)
			.executeTakeFirst();
		if (!data) return error(404, { message: "post not found" })

		await db.deleteFrom("posts").where("posts.id", "=", postId).execute();
		return { status: "ok" }
	});

export default { ...router };
