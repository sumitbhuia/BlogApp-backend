import { Hono } from "hono";
import { getAllUsers, getUserById, signin, signup } from "../controller/userController";
import { authMiddleware } from "../middleware/user";
export const userRouter = new Hono();

userRouter.post('/signup', signup);
userRouter.post('/signin', signin);

userRouter.get('/allUsers', getAllUsers);
userRouter.get('/:id',authMiddleware, getUserById);