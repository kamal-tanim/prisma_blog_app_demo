import express, { Router } from "express";
import { PostController } from "./post.controller";
import auth from "../../middleware/auth";
import { UserRole } from "../../enum/UserRole";

const router = express.Router();



router.post(
  "/",
  auth(UserRole.USER),
  PostController.createPost,
);

export const postRouter: Router = router;
