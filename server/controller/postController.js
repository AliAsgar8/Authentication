import { db } from "../db/index.js";
import { posts } from "../db/schema.js";
import { eq } from "drizzle-orm";

export const createPost = async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: "Title and content are required" });
  }

  try {
    await db.insert(posts).values({
      title: title.trim(),
      content: content.trim(),
    });

    const allPosts = await db.select().from(posts);

    return res.status(201).json({
      message: "Post created",
      post: allPosts[allPosts.length - 1],
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const allPosts = await db.select().from(posts);
    return res.status(200).json({ posts: allPosts });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updatePost = async (req, res) => {
  const { title, content } = req.body;
  const id = Number(req.params.id);

  if (!title || !content) {
    return res.status(400).json({ message: "Title and content are required" });
  }

  try {
    const [existing] = await db.select().from(posts).where(eq(posts.id, id));
    if (!existing) {
      return res.status(404).json({ message: "Post not found" });
    }

    await db
      .update(posts)
      .set({ title: title.trim(), content: content.trim() })
      .where(eq(posts.id, id));

    const [updated] = await db.select().from(posts).where(eq(posts.id, id));
    return res.status(200).json({ message: "Post updated", post: updated });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deletePost = async (req, res) => {
  const id = Number(req.params.id);

  try {
    const [existing] = await db.select().from(posts).where(eq(posts.id, id));
    if (!existing) {
      return res.status(404).json({ message: "Post not found" });
    }

    await db.delete(posts).where(eq(posts.id, id));
    return res.status(200).json({ message: "Post deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
