import { Router } from "express";
import {
  createPost,
  getAllPosts,
  updatePost,
  deletePost,
} from "../controller/postController.js";
import userAuth from "../middleware/userAuth.js";

const postRouter = Router();
postRouter.use(userAuth);

postRouter.post("/", createPost);
postRouter.get("/", getAllPosts);
postRouter.put("/:id", updatePost);
postRouter.delete("/:id", deletePost);

export default postRouter;
