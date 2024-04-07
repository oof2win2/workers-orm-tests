interface PostTable {
	id: number
	title: string
	content: string
}

interface CommentTable {
	id: number
	postId: number
	content: string
}

export interface Database {
	posts: PostTable
	comments: CommentTable
}