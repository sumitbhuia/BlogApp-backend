import { Hono } from "hono";
import { createPost, deletePostById, getAllPosts, getPostById, getUserPosts, updatePostById } from "../controller/postController";
import { authMiddleware } from "../middleware/user";
export const postRouter = new Hono();

postRouter.get('/allPosts', getAllPosts);
postRouter.get('/userPosts',authMiddleware, getUserPosts);
postRouter.post('/createPost',authMiddleware, createPost);
postRouter.get('/:id',authMiddleware, getPostById);
postRouter.put('/update/:id',authMiddleware, updatePostById);
postRouter.delete('/delete/:id',authMiddleware, deletePostById);