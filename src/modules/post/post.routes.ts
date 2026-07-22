import express, { Router } from "express";
import { postController } from "./post.controller";
import auth from "../../middleware/auth";
import { UserRole } from "../../enum/UserRole";

const router = express.Router();

router.post("/", auth(UserRole.USER), postController.createPost);

router.get("/", postController.getAllPost);

router.get("/:postId", postController.getPostById);

export const postRouter: Router = router;
