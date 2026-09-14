import { Router } from "express";
import { getUserDetails } from "../controller/userController.js";
import userAuth from "../middleware/userAuth.js";

const userRouter = Router();

userRouter.get("/get-user", userAuth, getUserDetails);

export default userRouter;